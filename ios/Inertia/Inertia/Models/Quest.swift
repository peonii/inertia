//
//  Quest.swift
//  Inertia
//
//  Created by peony on 10/04/2024.
//

import Foundation

struct ActiveQuest: Codable, Identifiable {
    var id: String
    var questId: String
    var gameId: String
    var title: String
    var description: String
    var questType: String
    var money: Int
    var xp: Int
    var groupId: String
    var lat: Double?
    var lng: Double?
    var createdAt: String
    var complete: Bool
    
    enum CodingKeys: String, CodingKey {
        case id = "id"
        case questId = "quest_id"
        case gameId = "game_id"
        case title = "title"
        case description = "description"
        case questType = "quest_type"
        case money = "money"
        case xp = "xp"
        case groupId = "group_id"
        case lat = "lat"
        case lng = "lng"
        case createdAt = "created_at"
        case complete = "complete"
    }
    
    static func mock() -> Self {
        return ActiveQuest(id: "123", questId: "123", gameId: "123", title: "Wykasuj Sploya", description: "Wykasuj Sploya. Zrób to, zanim cię zje, tylko szybko! Nie chcesz aby cię dopadł Witecki. On jest głodny.", questType: "main", money: 0, xp: 300, groupId: "123", createdAt: "asdf", complete: false)
    }
}
