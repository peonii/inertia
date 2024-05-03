import styled from "@emotion/native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { refreshToken } from "../api/fetch";
import { ActivityIndicator } from "react-native";

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #252525;
`;

const MyzImage = styled.Image`
  position: absolute;
  top: 0px;
  width: 100%;
  height: 100%;
`;

const IndexScreen: React.FC = () => {
  const authContext = useAuth();

  const attemptLogIn = async () => {
    if (authContext.accessToken) {
      // We can assume that the token is valid
      // because it'll be refreshed if it's not
      return router.replace({
        pathname: "/home",
        params: {
          userData: "loading",
          gamesData: "loading",
          teamsData: "loading",
        },
      });
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
      <MyzImage source={require("./../../assets/splash.png")} />
      <ActivityIndicator animating size="large" color="#ffffff" />
    </CenteredView>
  );
};

export default IndexScreen;
