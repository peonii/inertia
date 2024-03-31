//
//  TeamList.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import SwiftUI

struct TeamList: View {
    @EnvironmentObject private var teamService: TeamService
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Teams")
                .font(.system(size: 40))
                .fontWeight(.bold)
                .tracking(-1)
                .foregroundStyle(Color.colorPrimary)
                .padding(.horizontal, 25)
            
            ScrollView(.horizontal) {
                LazyHStack(spacing: 25) {
                    ForEach(teamService.joinedTeams, id: \.id) { team in
                        TeamItem(team: team)
                    }
                }
                .scrollTargetLayout()
            }
            .scrollIndicators(.never)
            .scrollTargetBehavior(.viewAligned)
            .frame(height: 300)
            .safeAreaPadding(.horizontal, 25)
        }
    }
}

#Preview {
    let teamService = TeamService()
    
    teamService.joinedTeams = [
        .mock(),
        .mock(id: "134")
    ]
    
    return ZStack {
        Color.bg.ignoresSafeArea()
        
        VStack {
            TeamList()
                .environmentObject(teamService)
            
            Spacer()
        }
    }
}
