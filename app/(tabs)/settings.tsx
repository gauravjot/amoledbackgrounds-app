import {Pressable, View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import TopBar from "@/components/ui/TopBar";
import {Switch} from "@/components/ui/Switch";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {useSettingsStore} from "@/store/settings";
import Animated, {FadeInUp} from "react-native-reanimated";
import Select from "@/components/ui/Select";
import {SortOptions} from "@/constants/sort_options";
import {PLAY_STORE_URL, PRIVACY_POLICY_URL, SEARCH_HISTORY_LIMIT} from "@/appconfig";
import PlayStoreIcon from "@/assets/icons/play_store.svg";

export default function SettingsScreen() {
  const store = useSettingsStore();
  const DAILY_WALLPAPER_MODES = ["Online", "Downloaded"];

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <TopBar title="Settings" />
        <View>
          <SettingSwitchComponent
            title="Daily Wallpaper"
            description="Sets the current trending wallpaper daily at the time you active this feature"
            isEnabled={store.isDailyWallpaperEnabled}
            onChange={e => {
              store.setDailyWallpaperEnabled(e);
            }}
          />
          {store.isDailyWallpaperEnabled && (
            <Animated.View entering={FadeInUp} className="z-50 flex flex-row items-center gap-3 px-4 mb-4">
              <Text className="flex-1 text-zinc-400">Select mode</Text>
              <View>
                <Select
                  defaultValue={store.dailyWallpaperMode}
                  options={DAILY_WALLPAPER_MODES}
                  onChange={e => {
                    store.setDailyWallpaperMode(e);
                  }}
                  width={140}
                />
              </View>
              <View>
                {store.dailyWallpaperMode === "Online" && (
                  <Select
                    defaultValue={store.dailyWallpaperSort}
                    options={Object.keys(SortOptions)}
                    onChange={e => {
                      store.setDailyWallpaperSort(SortOptions[e as keyof typeof SortOptions]);
                    }}
                    width={140}
                  />
                )}
              </View>
            </Animated.View>
          )}

          <SettingSwitchComponent
            title="Lower Thumbnail Quality"
            description="Lower the quality of the thumbnail images to save data"
            isEnabled={store.isLowerThumbnailQualityEnabled}
            onChange={e => {
              store.setLowerThumbnailQualityEnabled(e);
            }}
          />

          <SettingSwitchComponent
            title="Remember Sort Preferences"
            description="Remember the last sort preferences you used in Home"
            isEnabled={store.rememberSortPreferences}
            onChange={e => {
              store.setRememberedSortPreferences(e);
            }}
          />

          <SettingSwitchComponent
            title="Save Search History"
            description={`Remembers upto ${SEARCH_HISTORY_LIMIT} latest searches`}
            isEnabled={store.rememberSearchHistory}
            onChange={e => {
              store.setRememberedSearchHistory(e);
            }}
          />

          <Pressable
            className="p-4 active:bg-foreground/10"
            onPress={async () => {
              await WebBrowser.openBrowserAsync("https://www.google.com");
            }}>
            <Text className="font-bold">Changelog</Text>
          </Pressable>

          <Pressable
            className="p-4 active:bg-foreground/10"
            onPress={async () => {
              await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
            }}>
            <Text className="font-bold">Privacy Policy</Text>
          </Pressable>

          <Pressable
            className="flex flex-row items-center gap-1.5 p-4 active:bg-foreground/10"
            onPress={async () => {
              await WebBrowser.openBrowserAsync(PLAY_STORE_URL);
            }}>
            <Text className="pr-1 font-bold">Rate us on</Text>
            <PlayStoreIcon width={20} height={20} />
            <Text className="font-bold">Play Store</Text>
          </Pressable>

          <View className="p-4">
            <Text className="text-zinc-400">
              Version {Constants.expoConfig?.version ?? "Unknown"}{" "}
              {Constants.expoConfig?.extra?.commit && `(${Constants.expoConfig?.extra?.commit.slice(0, 7)})`}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SettingSwitchComponent({
  title,
  description,
  isEnabled,
  onChange,
}: {
  title: string;
  description: string;
  isEnabled: boolean;
  onChange: (e: boolean) => void;
}) {
  return (
    <Pressable className="active:bg-foreground/10" onPress={() => onChange(!isEnabled)}>
      <View className="flex flex-row gap-4 p-4">
        <View className="flex-1">
          <Text className="mb-1 font-bold">{title}</Text>
          <Text className="text-sm text-zinc-400">{description}</Text>
        </View>
        <View>
          <Switch checked={isEnabled} onCheckedChange={onChange} />
        </View>
      </View>
    </Pressable>
  );
}
