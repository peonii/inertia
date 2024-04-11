//
//  LocationManager.swift
//  Inertia
//
//  Created by peony on 09/04/2024.
//

import Foundation
import CoreLocation

protocol LocationManagerObserver: AnyObject {
    func didUpdateLocation(_ location: CLLocation)
}

class LocationManager: NSObject, CLLocationManagerDelegate {
    static let shared = LocationManager()
    
    private let manager = CLLocationManager()
    
    var isAlwaysAuthorized = false
    var isPartialAuthorized = false
    var currentLocation: CLLocation?
    
    private lazy var observers = [LocationManagerObserver]()
    
    override private init() {
        super.init()
        
        manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        manager.distanceFilter = 40
        manager.delegate = self
    }
    
    func startUpdatingLocation() {
        manager.startUpdatingLocation()
        manager.startUpdatingHeading()
    }
    
    func stopUpdatingLocation() {
        manager.stopUpdatingHeading()
        manager.stopUpdatingLocation()
    }
    
    func registerObserver(_ observer: LocationManagerObserver) {
        self.observers.append(observer)
    }
    
    func unregisterObserver(_ observer: LocationManagerObserver) {
        if let idx = self.observers.firstIndex(where: { $0 === observer }) {
            self.observers.remove(at: idx)
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.first {
            self.currentLocation = location
            self.observers.forEach { $0.didUpdateLocation(location) }
        }
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedAlways:
            isAlwaysAuthorized = true
            isPartialAuthorized = true
        case .authorizedWhenInUse:
            isPartialAuthorized = true
        default:
            manager.requestAlwaysAuthorization()
        }
    }
}
