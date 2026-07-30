## ADDED Requirements

### Requirement: Public sitemap routes are agent-readable

The system SHALL return a useful Markdown representation for every public route
listed in the sitemap without requiring client-side JavaScript.

#### Scenario: Agent negotiates Markdown

- **WHEN** a client requests a public sitemap route with
  `Accept: text/markdown`
- **THEN** the system returns HTTP 200 with a Markdown content type and the
  route's public content

#### Scenario: Agent requests a Markdown alternate

- **WHEN** a client requests the `.md` alternate for a public sitemap route
- **THEN** the system returns the same public content as Markdown with a link
  back to the canonical human route

### Requirement: Markdown stays truthful to the human document

The system MUST derive route Markdown from the same canonical source data and
loaders used by the human route and MUST preserve its meaningful headings,
prose, lists, and links.

#### Scenario: Content route is rendered

- **WHEN** a source-backed or database-backed public route loads successfully
- **THEN** its Markdown includes the document's primary heading, meaningful
  prose, and canonical source URL without scripts or presentation markup

#### Scenario: Human route fails

- **WHEN** the underlying public source cannot be loaded
- **THEN** the Markdown request fails explicitly and does not return an HTML
  shell or a misleading success document

### Requirement: Private routes remain excluded

The system MUST NOT generate public Markdown for authenticated or private
application routes that are absent from the public sitemap.

#### Scenario: Private Markdown path is requested

- **WHEN** a client requests a `.md` alternate for an authenticated route such
  as `/daily` or `/settings`
- **THEN** the agent boundary does not expose that route's content as Markdown

### Requirement: Agent catalog surfaces are valid

Every bounded surface in `/api/ai` SHALL have a same-origin URL present in the
public sitemap and a same-origin Markdown target that returns readable Markdown.

#### Scenario: Explore surface is discovered

- **WHEN** an agent reads `/api/ai`
- **THEN** the Explore surface advertises `/explore.md` and both `/explore` and
  `/explore.md` resolve successfully under their respective content contracts

### Requirement: Corpus coverage is regression-tested

The repository SHALL verify that every route produced by its sitemap matches the
public Markdown path boundary.

#### Scenario: A new sitemap route family is introduced

- **WHEN** the generated sitemap contains a route that is not covered by the
  public Markdown boundary
- **THEN** the full-corpus coverage check fails with the uncovered pathname
