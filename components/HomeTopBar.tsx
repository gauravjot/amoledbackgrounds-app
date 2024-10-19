import * as React from "react";
import {Pressable, View} from "react-native";
import TailIcon from "../assets/images/tail.svg";
import {Text} from "./ui/Text";
import {Button, ButtonText} from "./ui/Button";
import {ChevronDown} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import {SortOptions} from "@/constants/sort_options";
import {useSortStore} from "@/store/sort";

export default function HomeTopBar() {
  return (
    <View className="px-4 bg-background bg-opacity-80 backdrop-blur">
      <View className="flex flex-row items-center h-[68px] gap-4">
        <View className="size-7">
          <TailIcon width={28} height={28} />
        </View>
        <Text className="flex-1 text-lg font-bold">Amoled Backgrounds</Text>
        <SortPicker />
      </View>
    </View>
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
        size="sm"
        onPress={() => setIsOpen(v => !v)}>
        <ButtonText>{store.sort}</ButtonText>
        <ChevronDown size={20} color="white" />
      </Button>
      <Animated.View
        style={[animatedStyle]}
        className="absolute right-0 z-50 top-8">
        <View className="rounded-md shadow-md bg-zinc-900">
          {Object.entries(SortOptions).map(([_, v]) => (
            <Button
              key={v}
              variant={"ghost"}
              className="justify-start px-4 py-2 text-base"
              style={{minWidth: 110}}
              onPress={() => {
                setIsOpen(false);
                store.setSort(v);
              }}>
              <ButtonText numberOfLines={1}>{v}</ButtonText>
            </Button>
          ))}
        </View>
      </Animated.View>
      {/* catch outside presses */}
      <Pressable
        onPress={() => setIsOpen(false)}
        className={`${
          !isOpen && "hidden"
        } absolute -top-4 -right-4 z-40 w-screen h-screen`}
      />
    </View>
  );
}
