import { router, SplashScreen, Stack } from "expo-router";
import TopBar from "../components/topBar";
import { fetchTypeSafe } from "../api/fetch";
import { Game, Team, User } from "../types";
import { ENDPOINTS } from "../api/constants";
import { View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import HomeDetails from "../components/homeDetails";
import { useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";

const Frame: React.FC = () => {
  const authContext = useAuth();

  const homeDetailsRef = useRef<BottomSheet>(null);

  const userDataRequest = useQuery({
    queryKey: ["userData"],
    queryFn: () => fetchTypeSafe<User>(ENDPOINTS.users.me, authContext),
    staleTime: 1000 * 60 * 3,
  });

  const gamesDataRequest = useQuery({
    queryKey: ["gamesData"],
    queryFn: () => fetchTypeSafe<Game[]>(ENDPOINTS.games.me, authContext),
    staleTime: 1000 * 60,
  });

  const teamsDataRequest = useQuery({
    queryKey: ["teamsData"],
    queryFn: () => fetchTypeSafe<Team[]>(ENDPOINTS.teams.me, authContext),
    staleTime: 1000 * 60,
  });

  if (userDataRequest.error || gamesDataRequest.error || teamsDataRequest.error) {
    userDataRequest.error && console.log(userDataRequest.error.message);
    gamesDataRequest.error && console.log(gamesDataRequest.error.message);
    teamsDataRequest.error && console.log(teamsDataRequest.error.message);

    router.push("/error");
  }

  const userData = userDataRequest.isPending ? "loading" : userDataRequest.data;
  const gamesData = gamesDataRequest.isPending ? "loading" : gamesDataRequest.data;
  const teamsData = teamsDataRequest.isPending ? "loading" : teamsDataRequest.data;

  console.log(userData, gamesData, teamsData);

  return (
    <View>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#181818",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontFamily: "Inter_700Bold",
          },
          headerBackTitleStyle: {
            fontFamily: "Inter_500Medium",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Index",
            headerBackTitle: "Index",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerTitle: "Login",
            headerBackTitle: "Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            headerTitle: "Home",
            headerBackTitle: "Home",
            headerShown: true,
            header: () => {
              return (
                <TopBar
                  userData={"loading"}
                  onclicks={{
                    inertiaIcon: () => {
                      router.replace("/home");
                    },
                    profilePicture: () => {
                      homeDetailsRef.current.expand();
                    },
                  }}
                />
              );
            },
          }}
          initialParams={{
            userData: userData,
            gamesData: gamesData,
            teamsData: teamsData,
            refetch: {
              teams: teamsDataRequest.refetch,
              games: gamesDataRequest.refetch,
            },
          }}
        />
        <Stack.Screen
          name="team/[id]"
          options={{
            headerTitle: "Team",
            headerBackTitle: "Home",
            headerTransparent: true,
            headerStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="error"
          options={{
            headerTitle: "Error",
            headerBackTitle: "Error",
            headerTransparent: true,
            headerStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
      </Stack>
      <HomeDetails reference={homeDetailsRef} userData={userData} />
    </View>
  );
};

export default Frame;
