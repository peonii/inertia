import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContext } from "../context/AuthContext";
import BottomSheet from "@gorhom/bottom-sheet";
import TopBar from "../components/topBar";
import HomeDetails from "../components/homeDetails";
import { DataContext } from "../context/DataContext";
import { Game, Team, User } from "../types";

const Layout: React.FC = () => {
  const homeDetailsRef = useRef<BottomSheet>(null);

  SplashScreen.preventAutoHideAsync();
  const queryClient = new QueryClient();
  const [accessToken, setAccessToken] = useState("");
  const [userData, setUserData] = useState("loading" as User | "loading");
  const [gamesData, setGamesData] = useState("loading" as Game[] | "loading");
  const [teamsData, setTeamsData] = useState("loading" as Team[] | "loading");

  console.log(accessToken);

  const [fontsLoaded, fontError] = useFonts({
    Inter_900Black,
    Inter_800ExtraBold,
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
    Inter_300Light,
    Inter_200ExtraLight,
    Inter_100Thin,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  const globalHeader = () => {
    return (
      <TopBar
        onclicks={{
          profilePicture: () => {
            homeDetailsRef.current.expand();
          },
        }}
      />
    );
  };

  console.log(homeDetailsRef.current);

  return (
    <DataContext.Provider
      value={{ userData, setUserData, gamesData, setGamesData, teamsData, setTeamsData }}
    >
      <AuthContext.Provider value={{ accessToken, setAccessToken }}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView
            style={{ flex: 1, height: "100%", backgroundColor: "#252525" }}
          >
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
                  header: globalHeader,
                }}
              />
              <Stack.Screen
                name="game/[id]"
                options={{
                  header: globalHeader,
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
            <HomeDetails bottomSheetRef={homeDetailsRef} />
          </GestureHandlerRootView>
        </QueryClientProvider>
      </AuthContext.Provider>
    </DataContext.Provider>
  );
};

export default Layout;
