import {Dimensions, ScrollView, View} from "react-native";
import {Text} from "./ui/Text";
import {Button, ButtonText} from "./ui/Button";
import React from "react";
import Animated, {FadeInUp, FadeOutDown} from "react-native-reanimated";
import {Send, Sparkles} from "lucide-react-native";

export default function ChangeLogDialog({isVisible, onClose}: {isVisible: boolean; onClose: () => void}) {
  const CHANGELOG_TITLE = "🎉 V2.1.0 is here!";
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;

  const style = {
    body_header: "pb-2 mb-2 mt-4 border-b border-solid border-zinc-700 flex flex-row items-center gap-3",
    body_header_text: "leading-7 text-white",
    body_text: "text-base leading-7 text-zinc-300",
  };

  return isVisible ? (
    <View className="absolute top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-background/70">
      <Animated.View
        entering={FadeInUp.delay(100)}
        exiting={FadeOutDown.duration(200)}
        className="max-w-3xl mx-6 my-24 rounded-lg min-w-80 bg-zinc-900"
        style={{height: height - 250, maxHeight: 1000}}>
        <Text className="p-4 text-[1.5rem] font-bold">{CHANGELOG_TITLE}</Text>
        <ScrollView className="px-4">
          <Text className={style.body_text}>
            Thank You for using AmoledBackgrounds. This version brings following changes to the app —
          </Text>
          <View className={style.body_header}>
            <Sparkles size="18" color="#ffcd0a" fill="#bfa41e" />
            <Text className={style.body_header_text}>NEW</Text>
          </View>
          <Text className={style.body_text}>{`•   Black Pixel Percentage. Thanks to AmoledBot on subreddit.`}</Text>
          <Text className={style.body_text}>{`•   Support for gallery posts.`}</Text>
          <View className={style.body_header}>
            <Send size="18" color="white" />
            <Text className={style.body_header_text}>Contact Developer</Text>
          </View>
          <Text className={style.body_text}>{`Email:      droidheat@gmail.com`}</Text>
          <Text className={style.body_text}>{`Reddit:    u/droidheat\n`}</Text>
        </ScrollView>
        <Button
          variant={"accent"}
          size={"md"}
          className="m-2"
          onPress={() => {
            onClose();
          }}>
          <ButtonText className="font-semibold">Let's GO</ButtonText>
        </Button>
      </Animated.View>
    </View>
  ) : (
    <></>
  );
}
