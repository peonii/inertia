//
//  TicketBuyView.swift
//  Inertia
//
//  Created by peony on 28/04/2024.
//

import Foundation
import SwiftUI

enum TicketType: String, CaseIterable {
    case bus, tram, m1, m2, km, wkd
}

struct TicketBuyView: View {
    var team: Team
    @State private var selectedTicketType: TicketType = .bus
    @State private var numberTickets = 1
    @EnvironmentObject private var authService: AuthService
    @EnvironmentObject private var teamService: TeamService
    
    var body: some View {
        VStack {
            HStack {
                Text("Tickets")
                    .tracking(-1)
                    .font(.system(size: 32))
                
                Spacer()
                
                Text("$")
                    .font(.system(size: 24))
                    .fontWeight(.bold)
                
                Text("\(team.balance)")
                    .tracking(-1)
                    .font(.system(size: 32))
                    .fontWeight(.bold)
            }
            .padding()
            
            List {
                Picker("Type", selection: $selectedTicketType) {
                    Text("Bus").tag(TicketType.bus)
                    Text("Tram").tag(TicketType.tram)
                    Text("M1").tag(TicketType.m1)
                    Text("M2").tag(TicketType.m2)
                    Text("SKM/KM").tag(TicketType.km)
                    Text("WKD").tag(TicketType.wkd)
                }
                
                Stepper("Amount - ^[\(numberTickets) Ticket](inflect: true)", value: $numberTickets, in: 1...99)
            }
            .scrollDisabled(true)
            
            Spacer()
            
            Button("Buy") {
                Task {
                    try? await teamService.buyTickets(for: authService, id: team.id, amount: numberTickets, type: selectedTicketType.rawValue)
                    try? await teamService.fetchJoinedTeams(for: authService)
                }
            }
            .font(.system(size: 24))
            .fontWeight(.semibold)
            .tracking(-1)
            .foregroundStyle(Color.colorPrimary)
            .padding(.vertical)
            .padding(.horizontal, 25)
            .background(Color.bgSecondary)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }
}
