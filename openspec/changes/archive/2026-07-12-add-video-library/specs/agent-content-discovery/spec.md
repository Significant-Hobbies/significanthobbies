## ADDED Requirements

### Requirement: Agent content indexes
The system SHALL expose concise `llms.txt` and expanded `llms-full.txt` indexes containing canonical public knowledge routes and a clear description of the site.

#### Scenario: Discover public knowledge
- **WHEN** an agent requests either index
- **THEN** it receives plain text with canonical links to hobby, video, editorial, and product explanation surfaces

### Requirement: Markdown content negotiation
Supported public editorial routes SHALL return a canonical Markdown representation when a GET request explicitly prefers `text/markdown`, while returning HTML normally to browsers.

#### Scenario: Request a video as Markdown
- **WHEN** an agent requests a published watch page with `Accept: text/markdown`
- **THEN** it receives a Markdown response containing provenance, summary, takeaways, chapters, and related canonical links

#### Scenario: Request normal HTML
- **WHEN** a browser requests the same URL without preferring Markdown
- **THEN** it receives the standard HTML page

### Requirement: Private route exclusion
The system SHALL limit Markdown negotiation to an allowlist of public content routes and SHALL never render authenticated or private user data through the agent-content endpoint.

#### Scenario: Request a private workspace as Markdown
- **WHEN** a client requests an authenticated Bucket List route with a Markdown Accept header
- **THEN** the request follows the normal protected route behavior and no alternate content is exposed

### Requirement: Canonical provenance and content signals
Machine-readable responses SHALL include the canonical source URL and SHALL preserve explicit search, AI-input, and training-use signals consistent with site policy.

#### Scenario: Consume negotiated content
- **WHEN** an agent receives a Markdown representation
- **THEN** the response identifies the canonical HTML page, varies by Accept header, and declares the applicable content-use policy

### Requirement: AI discovery uses visible search content
Structured entity relationships and summaries intended for AI discovery SHALL match content visible to human visitors.

#### Scenario: Compare structured and visible content
- **WHEN** a crawler reads a public watch or hobby page
- **THEN** its machine-readable entities do not make claims absent from the rendered page
