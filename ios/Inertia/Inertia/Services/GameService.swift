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
        self.hostedGames.sort(by: { $0.timeStartDate < $1.timeStartDate })
        
        for game in games {
            self.games[game.id] = game
        }
    }
    
    public func createGame(_ data: GameCreate, for authService: AuthService) async throws {
        try await authService.post(endpoint: Endpoints.GAMES_CREATE, body: data)
    }
    
    public func deleteGame(id: String, for authService: AuthService) async throws {
        try await authService.delete(endpoint: Endpoints.GAMES_DELETE(id))
    }
}
