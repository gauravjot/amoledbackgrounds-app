import {View} from "react-native";
import {Text} from "@/components/ui/Text";
import {Button, ButtonText} from "@/components/ui/Button";
import {Input} from "@/components/ui/Input";
import {SafeAreaView} from "react-native-safe-area-context";
import HomeTopBar from "@/components/HomeTopBar";

export default function HomeScreen() {
  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <HomeTopBar />
      </View>
    </SafeAreaView>
  );
}
