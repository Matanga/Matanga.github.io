# Portfolio Redesign Roadmap

## Objective

Redesign the portfolio around a wider, evidence-first Work landing page while
preserving the strongest parts of the current implementation:

- Dynamically generated project pages
- Expandable project context, challenges, and solutions
- Selectable project systems/contributions
- System-specific descriptions, technical details, and media
- Dynamically generated skillset pages
- Responsive desktop and mobile behavior

The redesign must remain grounded in verified career and project information.
Generated reference images are visual direction only and are not valid content
sources.

## Core Information Architecture

```text
Work | Expertise | About | Resume | Contact
```

Proposed routes:

```text
/                     Work landing page and project browser
/projects/:project    Dynamic project case study
/expertise            Optional expertise overview
/skillsets/:skill     Existing dynamic skillset detail page
/about                Biography, career history, and working approach
/resume               Web resume with PDF download
/contact              Contact details and form
```

`/home` should redirect to `/`.

## Factual Content Rules

- Distinguish employers, contracting entities, clients, and project partners.
- Do not present clients such as 2K, Netflix, Intel, EA, or Meta as direct
  employers unless that relationship is factually correct.
- Use wording such as:
  - `Client: 2K - Delivered through Globant`
  - `Netflix production - Engagement through Realtime UK`
  - `Intel installation - Delivered with Genosha`
- Do not publish invented dates, titles, locations, technologies, quantities, or
  impact metrics.
- Qualitative outcomes are acceptable when quantitative evidence is unavailable.
- Build About and Resume content from the existing resume and verified project
  records, not from generated mockup copy.

## Phase 1: Foundation And Data Contract - Completed

Define a reliable content model before rebuilding the interface.

### Current Source-Of-Truth Decision

For the current redesign branch, the runtime aggregate files are the temporary
canonical source:

```text
db/project_db.json
db/portfolio_item_db.json
```

The individual files under `db/Projects/` and `db/PortfolioItems/` will not be
automatically synchronized during this phase. They may be reconciled manually
later or made canonical through a dedicated build step.

Controlled values are defined in:

```text
db/taxonomy.json
```

Run data validation with:

```text
node scripts/validate-data.mjs
```

### Work

- Establish one canonical source for projects and portfolio items.
- Decide whether aggregate JSON files are generated artifacts or should be
  removed.
- Fix or hide incomplete projects such as Frogger until all referenced
  contributions and media exist.
- Remove duplicate portfolio-item records.
- Normalize controlled engine, DCC, language, skillset, status, and project-type
  values.
- Preserve existing item-level fields:
  - `skillsets`
  - `engine`
  - `dcc`
  - `languages`
  - `tech`
  - `tags`
- Derive project filter values from portfolio items where possible.
- Add only necessary project-level editorial metadata:

```json
{
  "year": 2026,
  "featured": false,
  "visibility": "public",
  "status": "complete",
  "projectTypes": ["production", "internal-tool"],
  "relationship": "Internal Atlas R&D",
  "thumbnail": "image.jpg"
}
```

- Default `featured` to `false`. Featured projects and their ordering will be
  selected manually after all projects have been reviewed.
- Select a reasonable existing project thumbnail during migration. Thumbnail
  choices can be adjusted manually later.
- Treat `projectTypes` as a controlled array because the classifications are not
  mutually exclusive.
- Add a validation script covering:
  - Missing project-to-item references
  - Missing media files
  - Duplicate records
  - Invalid controlled values
  - Missing required project metadata

### Deliverable

A reliable content foundation with no major visual changes.

### Authoritative Project Classifications

Use only the following values in `projectTypes`. Add a new value only by updating
this list first.

| ID | Display label | Use when |
| --- | --- | --- |
| `production` | Production | Work created for or used in a real production context |
| `internal-tool` | Internal Tool | Tools, pipelines, dashboards, or frameworks built for internal users |
| `commercial-game` | Commercial Game | Work delivered for a commercially released game |
| `broadcast` | Broadcast | Work delivered for television, streaming, or episodic production |
| `interactive-installation` | Interactive Installation | Public, experiential, projection, or installation work |
| `research-and-development` | R&D | Exploratory work intended to validate technical or workflow concepts |
| `platform-validation` | Platform Validation | Demonstrations or applications built to validate a platform or integration |
| `personal-project` | Personal Project | Independently initiated personal work |

Projects may use multiple values where each classification is independently
true. Examples:

```json
["production", "internal-tool"]
```

```json
["research-and-development", "personal-project"]
```

```json
["production", "broadcast"]
```

### Authoritative Project Statuses

Use one of:

| ID | Display label | Meaning |
| --- | --- | --- |
| `complete` | Complete | The described work or engagement is complete |
| `ongoing` | Ongoing | The work is actively maintained or continuing |
| `in-development` | In Development | The project is currently being built |
| `archived` | Archived | The project stopped before normal completion but remains portfolio-relevant |

### Authoritative Visibility Values

Use one of:

| ID | Meaning |
| --- | --- |
| `public` | May appear in listings, filters, and direct project routes |
| `unlisted` | Accessible by direct route but excluded from normal listings |
| `private` | Excluded from the public site |

### Metadata Defaults

Unless existing verified information requires otherwise:

```json
{
  "featured": false,
  "status": "complete",
  "visibility": "public"
}
```

`year`, `projectTypes`, and `relationship` must be derived from existing project
data, portfolio-item data, or the verified resume. If they cannot be established
from those sources, ask rather than inventing them.

## Phase 2: Shared Shell And Navigation - Completed

Create the responsive frame used by every page.

### Approved Shell Specification

- Maximum content width: `1200px`
- Desktop gutters: `32px`
- Tablet gutters: `24px`
- Mobile gutters: `16px`
- Sticky navigation:

```text
Pablo Vezzini | Work | Expertise | About | Resume | Contact | Accent
```

- `Work` routes to `/`.
- `Expertise` routes to `/expertise` and retains a compact dropdown linking to
  existing dynamic skillset pages.
- `Resume` routes to a web resume page with a direct PDF download.
- Mobile navigation collapses into a menu.
- The Work landing page will use a static Atlas Unreal plugin image in its compact
  hero during Phase 3.
- The availability line remains visible but easy to edit or hide.
- Project relationships will appear on project cards in compact form.
- Technology filters will support multiple selections.

### User-Selectable Accent

Keep semantic status colors independent from the user-selected accent.

The accent may affect:

- Active navigation
- Primary buttons
- Interactive links and arrows
- Selected filters and system cards
- Focus rings
- Small decorative borders

It must not recolor semantic success, warning, error, or project-status meaning.

Approved presets:

```text
Cyan   #4CC9F0
Green  #10B981
Amber  #FFB703
Pink   #FE3385
Purple #A855F7
```

The selector is a small header swatch with a compact popover. The selected value
persists in `localStorage`; on mobile the selector appears inside the menu.

### Work

- Replace the Projects dropdown with a direct Work destination.
- Keep Expertise as a small dropdown initially.
- Add routes for Work, About, Resume, and Contact.
- Introduce a wider desktop content container, approximately 1120-1200px.
- Preserve single-column mobile layouts.
- Build shared UI primitives:
  - Navigation
  - Buttons
  - Cards
  - Chips
  - Section headers
  - Typography
  - Status indicators
- Add accessible mobile navigation.
- Keep existing page renderers working inside the new shell temporarily.

### Deliverable

All existing content remains functional inside the new navigation and responsive
layout.

## Phase 3: Work Landing Page - Completed

Replace the current text-heavy homepage with the project browser.

### Structure

```text
Compact professional introduction
Selected Work
Project filters and sorting
All Work project grid
Contact and resume call to action
```

### Work

- Add a concise introduction with name, title, focus, and primary actions.
- Display three or four verified flagship projects.
- Build the complete project grid from project data.
- Add controlled filters:
  - Discipline/skillset
  - Engine/DCC/technology
  - Project type where useful
- Add sorting:
  - Featured
  - Newest
  - Optional production relevance
- Add a clear empty-filter state.
- Keep filters usable on mobile through horizontal chips or a filter panel.
- Consider query-string state:

```text
/?skill=tooldev&engine=unreal&sort=featured
```

- Use verified project summaries and metadata only.
- Move biography, philosophy, and detailed capability explanations away from
  Work.

### Deliverable

The Work landing page becomes the site's default and primary project-discovery
surface.

## Phase 4: Dynamic Case-Study Template

Rebuild one representative project first, then apply the renderer to every
project.

Element Space is the recommended first project because it exercises multiple
contributions, images, video, project details, and system-level content.

### Project Story

The upper half of each case study should communicate:

- Project title and impact
- Role and scope
- Client and delivery relationship
- Engine, DCCs, languages, and relevant technology
- Project status
- Overview
- Responsibilities

### Expandable Project Details

Preserve the current project-level accordion.

Collapsed control:

```text
Project context & challenges
```

Expanded content:

```text
Context
Key Challenges
Solution Strategy
```

Use accessible controls with `aria-expanded`.

### Dynamic Systems And Contributions

Preserve the existing contribution-selection behavior.

```text
Key Systems & Contributions
[Selectable horizontal system cards]

Selected System
System summary
What I Built
System-level technical-details toggle
Primary evidence
Additional evidence
```

Each contribution card should contain:

- Thumbnail
- System title
- Concise one-liner
- Two or three useful tags
- Clear selected state

Selecting a contribution should update:

- System title
- One-liner
- What-I-built list
- Technical deep dive
- Primary media
- Additional gallery and captions

Avoid random card colors. Use one consistent selected accent.

### Deep Linking

Store the selected contribution in the URL:

```text
/projects/element-space#element-vfxcomps
```

Support direct links and browser navigation without aggressive page scrolling.

### Accessibility

- Use keyboard-operable contribution controls.
- Add an accessible image dialog.
- Close dialogs with Escape.
- Manage focus when dialogs open and close.
- Preserve stable layout while selected-system content updates.

### Edge Cases

Test projects with:

- One contribution
- Many contributions
- Images only
- Video only
- Missing deep dive
- Undisclosed client
- R&D status
- Large evidence galleries

### Deliverable

All project routes use the new case-study design without losing project-level or
system-level dynamic behavior.

## Phase 5: Expertise

Preserve and improve the existing skillset system.

### Existing Behavior To Retain

`/skillsets/:skill` should continue to:

- Read skill metadata from `db/skills.json`
- Find portfolio items tagged with the selected skillset
- Sort matching systems by priority and date
- Render system cards
- Link each system to its parent project

### Work

- Restyle dynamic skillset pages to match the new design system.
- Reuse the improved system-card and evidence components where practical.
- Keep Expertise as a small navigation dropdown.
- Optionally add `/expertise` as a curated overview containing broad capability
  families:
  - Pipeline Architecture
  - Artist Tools
  - Procedural Systems
  - Engine and Runtime Systems
- Link overview cards to one or more existing dynamic skillset routes.

The `/expertise` overview is optional and should be evaluated after Work filters
are functioning.

### Deliverable

Skill browsing remains dynamically generated while gaining a clearer
professional presentation.

## Phase 6: About, Resume, Contact, And Polish

### About

- Add a concise verified biography.
- Explain working approach and ownership.
- Present real employer history.
- Nest client engagements beneath the correct employer or contracting period.
- Include verified capabilities and selected supporting media.
- Keep the pixel avatar optional and secondary.

### Resume

- Build the web resume from the current verified PDF.
- Preserve employer/client distinctions.
- Include a direct PDF download.
- Do not add unsupported technologies, locations, metrics, dates, or titles.

### Contact

- Use real email and LinkedIn details.
- Include accurate location and availability.
- Keep the contact form short:
  - Name
  - Email
  - Message
- Preserve resume and selected-work links.

### Final Polish

- Keyboard navigation and visible focus states
- Reduced-motion support
- Accessible dialogs and accordions
- Per-project document titles and descriptions
- Per-project Open Graph metadata where feasible
- Lazy loading and image optimization
- Broken-link and missing-media validation
- Mobile, tablet, desktop, and wide-desktop testing

## Commit Strategy

Use one commit per meaningful checkpoint:

```text
data: establish project taxonomy and validation
layout: introduce responsive shell and navigation
work: build filterable project landing page
projects: rebuild dynamic case-study renderer
expertise: restyle skill pages and add optional overview
content: add grounded about, resume, and contact pages
polish: improve accessibility, metadata, and performance
```

Phase 4 may use smaller coherent commits:

```text
projects: add new header and overview
projects: preserve expandable project details
projects: rebuild contribution selector
projects: add selected-system evidence layout
projects: add deep links and accessible media dialog
```

## Implementation Principles

- Keep the site functional after every phase.
- Review each major phase in the browser before continuing.
- Do not hardcode project cards that can be generated from data.
- Do not duplicate filter metadata unnecessarily.
- Do not discard the existing skillset and contribution logic.
- Do not treat generated reference text as factual source material.
- Do not perform unrelated legacy CSS cleanup before the replacement structure is
  stable.
- Do not add new public projects until the canonical data path and validation
  rules are established.

## First Milestone

Implement Phases 1 and 2 together:

1. Formalize and validate the data.
2. Add the wider shared shell and navigation.
3. Keep current project and skillset renderers functional within it.
4. Review desktop and mobile behavior.
5. Commit the milestone before building the Work landing page.
