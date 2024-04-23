//
//  ExpandedTeamList.swift
//  Inertia
//
//  Created by peony on 08/04/2024.
//

import SwiftUI

struct ExpandedTeamList: View {
    @EnvironmentObject private var teamService: TeamService
    @EnvironmentObject private var authService: AuthService
        
    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            
            List(teamService.joinedTeams, id: \.id) { team in
                NavigationLink {
                    TeamPlayWrapper(team: team)
                        .ignoresSafeArea()
                } label: {
                    HStack {
                        ZStack {
                            Text(team.emoji)
                                .font(.system(size: 20))
                                .shadow(radius: 3)
                        }
                        .frame(width: 40, height: 40)
                        .background(
                            Color.init(hex: team.color).gradient.opacity(0.5)
                        )
                        .clipShape(Circle())
                        
                        VStack(alignment: .leading) {
                            Text(team.name)
                                .fontWeight(.semibold)
                                .tracking(-1)
                                .foregroundStyle(Color.colorPrimary)
                            
                            Text("$\(team.balance)  •  \(team.xp) XP")
                                .tracking(-1)
                                .foregroundStyle(Color.colorSecondary)
                        }
                        .padding(.horizontal, 5)
                    }
                    .background(Color.bg)
                }
                .listRowBackground(Color.bg)
                .listRowSeparatorTint(Color.bgSecondary)
            }
            .listStyle(.plain)
            .refreshable {
                try? await teamService.fetchJoinedTeams(for: authService)
                // We can ignore the error here
            }
        }
        .navigationTitle("Teams")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Teams")
                    .fontWeight(.bold)
                    .tracking(-1)
            }
        }
        
    }
}

#Preview {
    let teamService = TeamService()
    
    teamService.joinedTeams = [
        .mock(),
        .mock(id: "134"),
        .mock(id: "135"),
        .mock(id: "136"),
        .mock(id: "137"),
        .mock(id: "138"),
        .mock(id: "139"),
        .mock(id: "140"),
        .mock(id: "141")
    ]
    
    return ZStack {
        Color.bg.ignoresSafeArea()
        ExpandedTeamList()
    }
    .environmentObject(teamService)
        
}
