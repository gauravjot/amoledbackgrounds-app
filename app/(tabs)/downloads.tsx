import {View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";

export default function DownloadsScreen() {
  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <Text>Downloads</Text>
      </View>
    </SafeAreaView>
  );
}
