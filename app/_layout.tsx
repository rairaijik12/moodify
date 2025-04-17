import { SplashScreen, Stack } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ThemeProvider } from "@/app/(root)/properties/themecontext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "LeagueSpartan-Bold": require("../assets/fonts/LeagueSpartan-Bold.ttf"),
    "LeagueSpartan-Regular": require("../assets/fonts/LeagueSpartan-Regular.ttf"),
    "LaoSansPro-Regular": require("../assets/fonts/LaoSansPro-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
