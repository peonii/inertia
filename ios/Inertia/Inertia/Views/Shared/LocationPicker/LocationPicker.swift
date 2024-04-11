//
//  LocationPicker.swift
//  Inertia
//
//  Created by peony on 08/04/2024.
//

import Foundation
import UIKit
import SwiftUI
import MapKit

class LocationPickerViewController: UIViewController, MKMapViewDelegate, UIGestureRecognizerDelegate {
    let mapView = MKMapView()
    let gRecognizer = UITapGestureRecognizer()
    let geocoder = CLGeocoder()
    
    var hasLoaded = false
    var placedPinCoordinates: Binding<CLLocationCoordinate2D>?
    var placedPinAddress: Binding<String>?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        mapView.delegate = self
        gRecognizer.delegate = self
        
        mapView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(mapView)
        NSLayoutConstraint.activate([
            mapView.topAnchor.constraint(equalTo: view.topAnchor),
            mapView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            mapView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            mapView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        
        gRecognizer.numberOfTouchesRequired = 1
        mapView.addGestureRecognizer(gRecognizer)
        
        mapView.setRegion(
            MKCoordinateRegion(center: LocationManager.shared.currentLocation?.coordinate ?? CLLocationCoordinate2D(latitude: 0, longitude: 0), span: .init(latitudeDelta: 0.4, longitudeDelta: 0.4)),
            animated: true
        )
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        hasLoaded = false
    }
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        let coords = mapView.convert(touch.location(in: mapView), toCoordinateFrom: mapView)
        withAnimation {
            let annotations = mapView.annotations
            mapView.removeAnnotations(annotations)
            
            let placedPin = MKPointAnnotation()
            placedPin.coordinate = coords
            if var placedPinCoordinates {
                placedPinCoordinates.wrappedValue = coords
                placedPinCoordinates.update()
            }
            
            if var placedPinAddress {
                let loc = CLLocation(latitude: coords.latitude, longitude: coords.longitude)
                geocoder.reverseGeocodeLocation(loc) { placemark, err in
                    if let place = placemark?.first {
                        placedPinAddress.wrappedValue =
                            place.name ??
                            place.subAdministrativeArea ??
                            place.administrativeArea ??
                            place.country ??
                            place.ocean ??
                            "Unknown location"
                        
                        placedPinAddress.update()
                    }
                }
            }
            
            mapView.addAnnotation(placedPin)
        }
        
        return true
    }
}

struct LocationPicker: UIViewControllerRepresentable {
    let location: Binding<CLLocationCoordinate2D>
    let place: Binding<String>
    
    func makeUIViewController(context: Context) -> LocationPickerViewController {
        let vc = LocationPickerViewController()
        
        vc.placedPinCoordinates = location
        vc.placedPinAddress = place
        
        return vc
    }
    
    func updateUIViewController(_ uiViewController: LocationPickerViewController, context: Context) {
    }
}
