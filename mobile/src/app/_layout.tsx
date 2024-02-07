import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Inter_900Black,
  Inter_800ExtraBold,
  Inter_700Bold,
  Inter_600SemiBold,
  Inter_500Medium,
  Inter_400Regular,
  Inter_300Light,
  Inter_200ExtraLight,
  Inter_100Thin,
  useFonts,
} from "@expo-google-fonts/inter";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContext } from "../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

const Layout: React.FC = () => {
  const [accessToken, setAccessToken] = useState("");

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
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthContext.Provider value={{ accessToken, setAccessToken }}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#181818",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
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
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="game"
              options={{
                headerTitle: "Game",
                headerBackTitle: "Game",
                headerShown: false,
              }}
            />
          </Stack>
        </AuthContext.Provider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

export default Layout;
