//
//  Team.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import Foundation

struct Team: Codable {
    var id: String
    var name: String
    var xp: Int
    var balance: Int
    var emoji: String
    var color: String
    var isRunner: Bool
    var vetoPeriodEnd: String
    var gameId: String
    var createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case id = "id"
        case name = "name"
        case xp = "xp"
        case balance = "balance"
        case emoji = "emoji"
        case color = "color"
        case isRunner = "is_runner"
        case vetoPeriodEnd = "veto_period_end"
        case gameId = "game_id"
        case createdAt = "created_at"
    }
    
    static func mock(id: String = "123") -> Team {
        Team(id: id, name: "Penguincat Inc.", xp: 30, balance: 500, emoji: "🐳", color: "#42adf5", isRunner: false, vetoPeriodEnd: "2024-04-30T14:57:17.002268Z", gameId: "123", createdAt: "2024-03-31T14:57:17.002268Z")
    }
}
