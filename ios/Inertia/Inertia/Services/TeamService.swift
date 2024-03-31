//
//  TeamService.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import Foundation

@MainActor
class TeamService: ObservableObject {
    @Published var teams: [String: Team] = [:]
    @Published var joinedTeams: [Team] = []
    
    public func fetchJoinedTeams(for authService: AuthService) async throws {
        let teams = try await authService.get([Team].self, endpoint: Endpoints.USERS_ME_TEAMS)
        
        self.joinedTeams = teams
        
        for team in teams {
            self.teams[team.id] = team
        }
    }
}
