import * as React from "react";
import {Pressable, View, StyleSheet} from "react-native";
import {Button, ButtonText} from "./ui/Button";
import {ChevronDown} from "lucide-react-native";
import Animated, {useAnimatedStyle, withDelay, withTiming} from "react-native-reanimated";
import {SortOptions} from "@/constants/sort_options";
import {useSortStore} from "@/store/sort";
import TopBar from "./ui/TopBar";

export default function HomeTopBar({hide, showLoader, title}: {hide?: boolean; showLoader?: boolean; title: string}) {
  return (
    <TopBar showLoader={showLoader} title={title}>
      <SortPicker />
    </TopBar>
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
