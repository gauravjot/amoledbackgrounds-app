import {ScrollView, View} from "react-native";
import {Text} from "./ui/Text";
import {Button, ButtonText} from "./ui/Button";
import React from "react";
import Animated, {FadeInUp, FadeOutDown} from "react-native-reanimated";

export default function ChangeLogDialog({isVisible, onClose}: {isVisible: boolean; onClose: () => void}) {
  const CHANGELOG_TITLE = "🎉 V2.0.0 Alpha Release";

  const style = {
    body_header: "pb-2 mb-2 text-white border-b border-solid border-zinc-700",
    body_text: "text-base leading-7 text-zinc-300",
  };

  return isVisible ? (
    <View className="absolute top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-background/70">
      <Animated.View
        entering={FadeInUp.delay(100)}
        exiting={FadeOutDown.duration(200)}
        className="max-w-md mx-4 my-24 rounded-lg min-w-80 max-h-[700px] bg-zinc-900">
        <Text className="p-4 text-[1.5rem] font-bold">{CHANGELOG_TITLE}</Text>
        <ScrollView className="px-4">
          <Text className={style.body_text}>
            AmoledBackgrounds Update – Major Rewrite!
            {"\n\n"}Thank You, Alpha Testers! We appreciate you for joining the alpha program and helping shape the
            future of AmoledBackgrounds. Your feedback is invaluable!
          </Text>
          <Text className={style.body_header}>{"\n"}📐 Complete Redesign</Text>
          <Text className={style.body_text}>{`•   Brand-new UI for a cleaner, modern look.`}</Text>
          <Text className={style.body_header}>{"\n"}⚙️ Improved Settings</Text>
          <Text className={style.body_text}>{`•   Save sort preferences and search history.`}</Text>
          <Text className={style.body_text}>{`•   Send error logs to help improve the app.`}</Text>
          <Text className={style.body_text}>{`•   Check required permissions easily.`}</Text>
          <Text className={style.body_header}>{"\n"}✨ NEW FEATURES</Text>
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
          <Text className={style.body_text}>
            {`\nThank you for being part of this journey! Let us know what you think of the new update by leaving a review on the Play Store, or reach out to us directly.`}
          </Text>
          <Text className={style.body_header}>{"\n"}📧 Contact Developer</Text>
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
          <ButtonText className="font-semibold">Close</ButtonText>
        </Button>
      </Animated.View>
    </View>
  ) : (
    <></>
  );
}
