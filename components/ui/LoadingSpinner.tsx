import React, {useEffect} from "react";
import {Loader2} from "lucide-react-native";
import Animated, {useAnimatedStyle, useSharedValue, withRepeat, withTiming} from "react-native-reanimated";

export default function LoadingSpinner({size = 32, color = "white"}: {size?: number; color?: string}) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(1, {duration: 1000}), -1, false);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value * 2 * Math.PI}rad`,
        },
      ],
    };
  });

  return (
    <Animated.View style={[animatedStyle]}>
      <Loader2 size={size} color={color} />
    </Animated.View>
  );
}
