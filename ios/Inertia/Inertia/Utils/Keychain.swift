//
//  Keychain.swift
//  Inertia
//
//  Created by peony on 30/03/2024.
//

import Foundation

enum KeychainError: Error {
    case noAuthKey
    case unexpectedData
    case unhandledError(status: OSStatus)
}

final class KeychainHelper {
    static let shared = KeychainHelper()
    private init() {}
    
    func save(_ data: Data, service: String, account: String) {
        let query = [
            kSecValueData: data,
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: service,
            kSecAttrAccount: account
        ] as [CFString : Any] as CFDictionary
        
        let status = SecItemAdd(query, nil)
        
//        if status != errSecSuccess {
//            print("An error has occured while saving credentials.")
//        }
    }
    
    func save<T>(_ item: T, service: String, account: String) where T: Codable {
        do {
            let data = try JSONEncoder().encode(item)
            save(data, service: service, account: account)
        } catch {}
    }
    
    func read(service: String, account: String) -> Data? {
        let query = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecReturnData: true
        ] as [CFString : Any] as CFDictionary
        
        var result: AnyObject?
        SecItemCopyMatching(query, &result)
        
        return (result as? Data)
    }
    
    func read<T>(_ type: T.Type, service: String, account: String) -> T? where T: Codable {
        guard let data = read(service: service, account: account) else {
            return nil
        }
        
        do {
            let item = try JSONDecoder().decode(type, from: data)
            return item
        } catch {
            return nil
        }
    }
    
    func delete(service: String, account: String) {
        let query = [
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecClass: kSecClassGenericPassword,
        ] as [CFString : Any] as CFDictionary
        
        SecItemDelete(query)
    }
}
