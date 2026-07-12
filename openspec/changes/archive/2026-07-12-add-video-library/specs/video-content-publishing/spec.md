## ADDED Requirements

### Requirement: Validated published video records
The system SHALL publish only video records with a unique slug, YouTube id, search intent, title, description, hobby relationship, stable thumbnail, upload date, duration, editorial summary, takeaway, and chapter data.

#### Scenario: Reject an incomplete published record
- **WHEN** the video catalog is validated during tests or build preparation
- **THEN** a record missing required search or presentation data fails validation before it can produce an indexable page

### Requirement: Draft isolation
The system SHALL exclude draft and placeholder videos from public routes, metadata, structured data, internal links, and sitemaps.

#### Scenario: Prepare a future video
- **WHEN** an editor creates an unpublished video draft
- **THEN** visitors and crawlers cannot discover a public watch page for that draft

### Requirement: Original supporting content
Every published video watch page SHALL include original visible editorial context beyond a title or raw transcript.

#### Scenario: Publish a captioned video
- **WHEN** a video with a transcript becomes public
- **THEN** its watch page also contains a distinct summary, key takeaways, and a next action

### Requirement: Cross-channel publishing package
The content model SHALL provide the canonical page URL, chapters, summary, and related links needed to keep the website page and YouTube publishing metadata aligned.

#### Scenario: Prepare a YouTube description
- **WHEN** an editor publishes a catalog record
- **THEN** the record exposes consistent chapter labels and a canonical Significant Hobbies URL for the YouTube description
