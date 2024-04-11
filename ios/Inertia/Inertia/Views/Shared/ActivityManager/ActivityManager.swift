//
//  ActivityManager.swift
//  Inertia
//
//  Created by peony on 10/04/2024.
//

import Foundation
import ActivityKit

struct InertiaWidgetsAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var timeEnd: String
        var questsComplete: Int
        var maxQuests: Int
        var balance: Int
        var emoji: String
        var color: String
        var name: String
    }
}

class ActivityManager {
    static let shared = ActivityManager()
    
    private init() {}
    
    private var currentActivity: Activity<InertiaWidgetsAttributes>?
    
    public func startActivity(team: Team, game: Game, questsComplete: Int, maxQuests: Int) {
        var attr = InertiaWidgetsAttributes()
        var state = InertiaWidgetsAttributes.ContentState(timeEnd: game.timeEnd, questsComplete: 2, maxQuests: 5, balance: team.balance, emoji: team.emoji, color: team.color, name: game.name)
        
        do {
            let activity = try Activity.request(
                attributes: attr,
                content: .init(state: state, staleDate: nil),
                pushType: .token
            )
            
            self.currentActivity = activity
        } catch {
            print("\(error.localizedDescription)")
        }
    }
}
