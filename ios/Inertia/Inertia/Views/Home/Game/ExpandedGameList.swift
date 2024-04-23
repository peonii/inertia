//
//  ExpandedGameList.swift
//  Inertia
//
//  Created by peony on 08/04/2024.
//

import SwiftUI

struct ExpandedGameList: View {
    @EnvironmentObject private var gameService: GameService
    @EnvironmentObject private var authService: AuthService
        
    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            
            List(gameService.hostedGames, id: \.id) { game in
                NavigationLink {
                } label: {
                    VStack(alignment: .leading) {
                        Text(game.name)
                            .fontWeight(.semibold)
                            .tracking(-1)
                            .foregroundStyle(Color.colorPrimary)
                    }
                    .padding(.horizontal, 5)
                }
                .listRowBackground(Color.bg)
                .listRowSeparatorTint(Color.bgSecondary)
            }
            .listStyle(.plain)
            .refreshable {
                try? await gameService.fetchHostedGames(for: authService)
                // We can ignore the error here
            }
        }
        .navigationTitle("Games")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Games")
                    .fontWeight(.bold)
                    .tracking(-1)
            }
        }
        
    }
}


#Preview {
    ExpandedGameList()
}
