import {Dimensions, ScrollView, View} from "react-native";
import {Text} from "./ui/Text";
import {Button, ButtonText} from "./ui/Button";
import React from "react";
import Animated, {FadeInUp, FadeOutDown} from "react-native-reanimated";
import {PencilRuler, Send, Settings, Sparkles} from "lucide-react-native";

export default function ChangeLogDialog({isVisible, onClose}: {isVisible: boolean; onClose: () => void}) {
  const CHANGELOG_TITLE = "🎉 V2.0.0 is here!";
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
            AmoledBackgrounds Update – Major Rewrite!
            {"\n\n"}Thank You for using AmoledBackgrounds. This version brings major changes to the app, including —
          </Text>
          <View className={style.body_header}>
            <PencilRuler size="18" color="#df83a2" fill="#785765" />
            <Text className={style.body_header_text}>Complete Redesign</Text>
          </View>
          <Text className={style.body_text}>{`•   Brand-new UI for a cleaner, modern look.`}</Text>
          <View className={style.body_header}>
            <Sparkles size="18" color="#ffcd0a" fill="#bfa41e" />
            <Text className={style.body_header_text}>NEW</Text>
          </View>
          <Text className={style.body_text}>{`•   Daily Wallpaper: "Downloaded" as an option.`}</Text>
          <Text className={style.body_text}>{`•   View downloaded wallpapers post on Reddit.`}</Text>
          <Text className={style.body_text}>{`•   Delete downloaded wallpapers.`}</Text>
          <Text
            className={
              style.body_text
            }>{`•   Carousel Viewer: Swipe through downloaded wallpapers effortlessly.`}</Text>
          <Text
            className={
              style.body_text
            }>{`•   Download Progress: See percentage progress while downloading wallpapers.`}</Text>
          <View className={style.body_header}>
            <Settings size="18" color="#03a9f4" fill="#2c4d72" />
            <Text className={style.body_header_text}>Improved Settings</Text>
          </View>
          <Text className={style.body_text}>{`•   Save sort preferences and search history.`}</Text>
          <Text className={style.body_text}>{`•   Send error logs to help improve the app.`}</Text>
          <Text className={style.body_text}>{`•   Check required permissions easily.`}</Text>
          <Text className={style.body_text}>
            {`\nLet us know what you think of the new update by leaving a review on the Play Store, or reach out to us directly.`}
          </Text>
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
