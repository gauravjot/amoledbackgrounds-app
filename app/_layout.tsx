import {useFonts} from "expo-font";
import {Stack} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useEffect} from "react";
import "react-native-reanimated";

import "../styles/global.css";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {DarkTheme, ThemeProvider} from "@react-navigation/native";
import {useSettingsStore} from "@/store/settings";
import {useDownloadedWallpapersStore} from "@/store/downloaded_wallpapers";
import {Platform} from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Tanstack query client
  const queryClient = new QueryClient();

  // Load async storage
  const settingsStore = useSettingsStore();
  const downloadedStore = useDownloadedWallpapersStore();
  useEffect(() => {
    settingsStore.initialize();
    if (Platform.OS === "android") {
      downloadedStore.initialize();
    }
  }, []);

  // Fonts
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    DMSans_200: require("../assets/fonts/DMSans/DMSans-Thin.ttf"),
    DMSans_300: require("../assets/fonts/DMSans/DMSans-Light.ttf"),
    DMSans_400: require("../assets/fonts/DMSans/DMSans-Regular.ttf"),
    DMSans_500: require("../assets/fonts/DMSans/DMSans-Medium.ttf"),
    DMSans_600: require("../assets/fonts/DMSans/DMSans-SemiBold.ttf"),
    DMSans_700: require("../assets/fonts/DMSans/DMSans-Bold.ttf"),
    DMSans_900: require("../assets/fonts/DMSans/DMSans-Black.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DarkTheme}>
        <Stack initialRouteName="(tabs)" screenOptions={{headerShown: false}} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
