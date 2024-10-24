import {View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import {useDownloadedWallpapersStore} from "@/store/downloaded_wallpapers";

export default function DownloadsScreen() {
  const downloadedWallpapersStore = useDownloadedWallpapersStore();

  console.log(downloadedWallpapersStore.files);

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <Text>Downloads</Text>
      </View>
    </SafeAreaView>
  );
}
