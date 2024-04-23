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
import { View } from "react-native";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";

const Layout: React.FC = () => {
  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    (async () => {
      const token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log("tokenosik iwjdwoa ijdiao w", token);
    })();
  }, []);

  const queryClient = new QueryClient();
  const [accessToken, setAccessToken] = useState("");
  const [userData, setUserData] = useState("loading" as User | "loading");
  const [gamesData, setGamesData] = useState("loading" as Game[] | "loading");
  const [teamsData, setTeamsData] = useState("loading" as Team[] | "loading");
  const homeDetailsRef = useRef<BottomSheet>(null);

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
  const globalHeader = (props) => {
    return (
      <View>
        <TopBar
          onclicks={{
            profilePicture: () => {
              homeDetailsRef.current.expand();
            },
          }}
        />
        {props.route.params.dark ? (
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "#000",
              opacity: 0.4,
            }}
          ></View>
        ) : (
          ""
        )}
      </View>
    );
  };

  return (
    <DataContext.Provider
      value={{
        userData,
        setUserData,
        gamesData,
        setGamesData,
        teamsData,
        setTeamsData,
      }}
    >
      <AuthContext.Provider value={{ accessToken, setAccessToken }}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaView style={{ flex: 1 }}>
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
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    headerTitle: "Login",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="home"
                  options={{
                    headerTitle: "Home",
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
                  name="gameCreation"
                  options={{
                    header: globalHeader,
                  }}
                />
                <Stack.Screen
                  name="team/[id]"
                  options={{
                    headerTitle: "",
                    headerBackTitle: "Home",
                    headerTransparent: true,
                    headerStyle: {
                      backgroundColor: "transparent",
                    },
                  }}
                />
                <Stack.Screen
                  name="error/[message]"
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
          </SafeAreaView>
        </QueryClientProvider>
      </AuthContext.Provider>
    </DataContext.Provider>
  );
};

export default Layout;
