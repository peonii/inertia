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
}
