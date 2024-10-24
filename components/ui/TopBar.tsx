import {BlurView} from "expo-blur";
import {LinearGradient} from "expo-linear-gradient";
import React from "react";
import {View} from "react-native";
import LoadingSpinner from "./LoadingSpinner";
import TailIcon from "@/assets/images/tail.svg";
import {Text} from "./Text";

export interface TopBarProps {
  children?: React.ReactNode;
  showLoader?: boolean;
  title?: string;
}

const TopBar = React.forwardRef<React.ElementRef<typeof View>, TopBarProps>(
  ({title, showLoader, children, ...props}, ref) => {
    return (
      <View ref={ref} {...props}>
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
              <Text className="flex-1 text-lg font-bold">{title ?? "Amoled Backgrounds"}</Text>
              <View>{children ?? <></>}</View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

export default TopBar;
