import styled from "@emotion/native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { refreshToken } from "../api/fetch";
import { useCallback } from "react";

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
  background-color: #252525;
`;

const IndexScreen: React.FC = () => {
  const authContext = useAuth();

  const attemptLogIn = async () => {
    if (authContext.accessToken) {
      // We can assume that the token is valid
      // because it'll be refreshed if it's not
      return router.replace("/home");
    }

    try {
      await refreshToken(authContext);
      return router.replace("/home");
    } catch {
      return router.replace("/login");
    }
  };

  useFocusEffect(() => {
    attemptLogIn();
  });

  // TODO: Add a splash screen here with a loading spinner
  return (
    <CenteredView>
      <MassiveText>Chuj</MassiveText>
    </CenteredView>
  );
};

export default IndexScreen;
