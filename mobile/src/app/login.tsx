import styled from "@emotion/native";
import * as AuthSession from "expo-auth-session";
import { useAuthRequest } from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../context/AuthContext";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { Alert } from "react-native";
import { ENDPOINTS } from "../api/constants";

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #252525;
  height: 100%;
`;

const InertiaLogo = styled.Image`
  width: 100px;
  height: 100px;
  position: absolute;
  top: 162px;
`;

const Title = styled.Text`
  font-size: 64px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.9px;
  position: absolute;
  top: 279px;
`;

const SubTitle = styled.Text`
  font-size: 27px;
  color: #7c7c7c;
  font-family: Inter_700Bold;
  letter-spacing: -1.6px;
  position: absolute;
  top: 353px;
`;

const LoginButtonContainer = styled.View`
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 200px;
`;

const LoginButton = styled.Pressable`
  background-color: #3d3d3d;
  width: 244px;
  height: 61px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`;

const LoginButtonText = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.6px;
`;

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: ENDPOINTS.oauth2.authorize,
  tokenEndpoint: ENDPOINTS.oauth2.token,
};

const Login: React.FC = () => {
  const authContext = useAuth();
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "Inertia_mobile_app",
      usePKCE: false,
      redirectUri: AuthSession.makeRedirectUri({
        scheme: "inertia",
      }),
      extraParams: { provider: "discord" },
    },
    discovery
  );

  async function login(code: string) {
    const response = await fetch(discovery.tokenEndpoint, {
      body: JSON.stringify({ grant_type: "authorization_code", code: code }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = (await response.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
    };

    authContext.setAccessToken(data.access_token);
    await SecureStore.setItemAsync("refreshToken", data.refresh_token);

    router.replace("/home");
  }

  React.useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      (async () => {
        try {
          await login(code);
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "An error occurred while logging in.");
        }
      })();
    } else if (response?.type === "error") {
      Alert.alert("Error", "An error occurred while logging in.");
    }
  }, [response]);

  return (
    <CenteredView>
      <InertiaLogo source={require("./../../assets/inertia-icon.png")} />
      <Title>Inertia</Title>
      <SubTitle>5.0</SubTitle>
      <LoginButtonContainer>
        <LoginButton
          onPress={() => {
            promptAsync();
            //router.replace("/home");
          }}
        >
          <LoginButtonText disabled={!request}>Log in with Discord</LoginButtonText>
        </LoginButton>
      </LoginButtonContainer>
    </CenteredView>
  );
};

export default Login;
