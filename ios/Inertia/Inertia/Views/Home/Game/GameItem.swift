//
//  GameItem.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import SwiftUI

struct GameItem: View {
    var game: Game
    
    var timeTillStart: String {
        var formatStyle = Date.RelativeFormatStyle()
        formatStyle.presentation = .numeric
        
        return game.timeStartDate.formatted(formatStyle)
    }
    
    var body: some View {
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
                        .foregroundStyle(.green)
                    + Text(game.timeEndDate, style: .timer)
                        .foregroundStyle(.green)
                }
            }
                .font(.system(size: 16))
                .fontWeight(.semibold)
                .tracking(-1)
        }
        .padding()
        .background(Color.bgDarker)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

#Preview("GameItem", traits: .sizeThatFitsLayout) {
    var game = Game.mock()
    game.timeStart = "2024-03-31T13:20:13+00:00"
    game.timeEnd = "2024-03-31T16:20:13+00:00"
    
    return GameItem(game: game)
}
