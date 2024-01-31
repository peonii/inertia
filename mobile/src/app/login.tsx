import styled from "@emotion/native";

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #121212;
  height: 100%;
`;

const TitleWithInter = styled.Text`
  font-size: 100px;
  font-weight: bold;
  text-align: center;
  color: #eee;
  font-family: Inter_200ExtraLight;
`;

const TitleWithoutInter = styled.Text`
  font-size: 100px;
  font-weight: bold;
  text-align: center;
  color: #eee;
`;

const Login: React.FC = () => {
  return (
    <CenteredView>
      <TitleWithInter>Login</TitleWithInter>
      <TitleWithoutInter>Login</TitleWithoutInter>
    </CenteredView>
  );
};

export default Login;
