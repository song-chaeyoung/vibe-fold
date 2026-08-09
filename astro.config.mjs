// @ts-check
import { defineConfig } from 'astro/config';
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const root = fileURLToPath(new URL('.', import.meta.url));
const volumesDir = join(root, 'content/volumes');
const publicChaptersDir = join(root, 'public/chapters');
const publicVolumesDir = join(root, 'public/volumes');

/**
 * Copy chapter folders and volume covers into public/ for static serving + iframe src.
 */
function syncContentToPublic() {
	if (!existsSync(volumesDir)) return;

	rmSync(publicChaptersDir, { recursive: true, force: true });
	rmSync(publicVolumesDir, { recursive: true, force: true });
	mkdirSync(publicChaptersDir, { recursive: true });
	mkdirSync(publicVolumesDir, { recursive: true });

	for (const entry of readdirSync(volumesDir, { withFileTypes: true })) {
		if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

		const volumePath = join(volumesDir, entry.name);
		const volumeYamlPath = join(volumePath, 'volume.yaml');
		if (!existsSync(volumeYamlPath)) continue;

		const volume = parseYaml(readFileSync(volumeYamlPath, 'utf8'));
		const volId = `${volume.number}-${volume.slug}`;

		if (volume.cover) {
			const coverSrc = join(volumePath, volume.cover);
			if (existsSync(coverSrc)) {
				const coverDest = join(publicVolumesDir, volId, volume.cover);
				mkdirSync(dirname(coverDest), { recursive: true });
				copyFileSync(coverSrc, coverDest);
			}
		}

		const chaptersDir = join(volumePath, 'chapters');
		if (!existsSync(chaptersDir)) continue;

		for (const chapterEntry of readdirSync(chaptersDir, { withFileTypes: true })) {
			if (!chapterEntry.isDirectory() || chapterEntry.name.startsWith('.')) continue;

			const chapterPath = join(chaptersDir, chapterEntry.name);
			const metaPath = join(chapterPath, 'meta.yaml');
			const indexPath = join(chapterPath, 'index.html');
			if (!existsSync(metaPath) || !existsSync(indexPath)) continue;

			const meta = parseYaml(readFileSync(metaPath, 'utf8'));
			const chId = `${meta.order}-${meta.slug}`;
			const dest = join(publicChaptersDir, volId, chId);
			mkdirSync(dirname(dest), { recursive: true });
			cpSync(chapterPath, dest, { recursive: true });
		}
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
					if (typeof filePath === 'string' && filePath.includes(`${join('content', 'volumes')}`)) {
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

// https://astro.build/config
export default defineConfig({
	site: 'https://magazine.vibecodingclub.kr',
	integrations: [contentSyncIntegration()],
});
