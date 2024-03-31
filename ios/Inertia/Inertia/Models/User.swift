//
//  User.swift
//  Inertia
//
//  Created by peony on 30/03/2024.
//

import Foundation

struct User: Codable {
    var id: String
    var name: String
    var image: String
    var authRole: String
    var createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case id = "id"
        case name = "name"
        case image = "image"
        case authRole = "auth_role"
        case createdAt = "created_at"
    }
    
    static func mock() -> User {
        User(
            id: "123",
            name: "peony",
            image: "2c65b3b20e572974ec7930440f8b809e",
            authRole: "user",
            createdAt: ""
        )
    }
}
