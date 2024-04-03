//
//  GameList.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import SwiftUI

struct GameList: View {
    @EnvironmentObject private var gameService: GameService
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Your games")
                .font(.system(size: 40))
                .fontWeight(.bold)
                .tracking(-1)
                .foregroundStyle(Color.colorPrimary)
                .padding(.horizontal, 25)
            
            ScrollView(.horizontal) {
                LazyHStack(spacing: 25) {
                    ForEach(gameService.hostedGames, id: \.id) { game in
                        GameItem(game: game)
                    }
                }
                .scrollTargetLayout()
            }
            .scrollIndicators(.never)
            .scrollTargetBehavior(.viewAligned)
            .frame(height: 80)
            .safeAreaPadding(.horizontal, 25)
        }
    }
}

#Preview {
    let gameService = GameService()
    
    gameService.hostedGames = [
        .mock(),
        .mock(id: "134")
    ]
    
    return ZStack {
        Color.bg.ignoresSafeArea()
        
        VStack {
            GameList()
                .environmentObject(gameService)
            
            Spacer()
        }
    }
}
