// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "PersonalSyncKit",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
        .watchOS(.v10),
    ],
    products: [
        .library(name: "PersonalSyncKit", targets: ["PersonalSyncKit"]),
        .library(name: "SignificantDesignKit", targets: ["SignificantDesignKit"]),
    ],
    targets: [
        .target(name: "PersonalSyncKit"),
        .target(name: "SignificantDesignKit"),
        .testTarget(name: "PersonalSyncKitTests", dependencies: ["PersonalSyncKit"]),
        .testTarget(name: "SignificantDesignKitTests", dependencies: ["SignificantDesignKit"]),
    ]
)
