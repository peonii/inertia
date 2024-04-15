import styled from "@emotion/native";
import { router, useLocalSearchParams } from "expo-router";

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #252525;
  height: 100%;
`;

const PressableContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.Text`
  font-family: Inter_500Medium;
  color: #fff;
  text-align: center;
  width: 75%;
`;

const TetriaryButton = styled.Text`
  font-family: Inter_500Medium;
  font-size: 16px;
  text-decoration: underline;
  color: #7c7c7c;
`;

const Error: React.FC = () => {
  const { message } = useLocalSearchParams<{ message: string }>();
  return (
    <CenteredView>
      <ErrorMessage>{message}</ErrorMessage>
      <PressableContainer onPress={router.back}>
        <TetriaryButton>Retry</TetriaryButton>
      </PressableContainer>
    </CenteredView>
  );
};

export default Error;
