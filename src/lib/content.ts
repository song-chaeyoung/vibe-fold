import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

export type VolumeStatus = 'published' | 'coming_soon';

export interface VolumeMeta {
	id: string;
	number: number;
	slug: string;
	title: string;
	summary: string;
	date: string;
	status: VolumeStatus;
	featured?: boolean;
	cover: string;
}

export interface ChapterMeta {
	id: string;
	order: number;
	slug: string;
	title: string;
	author: string;
	summary: string;
	thumb: string;
}

export interface Chapter extends ChapterMeta {
	volId: string;
	chId: string;
	dirName: string;
	iframeSrc: string;
	thumbSrc: string;
}

export interface Volume extends VolumeMeta {
	volId: string;
	dirName: string;
	coverSrc: string;
	chapters: Chapter[];
}

const volumesRoot = join(process.cwd(), 'content/volumes');

function loadYaml<T>(path: string): T {
	return parseYaml(readFileSync(path, 'utf8')) as T;
}

function toVolId(volume: VolumeMeta): string {
	return `${volume.number}-${volume.slug}`;
}

function toChId(chapter: ChapterMeta): string {
	return `${chapter.order}-${chapter.slug}`;
}

function loadChapters(volumeDir: string, volId: string): Chapter[] {
	const chaptersDir = join(volumeDir, 'chapters');
	if (!existsSync(chaptersDir)) return [];

	const chapters: Chapter[] = [];

	for (const entry of readdirSync(chaptersDir, { withFileTypes: true })) {
		if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name.startsWith('.')) {
			continue;
		}

		const chapterPath = join(chaptersDir, entry.name);
		const metaPath = join(chapterPath, 'meta.yaml');
		const indexPath = join(chapterPath, 'index.html');
		if (!existsSync(metaPath) || !existsSync(indexPath)) continue;

		const meta = loadYaml<ChapterMeta>(metaPath);
		const chId = toChId(meta);

		chapters.push({
			...meta,
			volId,
			chId,
			dirName: entry.name,
			iframeSrc: `/chapters/${volId}/${chId}/index.html`,
			thumbSrc: `/chapters/${volId}/${chId}/${meta.thumb}`,
		});
	}

	return chapters.sort((a, b) => a.order - b.order);
}

export function getAllVolumes(): Volume[] {
	if (!existsSync(volumesRoot)) return [];

	const volumes: Volume[] = [];

	for (const entry of readdirSync(volumesRoot, { withFileTypes: true })) {
		if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name.startsWith('.')) {
			continue;
		}

		const volumeDir = join(volumesRoot, entry.name);
		const yamlPath = join(volumeDir, 'volume.yaml');
		if (!existsSync(yamlPath)) continue;

		const meta = loadYaml<VolumeMeta>(yamlPath);
		const volId = toVolId(meta);

		volumes.push({
			...meta,
			featured: Boolean(meta.featured),
			volId,
			dirName: entry.name,
			coverSrc: `/volumes/${volId}/${meta.cover}`,
			chapters: loadChapters(volumeDir, volId),
		});
	}

	return volumes.sort((a, b) => b.number - a.number);
}

export function getVolumeByVolId(volId: string): Volume | undefined {
	return getAllVolumes().find((volume) => volume.volId === volId);
}

export function getFeaturedVolume(): Volume | undefined {
	return getAllVolumes().find(
		(volume) => volume.featured && volume.status === 'published',
	);
}

export function getChapter(volId: string, chId: string): Chapter | undefined {
	return getVolumeByVolId(volId)?.chapters.find((chapter) => chapter.chId === chId);
}

export function getAdjacentChapters(
	volume: Volume,
	chId: string,
): { prev?: Chapter; next?: Chapter; current?: Chapter } {
	const index = volume.chapters.findIndex((chapter) => chapter.chId === chId);
	if (index === -1) return {};

	return {
		current: volume.chapters[index],
		prev: index > 0 ? volume.chapters[index - 1] : undefined,
		next: index < volume.chapters.length - 1 ? volume.chapters[index + 1] : undefined,
	};
}

export function chapterHref(volId: string, chId: string): string {
	return `/vol/${volId}/ch/${chId}`;
}

export function volumeHref(volId: string): string {
	return `/vol/${volId}`;
}

export function formatVolLabel(number: number): string {
	return `Vol.${number}`;
}

export function formatChapterLabel(order: number, title: string): string {
	return `Ch.${order} ${title}`;
}
