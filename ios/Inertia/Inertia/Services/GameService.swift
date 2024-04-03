//
//  GameService.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import Foundation

@MainActor
class GameService: ObservableObject {
    @Published var games: [String: Game] = [:]
    @Published var hostedGames: [Game] = []
    
    public func fetchHostedGames(for authService: AuthService) async throws {
        let games = try await authService.get([Game].self, endpoint: Endpoints.USERS_ME_GAMES)
        
        self.hostedGames = games
        
        for game in games {
            self.games[game.id] = game
        }
    }
}
