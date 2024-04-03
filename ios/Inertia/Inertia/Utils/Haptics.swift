//
//  Haptics.swift
//  Inertia
//
//  Created by peony on 31/03/2024.
//

import Foundation
import UIKit

class Haptics {
    static func impact(style: UIImpactFeedbackGenerator.FeedbackStyle) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }
}
