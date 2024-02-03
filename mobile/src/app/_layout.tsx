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

SplashScreen.preventAutoHideAsync();

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
              headerTitle: "NieIndex",
              headerBackTitle: "NieIndex",
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
        </Stack>
      </AuthContext.Provider>
    </GestureHandlerRootView>
  );
};

export default Layout;
