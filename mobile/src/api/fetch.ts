import * as SecureStore from "expo-secure-store";
import { AuthContextType } from "../context/AuthContext";
import { ENDPOINTS } from "./constants";

/**
 * Refreshes the access token using the refresh token.
 * This function mutates the SecureStore, it may remove the refresh token
 * if it happens to be invalid (expired, for example).
 */
export async function refreshToken(authContext: AuthContextType) {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const tokenResponse = await fetch(ENDPOINTS.oauth2.token, {
    method: "POST",
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!tokenResponse.ok) {
    SecureStore.deleteItemAsync("refreshToken");
    throw new Error("Failed to refresh token");
  }

  const tokenData = await tokenResponse.json();
  authContext.setAccessToken(tokenData.access_token);
}

/**
 * Fetches data from the given URL and returns it as the given type.
 * This function does not verify the response's schema,
 * so it's possible to get a runtime error if the response does not match
 * the given type.
 *
 * Do not use this function for unauthenticated requests.
 *
 * This function mutates the SecureStore through the {@link refreshToken} function.
 */
export async function fetchTypeSafe<T>(
  url: URL | RequestInfo,
  authContext: AuthContextType,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${authContext.accessToken}`,
    },
  });

  if (response.status === 401) {
    await refreshToken(authContext);

    // Retry the original request
    const retryResponse = await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${authContext.accessToken}`,
      },
    });

    if (!retryResponse.ok) {
      throw new Error("Failed to fetch data");
    }

    return retryResponse.json() as Promise<T>;
  } else if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json() as Promise<T>;
}
