//
//  LoginView.swift
//  Inertia
//
//  Created by peony on 30/03/2024.
//

import SwiftUI
import AuthenticationServices

struct LoginScreen: View {
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    @EnvironmentObject private var authService: AuthService
    
    @State var isLoggingIn = false
    
    @State var authError: AuthServiceError?
    @State var isErrorPresented = false
    
    func randomString(length: Int) -> String {
      let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      return String((0..<length).map{ _ in letters.randomElement()! })
    }
    
    func attemptLogIn() {
        Task {
            do {
                let redirectURI = "inertia://auth".addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!
                
                let state = self.randomString(length: 16)
                let endpoint = Endpoints.OAUTH2_AUTHORIZE
                    + "?client_id=inertia_ios"
                    + "&provider=discord"
                    + "&response_type=code"
                    + "&state=\(state)"
                    + "&redirect_uri=\(redirectURI)"
                
                let url = URL(string: endpoint)!
                
                let urlWithToken = try await webAuthenticationSession.authenticate(using: url, callbackURLScheme: "inertia")
                let queryItems = URLComponents(string: urlWithToken.absoluteString)?.queryItems
                
                let stateToVerify = queryItems?.first(where: { $0.name == "state" })?.value
                if stateToVerify != state {
                    return
                }
                
                let code = queryItems?.first(where: { $0.name == "code" })?.value
                if let code = code {
                    try await authService.signIn(using: code)
                }
            } catch let e as AuthServiceError {
                self.authError = e
                isErrorPresented = true
            } 
        }
    }
    
    var body: some View {
        VStack {
            Image("IconImg")
                .resizable()
                .frame(width: 100, height: 100)
                .padding(.bottom, -20)
            
            Text("Inertia")
                .font(.system(size: 64))
                .fontWeight(.bold)
                .tracking(-1)
                .foregroundStyle(Color.colorPrimary)
            
            Text("5.0")
                .font(.title)
                .fontWeight(.bold)
                .tracking(-1)
                .foregroundStyle(Color.colorSecondary)
            
            Button {
                attemptLogIn()
            } label: {
                Text("Log in with Discord")
                    .font(.title2)
                    .fontWeight(.medium)
                    .tracking(-1)
            }
            .padding()
            .background(Color.bgSecondary)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .padding(.top, 40)
        }
        .alert(isPresented: $isErrorPresented, error: authError) { _ in 
            Button("OK") {}
        } message: { error in
            Text(error.recoverySuggestion ?? "Try again later.")
        }
    }
}

#Preview {
    ZStack {
        Color.bg
            .ignoresSafeArea()
        
        LoginScreen()
            .environmentObject(AuthService())
    }
}
