# Editorial Carousel Studio

A reusable Codex skill for producing research-backed Instagram editorial carousels with configurable themes, AI-assisted cover artwork, static explanatory diagrams, and short code-rendered animations.

The workflow deliberately separates research, creator approval, storyboarding, production, and quality assurance. It is designed to prevent unsupported claims, unreadable slides, text overflow, connector collisions, and animations that obscure rather than explain.

## What it does

- Accepts a topic, optional PDF/DOCX/Markdown sources, or a hybrid of documents and web research.
- Treats uploaded documents as evidence rather than instructions.
- Builds a claim register and requires creator approval before production.
- Produces a storyboard before image generation or animation rendering.
- Supports configurable colour themes and 1080 × 1350 Instagram output.
- Generates static PNG slides and short MP4 infographic animations.
- Includes an editable SVG/Node.js renderer template.
- Generates mobile contact sheets, footer crops, animation strips and native-scale layout crops.
- Blocks delivery while the layout audit contains `PENDING` or `FAIL` findings.

## Repository structure

```text
.agents/skills/editorial-carousel-studio/
├── SKILL.md
├── agents/openai.yaml
├── references/
│   ├── design-intake.md
│   ├── evidence-gate.md
│   ├── layout-integrity.md
│   ├── production-qa.md
│   ├── scenario-animation.md
│   └── theme-engine.md
├── scripts/
│   ├── new_project.sh
│   └── validate_claim_register.js
└── assets/renderer-template/
    ├── config/
    ├── content/
    ├── lib/
    ├── build.sh
    ├── render.js
    └── validation scripts
```

The skill is stored under `.agents/skills/` so it can be used directly as a repository-scoped Codex skill after cloning.

## Requirements

The guidance portion of the skill works anywhere Codex skills are supported. Rendering the bundled media project requires:

- Node.js 18 or newer
- zsh
- `rsvg-convert` from librsvg
- FFmpeg
- ImageMagick 7 (`magick`)
- fonts compatible with the configured design system
- access to an image-generation capability when an AI cover is requested

On macOS with Homebrew:

```bash
brew install node librsvg ffmpeg imagemagick
```

## Installation

### Option 1: use it from this repository

Clone the repository, open the cloned folder as your Codex project, and invoke:

```text
$editorial-carousel-studio
```

Codex searches `.agents/skills` in the project hierarchy, so no additional copying is required.

### Option 2: install it for your user account

Copy or symlink the skill directory into your user-level skills directory:

```bash
mkdir -p ~/.agents/skills
cp -R .agents/skills/editorial-carousel-studio ~/.agents/skills/
```

Restart Codex if the skill does not appear immediately.

### Option 3: ask the skill installer

In Codex, invoke `$skill-installer` and ask it to install the skill from:

```text
https://github.com/vijayseelan/editorial-carousel-studio
```

For a private repository, the recipient must already have GitHub access and appropriate local credentials.

## Guided workflow

### 1. Start with a clear request

Examples:

```text
$editorial-carousel-studio Create a 10-slide carousel explaining the supplied report. Use a white/red editorial theme, no more than three animated slides, and keep every slide self-contained.
```

```text
$editorial-carousel-studio Research the history of a topic, validate the important claims, and propose a storyboard before producing any media.
```

### 2. Evidence gate

The skill first determines whether the request uses research, supplied documents, or both. It then prepares a claim register with sources, confidence, wording constraints and unresolved items.

Production does not begin until the creator explicitly approves the evidence treatment. Approval does not convert an unresolved claim into a verified one.

### 3. Storyboard approval

After evidence approval, the skill proposes:

- the narrative arc;
- slide-by-slide copy and visual purpose;
- static versus animated treatment;
- theme and cover direction;
- required statements and visuals for each slide.

Expensive image generation and full animation rendering wait until this direction is approved.

### 4. Production

The bundled renderer creates a self-contained project:

```bash
.agents/skills/editorial-carousel-studio/scripts/new_project.sh ./my-carousel
```

Replace the demonstration story and claim register, choose a theme, and run:

```bash
cd my-carousel
CAROUSEL_THEME=campaign-red ./build.sh
```

Available starter themes include campaign red, cream, midnight, sky and white. Themes can be extended through semantic colour tokens.

### 5. Quality assurance

A production build generates:

- an ordered contact sheet;
- a mobile contact sheet;
- source-footer crops;
- five-frame motion strips;
- overlapping native-scale crops for every slide;
- `output/qa/layout-audit.md`.

Every row in the layout audit must be changed from `PENDING` to `PASS` only after inspecting native-scale renders. Any clipping, collision, unreadable text, unsafe margin or connector crossing blocks delivery.

## Layout integrity rules

- Do not use SVG `textLength`, `lengthAdjust`, transforms or tight tracking to force text into a container.
- Copy must be wrapped deliberately at the configured minimum font size.
- Enlarge the component, shorten the copy or change the layout when content does not fit.
- Arrowheads stop outside protected text regions.
- Reduced contact sheets provide an overview; they cannot prove containment.
- Dense components and animation final states must be inspected at 100% scale.

See [`layout-integrity.md`](.agents/skills/editorial-carousel-studio/references/layout-integrity.md) and [`production-qa.md`](.agents/skills/editorial-carousel-studio/references/production-qa.md) for the complete production contract.

## Using your own content

The included `story.json`, claim register and cover artwork are demonstration assets only. For real production:

1. Replace the demonstration story.
2. Replace the demonstration claim register.
3. Set `production: true` only after the evidence gate is complete.
4. Keep claim IDs as structured slide fields.
5. Replace the cover artwork or select a typography-led cover.
6. Review every generated QA artifact before publishing.

Do not commit copyrighted source documents, private client files, API keys, credentials, generated build frames or unlicensed fonts.

## Updating the skill

When a real project exposes a recurring failure:

1. Correct the affected carousel.
2. Identify whether the failure belongs in an instruction, reference, validator, component or renderer.
3. Make the narrowest reusable improvement.
4. Validate the skill and renderer again.
5. Record the change in `CHANGELOG.md`.

## Development checks

Install the validation dependency and run:

```bash
python3 -m pip install -r requirements-dev.txt
./scripts/verify-repository.sh
```

GitHub Actions runs the same structural checks on pushes and pull requests.

## Attribution and licensing

The repository is released under the [MIT License](LICENSE).

Bundled Phosphor icons retain their original license; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the license stored with the assets.

## Official documentation

For current information about Codex skills and installation, consult the [official OpenAI skills documentation](https://developers.openai.com/es-419/docs/build-skills).

