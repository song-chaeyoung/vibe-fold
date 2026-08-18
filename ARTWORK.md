# VIBE FOLD — Artwork 데이터 형태

발행되는 작품 한 편의 데이터 정의입니다. 목록 카드 · 볼륨 커버 · 페이지 메타태그가 이 데이터를 공유합니다.

제출 방법과 작품 제작 규칙은 [CONTRIBUTING.md](./CONTRIBUTING.md)에서 다룹니다.

---

## 타입

작품 폴더의 `meta.yaml`에 적는 값입니다.

```ts
type Artwork = {
  id: string; // "ch-" + slug, 폴더명과 동일
  slug: string; // URL에 쓰이는 이름
  title: string;
  creator: string;
  thumbnail: string; // 폴더 루트 기준 경로
  description: string;
  shareImage?: string; // 공유 카드 1200×630
  favicon?: string; // 이 작품 페이지의 파비콘
  links?: {
    github?: string;
    website?: string;
    instagram?: string;
  };
};
```

| 필드          | 필수 |
| ------------- | :--: |
| `id`          |  O   |
| `slug`        |  O   |
| `title`       |  O   |
| `creator`     |  O   |
| `thumbnail`   |  O   |
| `description` |  O   |
| `shareImage`  |  —   |
| `favicon`     |  —   |
| `links`       |  —   |

---

## 필드

### `id` · `slug`

`slug`가 이름이고, 앞에 `ch-`를 붙인 것이 `id`이자 폴더명입니다.

```
title   고래 싸움에 새우 등 터진다
slug    gorae-ssaume-saeu
id      ch- + slug  →  ch-gorae-ssaume-saeu   (폴더명과 동일)
```

소문자 영문 · 숫자 · 하이픈만. 한글 제목은 로마자로 옮깁니다 — `등잔 밑이 어둡다` → `deungjan-miti-eodupda`.

### `title`

작품 제목. 표기한 그대로 쓰이며 시스템이 변형하지 않습니다.

목록 카드에서 `Ch.1 제목` 형태로 표시되고 줄바꿈됩니다([ChapterRow.astro:21](src/components/ChapterRow.astro:21)). 강제로 잘리지 않지만 길면 카드 높이가 작품마다 들쭉날쭉해집니다.

노출: 목록 카드 제목, 브라우저 탭.

### `creator`

제작자 표시명. `@`는 붙이지 않습니다 — 표시할 때 자동으로 붙습니다([ChapterRow.astro:12](src/components/ChapterRow.astro:12)).

공동 제작은 한 문자열에 적습니다.

노출: 목록 카드.

### `description`

작품 설명. 일반 텍스트이며 **마크다운·HTML은 렌더링되지 않습니다.** 빈 줄로 문단을 나눕니다([ChapterRow.astro:13](src/components/ChapterRow.astro:13)).

**30\~150자, 1\~2문단.** 볼륨 페이지의 목록 카드에 **전문이 그대로** 노출되기 때문입니다([ChapterRow.astro:79](src/components/ChapterRow.astro:79)). 2열 그리드라 길면 목록 자체가 읽히지 않습니다.

예시 볼륨 4편은 **26\~61자 한 문단**입니다. 다만 그쪽은 속담 뜻풀이라 짧은 편이고, 작품 설명이라면 조금 더 길어도 됩니다.

**첫 문장에 핵심을 두세요.** 이 값이 `<meta name="description">`과 `og:description`으로도 나가는데, **줄바꿈이 공백으로 눌리고 200자에서 잘립니다**([BaseLayout.astro:28](src/layouts/BaseLayout.astro:28)). 검색 결과와 공유 카드에는 앞부분만 보입니다.

기술 스택 나열만으로 채우지 마세요.

노출: 목록 카드 본문, `<meta name="description">`.

### `thumbnail`

대표 이미지. **폴더 루트 기준 경로**입니다 — 루트에 두면 `thumb.svg`, 하위 폴더면 `img/thumb.svg`([content.ts:103](src/lib/content.ts:103)).

**세로형이면 됩니다.** 카드가 `aspect-ratio: 297/420`으로 고정되어 있고 `object-fit: cover`로 채워집니다([ChapterRow.astro:45](src/components/ChapterRow.astro:45)). 예시 볼륨은 전부 `viewBox="0 0 600 800"`(3:4)이고 문제없이 표시됩니다 — 정확한 비율을 맞출 필요는 없습니다.

가로형이나 정사각형을 넣으면 좌우가 크게 잘리니 그것만 피하세요.

실제 표시 폭은 **152\~223px**입니다(`--card-w: clamp(9.5rem, 11.6vw, 13.9375rem)`). 이 크기에서 읽히는지 확인이 필요합니다.

**볼륨의 첫 작품 썸네일은 볼륨 커버로도 쓰입니다**([content.ts:132](src/lib/content.ts:132)). 홈과 아카이브 그리드에 노출됩니다.

노출: 목록 카드, (첫 작품인 경우) 볼륨 커버.

### `shareImage` · `favicon`

둘 다 선택입니다. `thumbnail`처럼 **폴더 루트 기준 경로**로 적습니다([content.ts:112-113](src/lib/content.ts:112)).

| | 적었을 때 | 생략했을 때 |
| --- | --- | --- |
| `shareImage` | 이 작품 페이지의 `og:image` · `twitter:image` | 사이트 공용 카드 `/og.jpg` |
| `favicon` | 이 작품 페이지의 파비콘 | 사이트 파비콘 |

`shareImage`는 **1200 × 630**으로 만드세요. `og:image:width`·`height`가 그 값으로 고정 출력되므로, 비율이 다르면 공유 카드가 잘리거나 어긋나게 보입니다.

`thumbnail`(세로 카드)과는 쓰임이 다릅니다. 목록에 쓰이는 이미지와 공유될 때 쓰이는 이미지를 각각 두는 것이라, 굳이 만들지 않아도 됩니다.

### `links`

전부 선택입니다. 없으면 통째로 생략합니다.

| 키          | 용도                                |
| ----------- | ----------------------------------- |
| `github`    | 작품 소스 저장소 또는 제작자 프로필 |
| `website`   | 포트폴리오 · 개인 사이트            |
| `instagram` | 인스타그램                          |

**모두 `https://`로 시작하는 완전한 URL.** `@handle`, `github.com/name` 같은 축약형은 받지 않습니다.
