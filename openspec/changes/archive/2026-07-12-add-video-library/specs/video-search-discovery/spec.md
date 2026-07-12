## ADDED Requirements

### Requirement: Dedicated watch pages
The system SHALL provide one indexable canonical `/videos/[slug]` watch page for every published video with a single visible player as primary content.

#### Scenario: Open a published video
- **WHEN** a visitor requests a published video slug
- **THEN** the page renders the video, unique title and description, editorial context, chapters, related content, and one primary next action

### Requirement: Complete video discovery metadata
Every published watch page SHALL expose matching canonical metadata, Open Graph data, `VideoObject` structured data, and chapter key moments derived from the catalog record.

#### Scenario: Crawl a watch page
- **WHEN** a search crawler renders a published watch page
- **THEN** the visible content and machine-readable title, description, thumbnail, upload date, duration, embed URL, and chapter offsets agree

### Requirement: Video sitemap coverage
The system SHALL expose every published watch page in a valid video sitemap and in the site's standard sitemap.

#### Scenario: Publish a new video record
- **WHEN** a valid record enters the published catalog
- **THEN** its watch URL and video metadata appear in sitemap discovery without a second manual registry

### Requirement: Entity-based internal linking
The system SHALL connect a published video to its related hobby guide and SHALL make the video discoverable from that hobby page.

#### Scenario: Explore a hobby with videos
- **WHEN** a visitor opens a hobby page that has published videos
- **THEN** the page links to those watch pages and each watch page links back to the hobby guide

### Requirement: Performance-safe embeds
Index and related-content surfaces SHALL use thumbnails rather than multiple live players, while the watch page SHALL include its iframe in rendered HTML without requiring a user action to create it.

#### Scenario: Browse the video library
- **WHEN** a visitor views a list containing multiple videos
- **THEN** the page loads stable thumbnail images and defers YouTube player resources until a watch page is opened

### Requirement: Conversion into action
Every watch page SHALL provide a relevant next step into an existing Significant Hobbies product surface.

#### Scenario: Act on a video idea
- **WHEN** a visitor finishes reading or watching a video page
- **THEN** the visitor can open the related hobby guide or add a relevant experience to a Bucket List
