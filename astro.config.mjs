// @ts-check
import { defineConfig } from 'astro/config';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const root = fileURLToPath(new URL('.', import.meta.url));
const volumesDir = join(root, 'content');
const publicChaptersDir = join(root, 'public/chapters');

/**
 * Copy chapter folders into public/ for static serving + iframe src.
 */
function syncContentToPublic() {
	if (!existsSync(volumesDir)) return;

	rmSync(publicChaptersDir, { recursive: true, force: true });
	mkdirSync(publicChaptersDir, { recursive: true });

	for (const entry of readdirSync(volumesDir, { withFileTypes: true })) {
		if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

		const volumePath = join(volumesDir, entry.name);
		const volumeYamlPath = join(volumePath, 'volume.yaml');
		if (!existsSync(volumeYamlPath)) continue;

		const volume = parseYaml(readFileSync(volumeYamlPath, 'utf8'));
		const volId = `${volume.number}-${volume.slug}`;

		const chapterDirs = Array.isArray(volume.chapters) ? volume.chapters : [];
		if (chapterDirs.length === 0) continue;

		chapterDirs.forEach((dirName, index) => {
			const chapterPath = join(volumePath, dirName);
			const metaPath = join(chapterPath, 'meta.yaml');
			const indexPath = join(chapterPath, 'index.html');
			if (!existsSync(metaPath) || !existsSync(indexPath)) {
				throw new Error(
					`Chapter "${dirName}" listed in ${volumeYamlPath} is missing meta.yaml or index.html`,
				);
			}

			const meta = parseYaml(readFileSync(metaPath, 'utf8'));
			const chId = `${index + 1}-${meta.slug}`;
			const dest = join(publicChaptersDir, volId, chId);
			mkdirSync(dirname(dest), { recursive: true });
			cpSync(chapterPath, dest, { recursive: true });
		});
	}
}

/** @type {import('astro').AstroIntegration} */
function contentSyncIntegration() {
	return {
		name: 'vibe-content-sync',
		hooks: {
			'astro:config:setup': () => {
				syncContentToPublic();
			},
			'astro:server:setup': ({ server }) => {
				syncContentToPublic();
				server.watcher.add(volumesDir);
				server.watcher.on('all', (_event, filePath) => {
					if (typeof filePath === 'string' && filePath.startsWith(volumesDir)) {
						syncContentToPublic();
					}
				});
			},
			'astro:build:start': () => {
				syncContentToPublic();
			},
		},
	};
}

/**
 * Chapters run in `<iframe sandbox="allow-scripts">`, which gives them an opaque
 * origin. Every asset they request therefore arrives as `Sec-Fetch-Site: cross-site`
 * with `Origin: null`, and the dev server's sec-fetch guard answers 403 — so
 * sprites, fonts and data files silently vanish during `astro dev` while working
 * perfectly in the static build.
 *
 * Dev only, and scoped to /chapters/ — the guard still covers every other route.
 */
function allowSandboxedChapterAssets() {
	return {
		name: 'vibe-allow-sandboxed-chapters',
		configureServer(server) {
			// Returning a function defers to after Astro has installed its own
			// middleware; unshifting then puts us genuinely first, which plugin
			// ordering alone does not guarantee.
			return () => {
				server.middlewares.stack.unshift({
					route: '',
					handle: (req, _res, next) => {
						if (req.url && req.url.startsWith('/chapters/')) {
							delete req.headers['sec-fetch-site'];
						}
						next();
					},
				});
			};
		},
	};
}

// https://astro.build/config
export default defineConfig({
	site: 'https://fold.vibecodingclub.kr',
	integrations: [contentSyncIntegration()],
	vite: {
		plugins: [allowSandboxedChapterAssets()],
	},
});
