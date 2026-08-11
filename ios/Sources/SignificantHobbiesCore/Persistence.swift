import Foundation

public actor AtlasStore {
    public let fileURL: URL

    public init(fileURL: URL? = nil) {
        if let fileURL {
            self.fileURL = fileURL
        } else {
            let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            self.fileURL = base.appending(path: "SignificantHobbies", directoryHint: .isDirectory)
                .appending(path: "life-atlas-v1.json")
        }
    }

    public func load() throws -> AtlasDocument {
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return .sample }
        let data = try Data(contentsOf: fileURL)
        let document = try Self.decoder.decode(AtlasDocument.self, from: data)
        guard document.schemaVersion == 1 else { throw AtlasError.unsupportedSchema(document.schemaVersion) }
        return document
    }

    public func save(_ document: AtlasDocument) throws {
        try FileManager.default.createDirectory(at: fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        try Self.encoder.encode(document).write(to: fileURL, options: [.atomic, .completeFileProtectionUnlessOpen])
    }

    public func export(_ document: AtlasDocument) throws -> Data { try Self.encoder.encode(document) }

    public func previewImport(_ data: Data) throws -> AtlasDocument {
        let document = try Self.decoder.decode(AtlasDocument.self, from: data)
        guard document.schemaVersion == 1 else { throw AtlasError.unsupportedSchema(document.schemaVersion) }
        return document
    }

    public func replace(with document: AtlasDocument) throws { try save(document) }

    public func reset() throws {
        if FileManager.default.fileExists(atPath: fileURL.path) { try FileManager.default.removeItem(at: fileURL) }
    }

    private static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()

    private static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()
}
