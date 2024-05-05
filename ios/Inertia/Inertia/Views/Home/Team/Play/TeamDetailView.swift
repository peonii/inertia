//
//  TeamDetailView.swift
//  Inertia
//
//  Created by peony on 03/05/2024.
//

import SwiftUI

struct TeamDetailView: View {
    var team: Team
    @EnvironmentObject private var questService: QuestService
    @EnvironmentObject private var authService: AuthService
    
    var statusText: String {
        team.isRunner ? "Runner" : "Hunter"
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(team.name)
                                .font(.system(size: 24))
                                .fontWeight(.bold)
                                .tracking(-1)
                                .foregroundStyle(Color.colorPrimary)
                            
                            Text("\(team.xp) XP  •  \(statusText)")
                                .font(.system(size: 16))
                                .tracking(-1)
                                .foregroundStyle(Color.colorSecondary)
                        }
                        
                        Spacer()
                        
                        Text("$\(team.balance)")
                            .font(.system(size: 48))
                            .fontWeight(.bold)
                            .tracking(-2)
                            .foregroundStyle(Color.colorPrimary)
                    }
                    
                    HStack {
                        Spacer()
                        
                        NavigationLink {
                            TicketBuyView(team: team)
                        } label: {
                            Image(systemName: "wallet.pass.fill")
                                .padding()
                                .background(Color.backgroundSecondary)
                                .clipShape(Circle())
                        }
                    }
                    
                    Text("TASKS")
                        .font(.system(size: 16))
                        .fontWeight(.semibold)
                        .tracking(-1)
                        .foregroundStyle(Color.colorSecondary)

                    LazyVStack(alignment: .leading) {
                        ForEach(questService.processedQuests[team.id] ?? []) { quest in
                            VStack(alignment: .leading) {
                                VStack(alignment: .leading) {
                                    HStack {
                                        Image(quest.questType == "side" ? "SideQuest" : "MainQuest")
                                        
                                        VStack(alignment: .leading) {
                                            Text(quest.title)
                                                .font(.system(size: 18))
                                                .fontWeight(.bold)
                                                .tracking(-1)
                                                .lineLimit(1)
                                                .foregroundStyle(Color.colorPrimary)
                                            
                                            Text(quest.money > 0 ? "$\(quest.money)" : "\(quest.xp) XP")
                                                .font(.system(size: 16))
                                                .tracking(-1)
                                                .foregroundStyle(Color.colorSecondary)
                                        }
                                        
                                        Spacer()
                                        
                                        Image(systemName: quest.complete ? "checkmark.circle.fill" : "circle")
                                            .foregroundStyle(Color.colorSecondary)
                                            .font(.system(size: 32))
                                    }
                                    
                                    Text(quest.description)
                                        .font(.system(size: 16))
                                        .tracking(-1)
                                        .foregroundStyle(Color.colorSecondary)
                                        .lineLimit(9999)
                                        .padding(.top, 5)
                                }
                                .padding()
                                
                                Divider()
                            }
                        }
                    }
                    .background(Color.backgroundSecondary)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .padding()
            }
            .toolbar(.hidden)
            .task {
                try? await questService.fetchActiveQuests(for: authService, teamId: team.id)
            }
        }
    }
}
