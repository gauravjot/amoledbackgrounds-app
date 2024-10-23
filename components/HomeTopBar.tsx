import * as React from "react";
import {Pressable, View, StyleSheet} from "react-native";
import TailIcon from "../assets/images/tail.svg";
import {Text} from "./ui/Text";
import {Button, ButtonText} from "./ui/Button";
import {ChevronDown} from "lucide-react-native";
import Animated, {useAnimatedStyle, withDelay, withTiming} from "react-native-reanimated";
import {SortOptions} from "@/constants/sort_options";
import {useSortStore} from "@/store/sort";
import {BlurView} from "expo-blur";
import {LinearGradient} from "expo-linear-gradient";
import LoadingSpinner from "./ui/LoadingSpinner";

export default function HomeTopBar({hide, showLoader}: {hide?: boolean; showLoader?: boolean}) {
  const styles = StyleSheet.create({
    blurOverlay: {},
  });

  return (
    <>
      <BlurView
        className="absolute top-0 bottom-0 left-0 right-0"
        intensity={20}
        experimentalBlurMethod={"dimezisBlurView"}
      />
      <LinearGradient colors={["black", "rgba(0,0,0,0.25)"]}>
        <View className="px-4 bg-background/20">
          <View className="flex flex-row items-center h-[68px] gap-4">
            <View className="flex items-center justify-center size-7">
              {showLoader ? <LoadingSpinner size={32} /> : <TailIcon width={28} height={28} />}
            </View>
            <Text className="flex-1 text-lg font-bold">Amoled Backgrounds</Text>
            <SortPicker />
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

function SortPicker() {
  const [isOpen, setIsOpen] = React.useState(false);

  const store = useSortStore();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      marginTop: withTiming(isOpen ? 10 : 0, {
        duration: 250,
      }),
      opacity: withDelay(
        50,
        withTiming(isOpen ? 1 : 0, {
          duration: 150,
        }),
      ),
      display: isOpen ? "flex" : "none",
    };
  });

  return (
    <View className="relative">
      <Button
        variant="ghost"
        className="border active:bg-white/20 rounded-xl bg-white/10 border-zinc-800"
        size="md"
        onPress={() => setIsOpen(v => !v)}>
        <ButtonText>{store.sort}</ButtonText>
        <ChevronDown size={20} color="white" />
      </Button>
      <Animated.View style={[animatedStyle]} className="absolute right-0 z-50 top-8">
        <View className="rounded-md shadow-md bg-zinc-900">
          {Object.entries(SortOptions).map(([_, v]) => (
            <Button
              key={v}
              variant={"ghost"}
              className={`justify-start text-base ${store.sort === v ? "bg-accent" : ""}`}
              style={{minWidth: 110}}
              onPress={() => {
                setIsOpen(false);
                store.setSort(v);
              }}>
              <ButtonText numberOfLines={1} className={store.sort === v ? "text-foreground" : "text-foreground/70"}>
                {v}
              </ButtonText>
            </Button>
          ))}
        </View>
      </Animated.View>
      {/* catch outside presses */}
      <Pressable
        onPress={() => setIsOpen(false)}
        className={`${!isOpen && "hidden"} absolute -top-4 -right-4 z-40 w-screen h-screen`}
      />
    </View>
  );
}
