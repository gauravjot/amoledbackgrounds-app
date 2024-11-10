import {ScrollView, View} from "react-native";
import {Text} from "./ui/Text";
import {Button, ButtonText} from "./ui/Button";
import React from "react";
import Animated, {FadeInUp, FadeOutDown} from "react-native-reanimated";

export default function ChangeLogDialog({isVisible, onClose}: {isVisible: boolean; onClose: () => void}) {
  return isVisible ? (
    <View className="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-background/70">
      <Animated.View
        entering={FadeInUp.delay(100)}
        exiting={FadeOutDown.duration(200)}
        className="max-w-md mx-4 my-24 rounded-lg min-w-80 max-h-[500px] bg-zinc-900">
        <Text className="p-4 text-[1.5rem] font-bold">Version 2.0.0 is here! 🎉</Text>
        <ScrollView className="px-4">
          <Text className="text-base leading-7 text-zinc-300">
            - Fixed some bugs {"\n"}- Added some new features Added some new features Added some new features Added some
            new features Added some new features Added some new features Added some new features Added some new features
            Added some new features Added some new features Added some new features Added some new features Added some
            new features Added some new features Added some new features Added some new features Added some new features
            Added some new features Added some new features Added some new features Added some new features Added some
            new features Added some new features Added some new features Added some new features Added some new features
            Added some new features Added some new features Added some new features Added some new features Added some
            new features Added some new features Added some new features Added some new features Added some new features
            Added some new features Added some new features Added some new features Added some new features Added some
            new features Added some new features Added some new features Added some new features Added some new features
            Added some new features
            {"\n"}- Improved performance
          </Text>
        </ScrollView>
        <Button
          variant={"accent"}
          size={"md"}
          className="m-2"
          onPress={() => {
            onClose();
          }}>
          <ButtonText className="font-semibold">Close</ButtonText>
        </Button>
      </Animated.View>
    </View>
  ) : (
    <></>
  );
}
