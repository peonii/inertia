//
//  ContentView.swift
//  Inertia
//
//  Created by peony on 30/03/2024.
//

import SwiftUI

struct SplashScreen: View {
    @State private var shouldShowProgress = false
    
    var body: some View {
        VStack {
            Image("IconSplash")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .padding()
         
            ProgressView()
                .opacity(shouldShowProgress ? 1.0 : 0.0)
        }
        .task {
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            withAnimation {
                shouldShowProgress = true
            }
        }
    }
}

struct RootScreen: View {
    @StateObject private var authService = AuthService.shared
    @State var hasTriedCachedLogIn = false
    
    var body: some View {
        ZStack {
            Color.bg
                .ignoresSafeArea()
            
            if hasTriedCachedLogIn {
                if authService.user != nil {
                    HomeScreen()
                } else {
                    LoginScreen()
                }
            } else {
                SplashScreen()
            }
        }
        .environmentObject(authService)
        .task {
            do {
                authService.getRefreshTokenFromKeychain()
                try await authService.refreshAccessToken()
                try await authService.refreshUserData()
                try await
                    authService
                    .registerDevice()
            } catch {
                KeychainHelper.shared.delete(service: "inertia-auth", account: "inertia")
            }
            withAnimation {
                hasTriedCachedLogIn = true
            }
        }
    }
}

#Preview {
    RootScreen()
}
