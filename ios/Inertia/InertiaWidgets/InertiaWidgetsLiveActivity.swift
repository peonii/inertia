//
//  InertiaWidgetsLiveActivity.swift
//  InertiaWidgets
//
//  Created by peony on 10/04/2024.
//

import ActivityKit
import WidgetKit
import SwiftUI

extension Color {
    init(hex string: String) {
        var string: String = string.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
        if string.hasPrefix("#") {
            _ = string.removeFirst()
        }

        // Double the last value if incomplete hex
        if !string.count.isMultiple(of: 2), let last = string.last {
            string.append(last)
        }

        // Fix invalid values
        if string.count > 8 {
            string = String(string.prefix(8))
        }

        // Scanner creation
        let scanner = Scanner(string: string)

        var color: UInt64 = 0
        scanner.scanHexInt64(&color)

        if string.count == 2 {
            let mask = 0xFF

            let g = Int(color) & mask

            let gray = Double(g) / 255.0

            self.init(.sRGB, red: gray, green: gray, blue: gray, opacity: 1)

        } else if string.count == 4 {
            let mask = 0x00FF

            let g = Int(color >> 8) & mask
            let a = Int(color) & mask

            let gray = Double(g) / 255.0
            let alpha = Double(a) / 255.0

            self.init(.sRGB, red: gray, green: gray, blue: gray, opacity: alpha)

        } else if string.count == 6 {
            let mask = 0x0000FF
            let r = Int(color >> 16) & mask
            let g = Int(color >> 8) & mask
            let b = Int(color) & mask

            let red = Double(r) / 255.0
            let green = Double(g) / 255.0
            let blue = Double(b) / 255.0

            self.init(.sRGB, red: red, green: green, blue: blue, opacity: 1)

        } else if string.count == 8 {
            let mask = 0x000000FF
            let r = Int(color >> 24) & mask
            let g = Int(color >> 16) & mask
            let b = Int(color >> 8) & mask
            let a = Int(color) & mask

            let red = Double(r) / 255.0
            let green = Double(g) / 255.0
            let blue = Double(b) / 255.0
            let alpha = Double(a) / 255.0

            self.init(.sRGB, red: red, green: green, blue: blue, opacity: alpha)

        } else {
            self.init(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
        }
    }
}

struct InertiaWidgetsAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var timeEnd: String
        var questsComplete: Int
        var maxQuests: Int
        var balance: Int
        var emoji: String
        var color: String
        var name: String
    }
}

struct InertiaWidgetsLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: InertiaWidgetsAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                HStack {
                    Text("6h32m left")
                        .font(.title)
                        .fontWeight(.bold)
                        .tracking(-1)
                        .foregroundStyle(Color.white)
                    
                    Spacer()
                    
                    Text("$\(context.state.balance)")
                        .foregroundStyle(Color.white)
                        .font(.title2)
                        .fontWeight(.bold)
                        .tracking(-1)
                        .opacity(0.5)
                    
                    ZStack {
                        Text(context.state.emoji)
                            .font(.system(size: 14))
                            .shadow(radius: 3)
                    }
                    .frame(width: 30, height: 30)
                    .background(
                        Color.init(hex: context.state.color).gradient.opacity(0.3)
                    )
                    .clipShape(Circle())
                }
            }
            .padding()
            .activityBackgroundTint(Color.black.opacity(0.4))
            .activitySystemActionForegroundColor(Color.white)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension InertiaWidgetsAttributes {
    fileprivate static var preview: InertiaWidgetsAttributes {
        InertiaWidgetsAttributes()
    }
}

extension InertiaWidgetsAttributes.ContentState {
    fileprivate static var mock: InertiaWidgetsAttributes.ContentState {
        InertiaWidgetsAttributes.ContentState(timeEnd: "2024-04-21T20:00:00Z", questsComplete: 2, maxQuests: 5, balance: 500, emoji: "🐳", color: "#42adf5", name: "Penguincat Inc.")
     }
}

#Preview("Notification", as: .content, using: InertiaWidgetsAttributes.preview) {
   InertiaWidgetsLiveActivity()
} contentStates: {
    InertiaWidgetsAttributes.ContentState.mock
}
