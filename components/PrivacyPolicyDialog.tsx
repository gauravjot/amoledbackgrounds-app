import {ScrollView, View} from "react-native";
import {Text} from "./ui/Text";
import {Button, ButtonText} from "./ui/Button";
import React from "react";
import Animated, {FadeInUp, FadeOutDown} from "react-native-reanimated";
import {PRIVACY_POLICY_URL} from "@/appconfig";
import * as WebBrowser from "expo-web-browser";

export default function PrivacyPolicyDialog({isVisible, onClose}: {isVisible: boolean; onClose: () => void}) {
  const TITLE = "Privacy Policy Update";

  const style = {
    body_header: "pb-2 mb-2 text-white border-b border-solid border-zinc-700",
    body_text: "text-base leading-7 text-zinc-300",
  };

  return isVisible ? (
    <View className="absolute top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-background/70">
      <Animated.View
        entering={FadeInUp.delay(100)}
        exiting={FadeOutDown.duration(200)}
        className="max-w-md mx-4 my-24 rounded-lg min-w-80 max-h-64 bg-zinc-900">
        <Text className="p-4 text-[1.5rem] font-bold">{TITLE}</Text>
        <ScrollView className="px-4">
          <Text className={style.body_text}>
            By clicking "I Understand" you confirm that you have read and understood the Privacy Policy.
          </Text>
          <View>
            <Button
              onPress={async () => {
                await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
              }}
              className="justify-start px-0 text-left"
              variant={"link"}>
              <ButtonText variant={"accent"}>Read Privacy Policy</ButtonText>
            </Button>
          </View>
        </ScrollView>
        <Button
          variant={"accent"}
          size={"md"}
          className="m-2"
          onPress={() => {
            onClose();
          }}>
          <ButtonText className="font-semibold">I Understand</ButtonText>
        </Button>
      </Animated.View>
    </View>
  ) : (
    <></>
  );
}
