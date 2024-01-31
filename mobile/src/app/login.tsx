import styled from "@emotion/native";
import { router } from "expo-router";

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
  top: 453px;
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

const Login: React.FC = () => {
  return (
    <CenteredView>
      <InertiaLogo source={require("./../../assets/inertia-icon.png")} />
      <Title>Inertia</Title>
      <SubTitle>5.0</SubTitle>
      <LoginButtonContainer>
        <LoginButton
          onPress={() => {
            router.replace("/home");
          }}
        >
          <LoginButtonText>Log in with Discord</LoginButtonText>
        </LoginButton>
      </LoginButtonContainer>
    </CenteredView>
  );
};

export default Login;
