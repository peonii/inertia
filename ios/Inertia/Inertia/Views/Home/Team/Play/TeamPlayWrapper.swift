//
//  TeamPlayWrapper.swift
//  Inertia
//
//  Created by peony on 03/04/2024.
//

import Foundation
import SwiftUI
import UIKit
import MapKit

struct TeamPlayWrapper: UIViewControllerRepresentable {
    var controller = TeamPlayController()
    var team: Team
    
    func makeUIViewController(context: Context) -> UIViewController {
        self.controller.team = team
        self.controller.activeQuests = [.mock(), .mock(), .mock(), .mock()]
        return self.controller
    }
    
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
