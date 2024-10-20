import {View} from "react-native";
import React from "react";
import {WallpaperPostType} from "@/lib/services/wallpaper_type";
import {useLocalSearchParams} from "expo-router";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";

export default function DownloadScreen() {
  const params = useLocalSearchParams();

  const wallpaper = JSON.parse(params["wallpaper"] as string) as WallpaperPostType;

  console.log("Download: ", wallpaper);

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <Text>DownloadScreen</Text>
      </View>
    </SafeAreaView>
  );
}
