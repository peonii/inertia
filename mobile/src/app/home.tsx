import styled from "@emotion/native";

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #121212;
  height: 100%;
`;

const Title1 = styled.Text`
  font-size: 100px;
  font-weight: bold;
  text-align: center;
  color: #eee;
`;

const Login: React.FC = () => {
  return (
    <CenteredView>
      <Title1>after Login</Title1>
    </CenteredView>
  );
};

export default Login;
