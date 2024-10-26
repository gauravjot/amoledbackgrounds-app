import {View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import {Button, ButtonText} from "@/components/ui/Button";
import {useNavigation, useRouter} from "expo-router";

export default function SearchScreen() {
  const router = useRouter();
  const navigate = useNavigation();

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <Text>Search</Text>
      </View>
    </SafeAreaView>
  );
}
