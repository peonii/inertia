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
            if gameService.hostedGames.count > 0 {
                NavigationLink {
                    ExpandedGameList()
                } label: {
                    HStack {
                        Text("Your games")
                            .font(.system(size: 40))
                            .fontWeight(.bold)
                            .tracking(-1)
                            .foregroundStyle(Color.colorPrimary)
                            .padding(.leading, 25)
                            .padding(.trailing, 5)
                        
                        Image(systemName: "chevron.right")
                            .fontWeight(.bold)
                            .foregroundStyle(Color.colorSecondary)
                    }
                }
            } else {
                Text("Your games")
                    .font(.system(size: 40))
                    .fontWeight(.bold)
                    .tracking(-1)
                    .foregroundStyle(Color.colorPrimary)
                    .padding(.leading, 25)
                    .padding(.trailing, 5)
            }
            
            ScrollView(.horizontal) {
                LazyHStack(spacing: 25) {
                    ForEach(gameService.hostedGames, id: \.id) { game in
                        GameItem(game: game)
                    }
                    
                    NavigationLink {
                        GameCreateScreen()
                    } label: {
                        Label {
                            Text("New")
                                .fontWeight(.semibold)
                                .tracking(-1)
                        } icon: {
                            Image(systemName: "plus")
                                .foregroundStyle(Color.colorSecondary)
                        }
                            .foregroundStyle(Color.colorSecondary)
                            .frame(width: 170, height: 50)
                            .padding()
                            .background(Color.bgDarker)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
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
