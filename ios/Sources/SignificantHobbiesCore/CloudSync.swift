import Foundation

/// The private, versioned Life Atlas exchanged by native clients. Device-only
/// sync metadata is excluded so a successful sync does not create another edit.
public struct AtlasCloudDocument: Codable, Equatable, Sendable {
    public var schemaVersion: Int
    public var profile: Profile
    public var habits: [Habit]
    public var dailyEntries: [DailyEntry]
    public var hobbies: [Hobby]
    public var commitments: [Commitment]
    public var timelines: [LifeTimeline]
    public var bucketList: [BucketItem]
    public var sideQuests: [SideQuest]
    public var directions: [YearDirection]

    public init(document: AtlasDocument) {
        schemaVersion = document.schemaVersion
        profile = document.profile
        habits = document.habits
        dailyEntries = document.dailyEntries
        hobbies = document.hobbies
        commitments = document.commitments
        timelines = document.timelines
        bucketList = document.bucketList
        sideQuests = document.sideQuests
        directions = document.directions
    }

    public func localDocument(
        syncState: SyncState = .synced,
        lastSyncedAt: Date = .now
    ) -> AtlasDocument {
        AtlasDocument(
            schemaVersion: schemaVersion,
            profile: profile,
            habits: habits,
            dailyEntries: dailyEntries,
            hobbies: hobbies,
            commitments: commitments,
            timelines: timelines,
            bucketList: bucketList,
            sideQuests: sideQuests,
            directions: directions,
            syncState: syncState,
            lastSyncedAt: lastSyncedAt
        )
    }
}

public struct AtlasCloudSnapshot: Codable, Equatable, Identifiable, Sendable {
    public var document: AtlasCloudDocument
    public var revision: Int

    public init(document: AtlasCloudDocument, revision: Int) {
        self.document = document
        self.revision = revision
    }

    public var id: Int { revision }
}
