//
//  GameCreateScreen.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import SwiftUI
import MapKit

struct GameCreateScreen: View {
    @EnvironmentObject private var authService: AuthService
    @EnvironmentObject private var gameService: GameService
    
    @State private var formStage = 0
    @State private var previousStage = -1
    @Environment(\.dismiss) var dismiss
    
    @State private var name = ""
    
    @State private var startDate = Date()
    @State private var endDate = Date()
    
    @State private var mapPickerShown = false
    @State private var pickedLocation = CLLocationCoordinate2D()
    @State private var pickedLocationString = ""
    
    @State private var isSubmitting = false
    
    func submit() async throws {
        let fmtStyle: Date.ISO8601FormatStyle =
            .iso8601
            .year()
            .month()
            .day()
            .timeZone(separator: .omitted)
            .time(includingFractionalSeconds: false)
            .timeSeparator(.colon)
        
        let ts = fmtStyle.format(startDate)
        let te = fmtStyle.format(endDate)
        
        var gameData = GameCreate(name: name, timeStart: ts, timeEnd: te, locLat: pickedLocation.latitude, locLng: pickedLocation.longitude, hostId: authService.user!.id)
        
        try await gameService.createGame(gameData, for: authService)
    }
    
    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            
            VStack(alignment: .leading) {
                TopBarMenu()
                
                VStack(alignment: .leading) {
                    Text("Host your game")
                        .font(.system(size: 40))
                        .fontWeight(.bold)
                        .tracking(-1)
                        .foregroundStyle(Color.colorPrimary)
                    
                    HStack {
                        ForEach(0..<3) { idx in
                            RoundedRectangle(cornerRadius: 6)
                                .fill(formStage >= idx ? Color.colorAccentGreen : Color.colorSecondary)
                                .frame(width: formStage == idx ? 88 : 12, height: 12)
                        }
                    }
                    
                    Text("\(formStage + 1)/3")
                        .font(.system(size: 24))
                        .fontWeight(.medium)
                        .tracking(-1)
                        .foregroundStyle(Color.colorAccentGreen)
                }
                    .padding(.horizontal, 25)
                
                if formStage == 0 {
                    VStack(alignment: .leading) {
                        Text("What's your game called?")
                            .font(.system(size: 20))
                            .fontWeight(.medium)
                            .tracking(-1)
                            .foregroundStyle(Color.colorSecondary)
                            .padding(.bottom, 5)
                        
                        TextField("Name", text: $name)
                            .font(.system(size: 20))
                            .fontWeight(.medium)
                            .tracking(-1)
                            .padding()
                            .background(Color.bgSecondary)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                    .padding(.horizontal, 25)
                    .padding(.vertical)
                    .transition(.push(from: previousStage > formStage ? .leading : .trailing))
                } else if formStage == 1 {
                    VStack(alignment: .leading) {
                        Text("When is it starting?")
                            .font(.system(size: 20))
                            .fontWeight(.medium)
                            .tracking(-1)
                            .foregroundStyle(Color.colorSecondary)
                            .padding(.bottom, 5)
                        
                        DatePicker(
                            "Start Date",
                            selection: $startDate,
                            displayedComponents: [
                                .date, .hourAndMinute
                            ]
                        )
                        .font(.system(size: 24))
                        .fontWeight(.medium)
                        .tracking(-1)
                        DatePicker(
                            "End Date",
                            selection: $endDate,
                            displayedComponents: [
                                .date, .hourAndMinute
                            ]
                        )
                        .font(.system(size: 24))
                        .fontWeight(.medium)
                        .tracking(-1)
                    }
                    .padding(.horizontal, 25)
                    .padding(.vertical)
                    .transition(.push(from: previousStage > formStage ? .leading : .trailing))
                } else if formStage == 2 {
                    VStack(alignment: .leading) {
                        Text("Where is it taking place?")
                            .font(.system(size: 20))
                            .fontWeight(.medium)
                            .tracking(-1)
                            .foregroundStyle(Color.colorSecondary)
                            .padding(.bottom, 5)
                        
                        HStack {
                            Text(pickedLocationString.count > 0 ? pickedLocationString : "None")
                                .font(.system(size: 24))
                                .fontWeight(.medium)
                                .tracking(-1)
                                .foregroundStyle(Color.colorPrimary)
                            
                            Spacer()
                            
                            Button("Edit") {
                                mapPickerShown = true
                            }
                            .font(.system(size: 24))
                            .fontWeight(.medium)
                            .tracking(-1)
                            .foregroundStyle(Color.colorSecondary)
                            .sheet(isPresented: $mapPickerShown, content: {
                                ZStack {
                                    LocationPicker(location: $pickedLocation, place: $pickedLocationString)
                                    
                                    VStack {
                                        Spacer()
                                        
                                        Button("Confirm") {
                                            mapPickerShown = false
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
                            })
                        }
                    }
                    .padding(.horizontal, 25)
                    .padding(.vertical)
                    .transition(.push(from: previousStage > formStage ? .leading : .trailing))
                }
                
                Spacer()
                
                HStack {
                    Spacer()
                    
                    if formStage == 0 {
                        Button("Cancel") {
                            dismiss()
                        }
                        .font(.system(size: 20))
                        .fontWeight(.medium)
                        .tracking(-1)
                        .foregroundStyle(Color.colorSecondary)
                    } else {
                        Button("Back") {
                            withAnimation {
                                previousStage = formStage
                                formStage -= 1
                            }
                        }
                        .font(.system(size: 20))
                        .fontWeight(.medium)
                        .tracking(-1)
                        .foregroundStyle(Color.colorSecondary)
                    }
                    
                    Spacer()
                    
                    if formStage == 2 {
                        Button {
                            if isSubmitting {
                                return
                            }
                            
                            Task {
                                do {
                                    isSubmitting = true
                                    try await submit()
                                    isSubmitting = false
                                    dismiss()
                                    
                                    try await gameService.fetchHostedGames(for: authService)
                                } catch {
                                    isSubmitting = false
                                }
                            }
                        } label: {
                            if isSubmitting {
                                ProgressView()
                            } else {
                                Text("Create")
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
                    } else {
                        Button("Next") {
                            withAnimation {
                                if formStage == 0 && name.count == 0 {
                                    return
                                }
                                if formStage == 1 && startDate > endDate {
                                    return
                                }
                                previousStage = formStage
                                formStage += 1
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
                    
                    Spacer()
                    
                    Button("Cancel") {}
                    .font(.system(size: 20))
                    .fontWeight(.medium)
                    .tracking(-1)
                    .foregroundStyle(Color.colorSecondary)
                    .opacity(0)
                    
                    Spacer()
                }
                .padding(.bottom)
            }
            
        }
        .toolbar(.hidden)
    }
}

#Preview {
    var authService = AuthService()
    authService.user = .mock()
    
    return GameCreateScreen()
        .environmentObject(authService)
}
