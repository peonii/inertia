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
import { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContext } from "../context/AuthContext";
import Frame from "./frame";

const Layout: React.FC = () => {
  SplashScreen.preventAutoHideAsync();
  const queryClient = new QueryClient();
  const [accessToken, setAccessToken] = useState("");
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
  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1, height: "100%" }}>
          <Frame />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

export default Layout;
