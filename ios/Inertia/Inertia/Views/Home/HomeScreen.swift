//
//  HomeScreen.swift
//  Inertia
//
//  Created by peony on 30/03/2024.
//

import SwiftUI

struct HomeScreen: View {
    @EnvironmentObject private var authService: AuthService
    
    @StateObject var gameService = GameService()
    @StateObject var teamService = TeamService()
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.bg.ignoresSafeArea()
                
                VStack {
                    TopBarMenu()
                    
                    GameList()
                    
                    TeamList()
                        .padding(.top, 40)
                    
                    Spacer()
                }
            }
            .navigationTitle("Home")
            .toolbar(.hidden)
        }
        .scrollContentBackground(.hidden)
        .environmentObject(gameService)
        .environmentObject(teamService)
        .task {
            LocationManager.shared.startUpdatingLocation()
            
            do {
                try await gameService.fetchHostedGames(for: authService)
                try await teamService.fetchJoinedTeams(for: authService)
            } catch {}
        }
    }
}

#Preview {
    var authService = AuthService()
    authService.user = .mock()
    
    var gameService = GameService()
    gameService.hostedGames = [.mock(), .mock(id: "233"), .mock(id: "234"), .mock(id: "235")]
    
    var teamService = TeamService()
    teamService.joinedTeams = [.mock(), .mock(id: "233"), .mock(id: "234"), .mock(id: "235")]
    
    return ZStack {
        Color.bg.ignoresSafeArea()
        
        HomeScreen(gameService: gameService, teamService: teamService)
            .environmentObject(authService)
    }
}
