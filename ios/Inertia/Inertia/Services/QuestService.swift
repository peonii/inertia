//
//  QuestService.swift
//  Inertia
//
//  Created by peony on 04/05/2024.
//

import Foundation

@MainActor
class QuestService: ObservableObject {
    @Published var activeQuests: [String: [ActiveQuest]] = [:]
    @Published var processedQuests: [String: [ActiveQuest]] = [:]
    
    public func fetchActiveQuests(for authService: AuthService, teamId: String) async throws {
        let quests = try await authService.get([ActiveQuest].self, endpoint: Endpoints.TEAMS_QUESTS(teamId))
        
        self.activeQuests[teamId] = quests
        
        self.processedQuests[teamId] = quests
            .filter {
                $0.questType == "main" || !$0.complete
            }
    }
}
