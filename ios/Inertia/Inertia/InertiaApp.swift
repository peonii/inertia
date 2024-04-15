//
//  InertiaApp.swift
//  Inertia
//
//  Created by peony on 30/03/2024.
//

import SwiftUI

@main
struct InertiaApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            RootScreen()
        }
    }
}
