import {useAnimatedStyle, withRepeat, withSequence, withTiming} from "react-native-reanimated";

// Animations
const fadingPulseAnimation = (duration: number) =>
  useAnimatedStyle(() => {
    return {
      opacity: withRepeat(
        withSequence(
          withTiming(0.5, {
            duration: duration / 3,
          }),
          withTiming(1, {
            duration: duration / 3,
          }),
          withTiming(0.5, {
            duration: duration / 3,
          }),
        ),
        -1,
      ),
    };
  });

export {fadingPulseAnimation};
