import Foundation

public struct Habit: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var name: String
    public var isArchived: Bool

    public init(id: UUID = UUID(), name: String, isArchived: Bool = false) {
        self.id = id
        self.name = name
        self.isArchived = isArchived
    }
}

/// Private ritual content. This type intentionally has no visibility or publication field.
public struct DailyEntry: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var date: Date
    public var morningReflection: String
    public var eveningReflection: String
    public var journal: String
    public var newThing: String
    public var completedHabitIDs: Set<UUID>

    public init(
        id: UUID = UUID(),
        date: Date,
        morningReflection: String = "",
        eveningReflection: String = "",
        journal: String = "",
        newThing: String = "",
        completedHabitIDs: Set<UUID> = []
    ) {
        self.id = id
        self.date = date
        self.morningReflection = morningReflection
        self.eveningReflection = eveningReflection
        self.journal = journal
        self.newThing = newThing
        self.completedHabitIDs = completedHabitIDs
    }
}

public enum Visibility: String, Codable, CaseIterable, Sendable {
    case privateOnly = "Private"
    case publicProfile = "Public"
}

public enum HobbyState: String, Codable, CaseIterable, Sendable {
    case curious = "Curious"
    case active = "Active"
    case paused = "Paused"
    case remembered = "Remembered"
}

public struct Hobby: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var name: String
    public var category: String
    public var note: String
    public var state: HobbyState
    public var startedAt: Date
    public var visibility: Visibility

    public init(
        id: UUID = UUID(),
        name: String,
        category: String,
        note: String = "",
        state: HobbyState = .curious,
        startedAt: Date = .now,
        visibility: Visibility = .privateOnly
    ) {
        self.id = id
        self.name = name
        self.category = category
        self.note = note
        self.state = state
        self.startedAt = startedAt
        self.visibility = visibility
    }
}

public struct ProofStamp: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var date: Date
    public var note: String

    public init(id: UUID = UUID(), date: Date = .now, note: String) {
        self.id = id
        self.date = date
        self.note = note
    }
}

public struct Commitment: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var hobbyID: UUID?
    public var title: String
    public var dueDate: Date?
    public var isComplete: Bool
    public var completedAt: Date?
    public var visibility: Visibility
    public var proof: [ProofStamp]

    public init(
        id: UUID = UUID(),
        hobbyID: UUID?,
        title: String,
        dueDate: Date? = nil,
        isComplete: Bool = false,
        completedAt: Date? = nil,
        visibility: Visibility = .privateOnly,
        proof: [ProofStamp] = []
    ) {
        self.id = id
        self.hobbyID = hobbyID
        self.title = title
        self.dueDate = dueDate
        self.isComplete = isComplete
        self.completedAt = completedAt
        self.visibility = visibility
        self.proof = proof
    }
}

public struct TimelineEvent: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var date: Date
    public var title: String
    public var note: String

    public init(id: UUID = UUID(), date: Date, title: String, note: String = "") {
        self.id = id
        self.date = date
        self.title = title
        self.note = note
    }
}

public struct LifeTimeline: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var title: String
    public var visibility: Visibility
    public var events: [TimelineEvent]

    public init(id: UUID = UUID(), title: String, visibility: Visibility = .privateOnly, events: [TimelineEvent] = []) {
        self.id = id
        self.title = title
        self.visibility = visibility
        self.events = events
    }
}

public struct BucketItem: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var title: String
    public var category: String
    public var isComplete: Bool
    public var completedAt: Date?
    public var visibility: Visibility

    public init(
        id: UUID = UUID(),
        title: String,
        category: String,
        isComplete: Bool = false,
        completedAt: Date? = nil,
        visibility: Visibility = .privateOnly
    ) {
        self.id = id
        self.title = title
        self.category = category
        self.isComplete = isComplete
        self.completedAt = completedAt
        self.visibility = visibility
    }
}

public struct SideQuest: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var title: String
    public var nextStep: String
    public var isComplete: Bool
    public var completedAt: Date?
    public var visibility: Visibility

    public init(
        id: UUID = UUID(),
        title: String,
        nextStep: String,
        isComplete: Bool = false,
        completedAt: Date? = nil,
        visibility: Visibility = .privateOnly
    ) {
        self.id = id
        self.title = title
        self.nextStep = nextStep
        self.isComplete = isComplete
        self.completedAt = completedAt
        self.visibility = visibility
    }
}

public struct YearDirection: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var title: String
    public var why: String
    public var dailyPractice: String?

    public init(id: UUID = UUID(), title: String, why: String, dailyPractice: String? = nil) {
        self.id = id
        self.title = title
        self.why = why
        self.dailyPractice = dailyPractice
    }
}

public struct Profile: Codable, Equatable, Sendable {
    public var displayName: String
    public var bio: String
    public var birthDate: Date?
    public var publicProfileEnabled: Bool
    public var soundtrack: String?

    public init(
        displayName: String = "",
        bio: String = "",
        birthDate: Date? = nil,
        publicProfileEnabled: Bool = false,
        soundtrack: String? = nil
    ) {
        self.displayName = displayName
        self.bio = bio
        self.birthDate = birthDate
        self.publicProfileEnabled = publicProfileEnabled
        self.soundtrack = soundtrack
    }
}

public enum SyncState: String, Codable, Sendable {
    case localOnly
    case pending
    case synced
    case conflict
    case failed
}

public struct AtlasDocument: Codable, Equatable, Sendable {
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
    public var syncState: SyncState
    public var lastSyncedAt: Date?

    public init(
        schemaVersion: Int = 1,
        profile: Profile = Profile(),
        habits: [Habit] = [],
        dailyEntries: [DailyEntry] = [],
        hobbies: [Hobby] = [],
        commitments: [Commitment] = [],
        timelines: [LifeTimeline] = [],
        bucketList: [BucketItem] = [],
        sideQuests: [SideQuest] = [],
        directions: [YearDirection] = [],
        syncState: SyncState = .localOnly,
        lastSyncedAt: Date? = nil
    ) {
        self.schemaVersion = schemaVersion
        self.profile = profile
        self.habits = habits
        self.dailyEntries = dailyEntries
        self.hobbies = hobbies
        self.commitments = commitments
        self.timelines = timelines
        self.bucketList = bucketList
        self.sideQuests = sideQuests
        self.directions = directions
        self.syncState = syncState
        self.lastSyncedAt = lastSyncedAt
    }
}

public extension AtlasDocument {
    static var sample: AtlasDocument {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: .now)
        let photography = Hobby(name: "Street photography", category: "Make", note: "Notice ordinary light.", state: .active, startedAt: calendar.date(byAdding: .month, value: -8, to: today) ?? today)
        let bouldering = Hobby(name: "Bouldering", category: "Move", note: "Solve with the whole body.", state: .active, startedAt: calendar.date(byAdding: .month, value: -3, to: today) ?? today)
        let cooking = Hobby(name: "Regional cooking", category: "Learn", note: "One place at a time.", state: .curious, startedAt: today)
        let habits = [Habit(name: "Step outside"), Habit(name: "Make something small"), Habit(name: "Call someone I care about")]
        return AtlasDocument(
            profile: Profile(displayName: "Sarthak", bio: "Making room for a life that feels inhabited.", soundtrack: "Here Comes the Sun"),
            habits: habits,
            dailyEntries: [
                DailyEntry(
                    date: today,
                    morningReflection: "Make room for attention before urgency.",
                    journal: "The blue hour made the familiar street look new.",
                    newThing: "Took a different route home.",
                    completedHabitIDs: [habits[0].id]
                ),
            ],
            hobbies: [photography, bouldering, cooking],
            commitments: [
                Commitment(hobbyID: photography.id, title: "Make a twelve-frame monsoon walk", dueDate: calendar.date(byAdding: .day, value: 12, to: today)),
                Commitment(hobbyID: bouldering.id, title: "Return to the blue overhang", dueDate: calendar.date(byAdding: .day, value: 4, to: today), proof: [ProofStamp(date: calendar.date(byAdding: .day, value: -5, to: today) ?? today, note: "Found a cleaner first move")]),
            ],
            timelines: [
                LifeTimeline(title: "Learning to see", events: [
                    TimelineEvent(date: calendar.date(byAdding: .month, value: -8, to: today) ?? today, title: "Started carrying a camera"),
                    TimelineEvent(date: calendar.date(byAdding: .month, value: -2, to: today) ?? today, title: "First dawn walk", note: "Quiet streets, softer attention"),
                ]),
            ],
            bucketList: [
                BucketItem(title: "Learn to sail a small boat", category: "Move"),
                BucketItem(title: "Host a ten-person Sunday lunch", category: "Gather"),
                BucketItem(title: "Print a tiny photo book", category: "Make"),
            ],
            sideQuests: [SideQuest(title: "Find the city's oldest breakfast counter", nextStep: "Ask three people who grew up here")],
            directions: [YearDirection(title: "Become a better host", why: "Home should make friendship easier.", dailyPractice: "Notice one thing that would make someone comfortable")]
        )
    }

    func dailyEntry(on date: Date, calendar: Calendar = .current) -> DailyEntry? {
        dailyEntries.first { calendar.isDate($0.date, inSameDayAs: date) }
    }

    mutating func saveDaily(_ entry: DailyEntry, calendar: Calendar = .current) {
        if let index = dailyEntries.firstIndex(where: { calendar.isDate($0.date, inSameDayAs: entry.date) }) {
            dailyEntries[index] = entry
        } else {
            dailyEntries.append(entry)
        }
    }

    mutating func clearJournalWriting() {
        dailyEntries = dailyEntries.map { entry in
            var preserved = entry
            preserved.morningReflection = ""
            preserved.eveningReflection = ""
            preserved.journal = ""
            return preserved
        }
    }

    mutating func toggleHabit(_ habitID: UUID, on date: Date, calendar: Calendar = .current) {
        var entry = dailyEntry(on: date, calendar: calendar) ?? DailyEntry(date: calendar.startOfDay(for: date))
        if entry.completedHabitIDs.contains(habitID) { entry.completedHabitIDs.remove(habitID) }
        else { entry.completedHabitIDs.insert(habitID) }
        saveDaily(entry, calendar: calendar)
    }

    mutating func addHobby(_ hobby: Hobby) { hobbies.append(hobby) }
    mutating func addCommitment(_ commitment: Commitment) { commitments.append(commitment) }
    mutating func addBucketItem(_ item: BucketItem) { bucketList.append(item) }
    mutating func addSideQuest(_ quest: SideQuest) { sideQuests.append(quest) }
    mutating func addDirection(_ direction: YearDirection) { directions.append(direction) }

    mutating func completeCommitment(_ id: UUID, at date: Date = .now) throws {
        guard let index = commitments.firstIndex(where: { $0.id == id }) else { throw AtlasError.itemNotFound }
        commitments[index].isComplete.toggle()
        commitments[index].completedAt = commitments[index].isComplete ? date : nil
    }

    mutating func setCommitmentVisibility(_ id: UUID, visibility: Visibility) throws {
        guard let index = commitments.firstIndex(where: { $0.id == id }) else { throw AtlasError.itemNotFound }
        commitments[index].visibility = visibility
    }

    mutating func setHobbyVisibility(_ id: UUID, visibility: Visibility) throws {
        guard let index = hobbies.firstIndex(where: { $0.id == id }) else { throw AtlasError.itemNotFound }
        hobbies[index].visibility = visibility
    }
}

public enum AtlasError: LocalizedError, Equatable {
    case itemNotFound
    case unsupportedSchema(Int)

    public var errorDescription: String? {
        switch self {
        case .itemNotFound: "That Life Atlas item is no longer available."
        case let .unsupportedSchema(version): "This Life Atlas uses unsupported version \(version)."
        }
    }
}
