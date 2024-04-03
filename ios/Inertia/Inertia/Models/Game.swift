//
//  Game.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import Foundation

struct Game: Codable {
    var id: String
    var name: String
    var official: Bool
    var timeStart: String
    var timeEnd: String
    var locLat: Double
    var locLng: Double
    var hostId: String
    var createdAt: String
   
    var timeStartDate: Date {
        let fmtStyle: Date.ISO8601FormatStyle =
            .iso8601
            .year()
            .month()
            .day()
            .timeZone(separator: .omitted)
            .time(includingFractionalSeconds: false)
            .timeSeparator(.colon)
        
        return try! fmtStyle.parse(timeStart)
    }
    
    var timeEndDate: Date {
        let fmtStyle: Date.ISO8601FormatStyle =
            .iso8601
            .year()
            .month()
            .day()
            .timeZone(separator: .omitted)
            .time(includingFractionalSeconds: false)
            .timeSeparator(.colon)
        
        return try! fmtStyle.parse(timeEnd)
    }
    
    enum CodingKeys: String, CodingKey {
        case id = "id"
        case name = "name"
        case official = "official"
        case timeStart = "time_start"
        case timeEnd = "time_end"
        case locLat = "loc_lat"
        case locLng = "loc_lng"
        case hostId = "host_id"
        case createdAt = "created_at"
    }
    
    static func mock(id: String = "123") -> Game {
        Game(id: id, name: "Penguincat Inc.", official: true, timeStart: "2024-04-31T10:00:00+00:00", timeEnd: "2024-04-31T20:00:00+00:00", locLat: 52.23, locLng: 24.21, hostId: "123", createdAt: "2024-03-31T10:02:01+00:00")
    }
}
