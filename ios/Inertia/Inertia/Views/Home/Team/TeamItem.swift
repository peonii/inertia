//
//  TeamItem.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import SwiftUI

struct TeamItem: View {
    var team: Team
    @EnvironmentObject private var gameService: GameService
    
    var statusText: String {
        team.isRunner ? "Runner" : "Hunter"
    }
    
    var body: some View {
        NavigationLink {
            TeamPlayWrapper(team: team)
                .ignoresSafeArea()
        } label: {
            VStack(alignment: .leading, spacing: 0) {
                ZStack {
                    Text(team.emoji)
                        .font(.system(size: 64))
                        .shadow(radius: 3)
                }
                .frame(width: 200, height: 175)
                .background(
                    Color.init(hex: team.color).gradient
                )
                
                VStack(alignment: .leading, spacing: 0) {
                    Text(team.name)
                        .font(.system(size: 24))
                        .fontWeight(.bold)
                        .tracking(-1)
                        .foregroundStyle(Color.colorPrimary)
                    
                    Text("\(team.xp) XP  •  \(statusText)")
                        .font(.system(size: 16))
                        .fontWeight(.semibold)
                        .tracking(-1)
                        .foregroundStyle(Color.colorSecondary)
                    
                    Text("$\(team.balance)")
                        .font(.system(size: 20))
                        .fontWeight(.semibold)
                        .tracking(-1)
                        .foregroundStyle(Color.colorPrimary)
                        .padding(.top)
                }
                .padding()
            }
            .background(Color.bgDarker)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .contextMenu {
                Button {
                    ActivityManager.shared.startActivity(team: team, game: gameService.games[team.gameId]!, questsComplete: 2, maxQuests: 5)
                } label: {
                    Text("Track")
                }
                
                Button {
                    
                } label: {
                    Label("Invite", systemImage: "link.badge.plus")
                }
                
                Button(role: .destructive) {
                    
                } label: {
                    Label("Delete", systemImage: "trash")
                }
            }
        }
    }
}

#Preview("TeamItem", traits: .sizeThatFitsLayout) {
    var team = Team.mock()
    
    return TeamItem(team: team)
}
