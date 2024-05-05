//
//  TeamDetailScreen.swift
//  Inertia
//
//  Created by peony on 03/05/2024.
//

import SwiftUI
import MapKit

struct TeamDetailScreen: View {
    @State var isPresented = true
    var team: Team
    
    var body: some View {
        Map()
            .sheet(isPresented: $isPresented) {
                TeamDetailView(team: team)
                    .interactiveDismissDisabled()
                    .presentationDetents([.fraction(0.15), .fraction(0.99)])
                    .presentationDragIndicator(.hidden)
            }
            .toolbar(.hidden, for: .navigationBar)
    }
}
