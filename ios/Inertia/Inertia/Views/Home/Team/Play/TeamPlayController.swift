//
//  TeamPlayController.swift
//  Inertia
//
//  Created by peony on 03/04/2024.
//

import Foundation
import UIKit
import MapKit

class TeamPlayController: UIViewController, MKMapViewDelegate, LocationManagerObserver {
    var team: Team?
    var activeQuests: [ActiveQuest] = []
    
    var mapView = MKMapView()
    var menuController = TeamPlayMenuController()
    
    var loadedInitialLocation = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        menuController.team = team
        menuController.quests = self.activeQuests
        
        mapView.preferredConfiguration = MKStandardMapConfiguration(elevationStyle: .realistic)
        
        mapView.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(mapView)
        NSLayoutConstraint.activate([
            mapView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            mapView.topAnchor.constraint(equalTo: view.topAnchor),
            mapView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            mapView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        
        mapView.delegate = self
        mapView.showsUserLocation = true
        mapView.setRegion(
            MKCoordinateRegion(center: LocationManager.shared.currentLocation?.coordinate ?? CLLocationCoordinate2D(latitude: 0, longitude: 0), span: .init(latitudeDelta: 0.04, longitudeDelta: 0.04)),
            animated: true
        )
        
        LocationManager.shared.registerObserver(self)
    }
    
    func mapViewDidChangeVisibleRegion(_ mapView: MKMapView) {
        menuController.didMoveMap()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        var feedback = UIImpactFeedbackGenerator(style: .light)
        present(menuController, animated: true)
        feedback.impactOccurred()
    }
    
    func didUpdateLocation(_ location: CLLocation) {
        print(location)
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        loadedInitialLocation = false
    }
}
