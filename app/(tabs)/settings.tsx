import {View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <Text>Settings</Text>
      </View>
    </SafeAreaView>
  );
}
