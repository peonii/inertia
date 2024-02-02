import styled from "@emotion/native";
import { router } from "expo-router";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest } from "expo-auth-session";
import React = require("react");

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
  top: 540px;
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
  authorizationEndpoint: "https://inertia-devel.fly.dev/oauth2/authorize",
  tokenEndpoint: "https://inertia-devel.fly.dev/oauth2/token",
};

const Login: React.FC = () => {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "Inertia_mobile_app",
      usePKCE: false,
      redirectUri: AuthSession.makeRedirectUri({
        scheme: "inertia",
      }),
    },
    discovery
  );

  async function login(code: string) {
    const response = await fetch("https://inertia-devel.fly.dev/api/v5/oauth2/token", {
      body: JSON.stringify({ grant_type: "authorization_code", code: code }),
      method: "POST",
    });
    const data = await response.json();
    console.log(data);
  }

  React.useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      login(code);
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
            // router.replace("/home");
          }}
        >
          <LoginButtonText disabled={!request}>Log in with Discord</LoginButtonText>
        </LoginButton>
      </LoginButtonContainer>
    </CenteredView>
  );
};

export default Login;
