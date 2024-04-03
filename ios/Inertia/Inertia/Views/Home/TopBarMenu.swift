//
//  TopBarMenu.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import SwiftUI

struct TopBarUserDetailSheet: View {
    @EnvironmentObject private var authService: AuthService
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                AsyncImage(
                    url: URL(string: (authService.user?.image ?? "") + "?size=512"),
                    content: { image in
                        image.resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 80)
                            .clipShape(Circle())
                    }, placeholder: {
                        ProgressView()
                    }
                )
                
                VStack(alignment: .leading) {
                    Text(authService.user?.name ?? "")
                        .font(.system(size: 40))
                        .fontWeight(.bold)
                        .tracking(-1)
                        .lineLimit(1)
                        .foregroundStyle(Color.colorPrimary)
                    
                    Text(authService.user?.authRole.capitalized(with: .none) ?? "")
                        .font(.system(size: 24))
                        .fontWeight(.medium)
                        .tracking(-1)
                        .lineLimit(1)
                        .foregroundStyle(Color.colorSecondary)
                    
                }
                .padding(.horizontal)
                
                Spacer()
            }
            
            Spacer()
            
            Button {
                
            } label: {
                Text("Log out")
                    .font(.system(size: 24))
                    .fontWeight(.medium)
                    .tracking(-1)
                    .foregroundStyle(Color.colorPrimary)
            }
            .padding()
            .background(Color.bgSecondary)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .padding(30)
    }
}

struct TopBarMenu: View {
    @EnvironmentObject private var authService: AuthService
    
    @State private var isUserDetailVisible = false
    
    var body: some View {
        HStack {
            Image("IconImg")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 60)
                .padding(.leading, -7)
            
            Spacer()
            
            Button {
                isUserDetailVisible = true
                Haptics.impact(style: .light)
            } label: {
                HStack {
                    Text(authService.user?.name ?? "")
                        .font(.title2)
                        .fontWeight(.semibold)
                        .tracking(-1)
                        .foregroundStyle(Color.colorPrimary)
                        .padding(.trailing, 10)
                    
                    AsyncImage(
                        url: URL(string: (authService.user?.image ?? "") + "?size=512"),
                        content: { image in
                            image.resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 40)
                                .clipShape(Circle())
                        }, placeholder: {
                            ProgressView()
                        }
                    )
                    .sheet(isPresented: $isUserDetailVisible, content: {
                        TopBarUserDetailSheet()
                            .presentationDetents([.fraction(0.7)])
                            .presentationBackground(Color.bg)
                    })
                }
            }
        }
        .padding()
        .padding(.horizontal, 10)
    }
}

#Preview("TopBarMenu") {
    var authService = AuthService()
    authService.user = User.mock()
    
    return ZStack {
        Color.bg.ignoresSafeArea()
        
        VStack {
            TopBarMenu()
                .environmentObject(authService)
            
            Spacer()
        }
    }
}

#Preview("TopBarMenuDetailSheet") {
    var authService = AuthService()
    authService.user = User.mock()
    
    return ZStack {
        Color.bg.ignoresSafeArea()
        
        TopBarUserDetailSheet()
            .environmentObject(authService)
    }
}
