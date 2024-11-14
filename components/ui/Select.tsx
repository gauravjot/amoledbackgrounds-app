import React from "react";
import {Pressable, View} from "react-native";
import Animated, {
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
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

  return (
    <View className="relative">
      <Button
        variant="ghost"
        className="pl-3 pr-2 border active:bg-white/20 rounded-xl bg-white/10 border-zinc-800"
        size="md"
        onPress={() => setIsOpen(v => !v)}>
        <ButtonText>{selected}</ButtonText>
        <ChevronDown size={20} color="white" className={isOpen ? "rotate-180" : ""} />
      </Button>
      {isOpen && (
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutUp.duration(150)}
          className={`absolute ${align && align === "right" ? "left-0" : "right-0"} z-50 top-12`}>
          <View className="rounded-md shadow-md bg-zinc-900" style={{width: width}}>
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
      )}
      {/* catch outside presses */}
      <Pressable
        onPress={() => setIsOpen(false)}
        className={`${!isOpen && "hidden"} absolute -top-96 -right-96 z-40 w-[200vw] h-[200vh]`}
      />
    </View>
  );
}
