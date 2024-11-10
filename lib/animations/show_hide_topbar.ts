import {useAnimatedStyle, withTiming} from "react-native-reanimated";

const hideTopBar = (duration: number) =>
  useAnimatedStyle(() => {
    return {
      top: withTiming(-200, {
        duration: duration,
      }),
    };
  });

const showTopBar = (duration: number) =>
  useAnimatedStyle(() => {
    return {
      top: withTiming(0, {
        duration: duration,
      }),
    };
  });

export {hideTopBar, showTopBar};
