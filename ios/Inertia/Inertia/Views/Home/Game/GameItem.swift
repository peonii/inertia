//
//  GameItem.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import SwiftUI

struct GameItem: View {
    var game: Game
    @EnvironmentObject private var gameService: GameService
    @EnvironmentObject private var authService: AuthService
    
    var timeTillStart: String {
        var formatStyle = Date.RelativeFormatStyle()
        formatStyle.presentation = .numeric
        
        return game.timeStartDate.formatted(formatStyle)
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(game.name)
                    .font(.system(size: 24))
                    .fontWeight(.bold)
                    .tracking(-1)
                    .lineLimit(1)
                    .foregroundStyle(Color.colorPrimary)
                
                Group {
                    if Date.now < game.timeStartDate {
                        Text("Starts \(timeTillStart)")
                            .foregroundStyle(Color.colorSecondary)
                    } else {
                        Text("Playing  •  ")
                            .foregroundStyle(Color.colorAccentGreen)
                        + Text(game.timeEndDate, style: .timer)
                            .foregroundStyle(Color.colorAccentGreen)
                    }
                }
                .font(.system(size: 16))
                .fontWeight(.semibold)
                .tracking(-1)
            }
            
            Spacer()
        }
        .frame(width: 170, height: 50)
        .padding()
        .background(Color.bgDarker)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .contextMenu {
            Button {
                
            } label: {
                Label("Invite", systemImage: "link.badge.plus")
            }
            
            Button(role: .destructive) {
                Task {
                    try? await gameService.deleteGame(id: game.id, for: authService)
                    try? await gameService.fetchHostedGames(for: authService)
                }
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
    }
}

#Preview("GameItem", traits: .sizeThatFitsLayout) {
    var game = Game.mock()
    game.timeStart = "2024-03-31T13:20:13Z"
    game.timeEnd = "2024-03-31T16:20:13Z"
    
    return GameItem(game: game)
}
