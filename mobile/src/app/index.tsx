import styled from "@emotion/native";
import { router, useFocusEffect } from "expo-router";

const MassiveText = styled.Text`
  font-size: 100px;
  font-weight: bold;
  text-align: center;
  color: #eee;
`;

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #121212;
`;

const IndexScreen: React.FC = () => {
  useFocusEffect(() => {
    return router.replace("/login");
  });
  return (
    <CenteredView>
      <MassiveText>Chu.</MassiveText>
    </CenteredView>
  );
};

export default IndexScreen;
