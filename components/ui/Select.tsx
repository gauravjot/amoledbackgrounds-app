import React from "react";
import {Pressable, View} from "react-native";
import Animated, {useAnimatedStyle, withDelay, withTiming} from "react-native-reanimated";
import {Button, ButtonText} from "./Button";
import {ChevronDown} from "lucide-react-native";

/**
 * Renders a select component
 * @param defaultValue string - Default value of dropdown
 * @param {string[]} options - Options in the dropdown
 * @param {(value: string) => void} onChange - The change handler
 * @param {"left" | "right"} align - The alignment of dropdown. Default is "left".
 * @param {number} width - The width of dropdown. Default is 110.
 * @returns
 */
export default function Select({
  defaultValue,
  options,
  onChange,
  align = "left",
  width = 110,
}: {
  defaultValue: string;
  options: string[];
  onChange: (value: string) => void;
  align?: "left" | "right";
  width?: number;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(defaultValue);

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
      width: Math.max(width, 120),
    };
  });

  return (
    <View className="relative">
      <Button
        variant="ghost"
        className="pl-3 pr-2 border active:bg-white/20 rounded-xl bg-white/10 border-zinc-800"
        size="md"
        onPress={() => setIsOpen(v => !v)}>
        <ButtonText>{selected}</ButtonText>
        <ChevronDown size={20} color="white" />
      </Button>
      <Animated.View
        style={[animatedStyle]}
        className={`absolute ${align && align === "right" ? "left-0" : "right-0"} z-50 top-8`}>
        <View className="rounded-md shadow-md bg-zinc-900">
          {options.map(o => (
            <Button
              key={o}
              variant={"ghost"}
              className={`justify-start h-12 text-base ${o === selected ? "bg-accent" : ""}`}
              style={{minWidth: 110}}
              onPress={() => {
                setIsOpen(false);
                onChange(o);
                setSelected(o);
              }}>
              <ButtonText numberOfLines={1} className={o === selected ? "text-foreground" : "text-foreground/70"}>
                {o}
              </ButtonText>
            </Button>
          ))}
        </View>
      </Animated.View>
      {/* catch outside presses */}
      <Pressable
        onPress={() => setIsOpen(false)}
        className={`${!isOpen && "hidden"} absolute -top-96 -right-96 z-40 w-[200vw] h-[200vh]`}
      />
    </View>
  );
}
