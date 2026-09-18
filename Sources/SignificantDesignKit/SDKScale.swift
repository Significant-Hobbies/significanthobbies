import SwiftUI

/// One spacing scale across the family. Multiples of 4 keep optical
/// alignment predictable on every platform.
public enum SDKSpace {
    public static let xxs: CGFloat = 4
    public static let xs: CGFloat = 8
    public static let sm: CGFloat = 12
    public static let md: CGFloat = 16
    public static let lg: CGFloat = 24
    public static let xl: CGFloat = 32
    public static let xxl: CGFloat = 48
}

public enum SDKRadius {
    public static let sm: CGFloat = 8
    public static let md: CGFloat = 14
    public static let lg: CGFloat = 20
    public static let xl: CGFloat = 28
}

/// Shared measurement floors every interactive kit component agrees on.
public enum SDKMetrics {
    /// Apple HIG minimum hit target.
    public static let minimumTouchTarget: CGFloat = 44
    /// Preference rows breathe slightly more than the floor.
    public static let minimumRowHeight: CGFloat = 60
}

/// Motion is one spring, reused. Consistent physics is most of what makes an
/// interface feel like a single object rather than a pile of screens; Reduce
/// Motion callers receive `nil` and the same layout, unchanged.
public enum SDKMotion {
    public static let snappy = Animation.spring(response: 0.32, dampingFraction: 0.82)
    public static let gentle = Animation.spring(response: 0.55, dampingFraction: 0.85)

    /// Returns the spring unless Reduce Motion is on — meaning and hierarchy
    /// must remain intact without spatial animation.
    public static func snappy(reduceMotion: Bool) -> Animation? {
        reduceMotion ? nil : snappy
    }

    public static func gentle(reduceMotion: Bool) -> Animation? {
        reduceMotion ? nil : gentle
    }
}
