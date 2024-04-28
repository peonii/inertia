//
//  Endpoints.swift
//  Inertia
//
//  Created by peony on 30/03/2024.
//

import Foundation

struct Endpoints {
    static let OAUTH2_AUTHORIZE = Constants.ENDPOINT + "/oauth2/authorize"
    static let OAUTH2_TOKEN = Constants.ENDPOINT + "/api/v5/oauth2/token"
    
    static let USERS_ME = Constants.ENDPOINT + "/api/v5/users/@me"
    static let USERS_ME_GAMES = Constants.ENDPOINT + "/api/v5/users/@me/games"
    static let USERS_ME_TEAMS = Constants.ENDPOINT + "/api/v5/users/@me/teams"
    
    static let GAMES_CREATE = Constants.ENDPOINT + "/api/v5/games"
    static let GAMES_BASE = Constants.ENDPOINT + "/api/v5/games"
    static func GAMES_DELETE(_ id: String) -> String {
        return GAMES_BASE + "/\(id)"
    }
    
    static let TEAMS_BASE = Constants.ENDPOINT + "/api/v5/teams"
    static func TEAMS_BUY_TICKET(_ id: String) -> String {
        return TEAMS_BASE + "/\(id)/buy-ticket"
    }
    
    static let DEVICES_CREATE = Constants.ENDPOINT + "/api/v5/devices"
}
