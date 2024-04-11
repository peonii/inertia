//
//  AuthService.swift
//  Inertia
//
//  Created by peony on 30/03/2024.
//

import Foundation

enum AuthServiceError: Error {
    case invalidURLError
    case unauthenticatedError
    
    case invalidBodyError
    case fetchError
    case invalidResponseError
}

extension AuthServiceError: LocalizedError {
    public var recoverySuggestion: String? {
        switch self {
        case .unauthenticatedError:
            return NSLocalizedString("Try signing out and signing in.", comment: "Auth Service error")
        default:
            return NSLocalizedString("Try again later.", comment: "Auth Service error")
        }
    }
}

@MainActor
class AuthService: ObservableObject {
    @Published var user: User?
    var token: String?
    var refreshToken: String?
    let http: URLSession
    
    init() {
        self.http = URLSession(configuration: .default)
    }
    
    fileprivate struct AuthCodePayload: Codable {
        var code: String
        var grantType: String
        
        enum CodingKeys: String, CodingKey {
            case code = "code"
            case grantType = "grant_type"
        }
        
        init(code: String) {
            self.code = code
            self.grantType = "authorization_code"
        }
    }
    
    fileprivate struct RefreshTokenPayload: Codable {
        var refreshToken: String
        var grantType: String
        
        enum CodingKeys: String, CodingKey {
            case refreshToken = "refresh_token"
            case grantType = "grant_type"
        }
        
        init(token: String) {
            self.refreshToken = token
            self.grantType = "refresh_token"
        }
    }
    
    fileprivate struct AuthCodeResponse: Codable {
        var accessToken: String
        var tokenType: String
        var expiresIn: Int
        var refreshToken: String?
        
        enum CodingKeys: String, CodingKey {
            case accessToken = "access_token"
            case tokenType = "token_type"
            case expiresIn = "expires_in"
            case refreshToken = "refresh_token"
        }
    }
    
    //MARK: - Authentication methods
    public func refreshAccessToken() async throws {
        guard let url = URL(string: Endpoints.OAUTH2_TOKEN) else { throw AuthServiceError.invalidURLError }
        guard let token = self.refreshToken else { throw AuthServiceError.unauthenticatedError }
        
        do {
            var request =  URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let payload = RefreshTokenPayload(token: token)
            let encoded = try JSONEncoder().encode(payload)
            request.httpBody = encoded
            
            let response = try await http.data(for: request)
            let tokenObject = try JSONDecoder().decode(AuthCodeResponse.self, from: response.0)
            
            self.token = tokenObject.accessToken
        } catch is EncodingError {
            throw AuthServiceError.invalidBodyError
        } catch is DecodingError {
            throw AuthServiceError.invalidResponseError
        } catch {
            throw AuthServiceError.fetchError
        }
    }
    
    public func getRefreshTokenFromKeychain() {
        self.refreshToken = KeychainHelper.shared.read(String.self, service: "inertia-auth", account: "inertia")
    }
    
    public func refreshUserData() async throws {
        self.user = try await self.get(User.self, endpoint: Endpoints.USERS_ME)
    }
    
    public func signIn(using code: String) async throws {
        guard let url = URL(string: Endpoints.OAUTH2_TOKEN) else { return }
        
        do {
            var request =  URLRequest(url: url)
            request.httpMethod = "POST"
            
            let payload = AuthCodePayload(code: code)
            let encoded = try JSONEncoder().encode(payload)
            request.httpBody = encoded
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let response = try await http.data(for: request)
            let tokenObject = try JSONDecoder().decode(AuthCodeResponse.self, from: response.0)
            
            self.token = tokenObject.accessToken
            self.refreshToken = tokenObject.refreshToken
            KeychainHelper.shared.save(tokenObject.refreshToken ?? "", service: "inertia-auth", account: "inertia")
        } catch is EncodingError {
            throw AuthServiceError.invalidBodyError
        } catch is DecodingError {
            throw AuthServiceError.invalidResponseError
        } catch {
            throw AuthServiceError.fetchError
        }
        
        try await self.refreshUserData()
    }
    
    //MARK: - Generic request methods
    public func get<T: Codable>(_ type: T.Type, endpoint: String) async throws -> T {
        guard let url = URL(string: endpoint) else { throw AuthServiceError.invalidURLError }
        guard let token = self.token else { throw AuthServiceError.unauthenticatedError }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        print("Attempting to fetch \(endpoint)...")
        
        var response: (Data, URLResponse)
        do {
            response = try await self.http.data(for: request)
            print("Got response... \(String(data: response.0, encoding: .utf8) ?? "None")")
        } catch {
            do {
                try await self.refreshAccessToken()
                response = try await self.http.data(for: request)
                print("Got response after reauth... \(String(data: response.0, encoding: .utf8) ?? "None")")
            } catch {
                throw AuthServiceError.fetchError
            }
        }
        
        do {
            let responseObject = try JSONDecoder().decode(type.self, from: response.0)
            return responseObject
        } catch {
            throw AuthServiceError.invalidResponseError
        }
    }
    
    public func post<T: Codable>(endpoint: String, body: T) async throws {
        guard let url = URL(string: endpoint) else { throw AuthServiceError.invalidURLError }
        guard let token = self.token else { throw AuthServiceError.unauthenticatedError }
        
        do {
            var request = URLRequest(url: url)
            
            request.httpMethod = "POST"
            let bodyEncoded = try JSONEncoder().encode(body)
            request.httpBody = bodyEncoded
            
            request.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            do {
                let _ = try await self.http.data(for: request)
            } catch {
                try await self.refreshAccessToken()
                let _ = try await self.http.data(for: request)
            }
            
            return
        } catch is EncodingError {
            throw AuthServiceError.invalidBodyError
        } catch is DecodingError {
            throw AuthServiceError.invalidResponseError
        } catch {
            throw AuthServiceError.fetchError
        }
    }
    
    public func delete(endpoint: String) async throws {
        guard let url = URL(string: endpoint) else { throw AuthServiceError.invalidURLError }
        guard let token = self.token else { throw AuthServiceError.unauthenticatedError }
        
        do {
            var request = URLRequest(url: url)
            
            request.httpMethod = "DELETE"
            request.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            do {
                let _ = try await self.http.data(for: request)
            } catch {
                try await self.refreshAccessToken()
                let _ = try await self.http.data(for: request)
            }
            
            return
        } catch is EncodingError {
            throw AuthServiceError.invalidBodyError
        } catch is DecodingError {
            throw AuthServiceError.invalidResponseError
        } catch {
            throw AuthServiceError.fetchError
        }
    }
}
