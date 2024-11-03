import {Pressable, ScrollView, View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import TopBar from "@/components/ui/TopBar";
import {Switch} from "@/components/ui/Switch";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {useSettingsStore} from "@/store/settings";
import Animated, {FadeInUp} from "react-native-reanimated";
import Select from "@/components/ui/Select";
import {SortOptions} from "@/constants/sort_options";
import {CHANGELOG_URL, PLAY_STORE_URL, PRIVACY_POLICY_URL, SEARCH_HISTORY_LIMIT} from "@/appconfig";
import PlayStoreIcon from "@/assets/icons/play_store.svg";
import {hasPermissionForStorage, openAppInDeviceSettings} from "@/modules/download-manager";
import {Button} from "@/components/ui/Button";
import {
  changeDailyWallpaperSort,
  changeDailyWallpaperType,
  registerDailyWallpaperService,
  unregisterDailyWallpaperService,
} from "@/modules/dailywallpaper";
import {Asset} from "expo-asset";
import * as FileSystem from "expo-file-system";
import {getURIFromSort} from "../../lib/services/get_wallpapers";

export default function SettingsScreen() {
  const store = useSettingsStore();
  const DAILY_WALLPAPER_MODES = ["Online", "Downloaded"];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TopBar title="Settings">
        <Button
          variant={"outline"}
          size={"md"}
          className="flex flex-row px-3 rounded-xl bg-emerald-400/20 border-emerald-400/50 active:bg-emerald-300/20 items-center gap-1.5"
          onPress={async () => {
            await WebBrowser.openBrowserAsync(PLAY_STORE_URL);
          }}>
          <Text className="pr-1 font-bold">Rate us on</Text>
          <PlayStoreIcon width={20} height={20} />
          <Text className="font-bold">Play Store</Text>
        </Button>
      </TopBar>
      <View className="flex-1 bg-background">
        <ScrollView>
          <View className="flex-1 pb-24">
            <SettingSwitchComponent
              title="Daily Wallpaper"
              description="Sets the current trending wallpaper daily at the time you active this feature"
              isEnabled={store.isDailyWallpaperEnabled}
              onChange={async e => {
                store.setDailyWallpaperEnabled(e);
                if (e) {
                  const icon = Asset.fromModule(require("../../assets/images/icon.png"));
                  await icon.downloadAsync();
                  if (!icon.localUri) {
                    return;
                  }
                  // Read file as base64
                  const base64Icon = await FileSystem.readAsStringAsync(icon.localUri, {
                    encoding: FileSystem.EncodingType.Base64,
                  });
                  registerDailyWallpaperService(
                    store.dailyWallpaperMode,
                    getURIFromSort(store.dailyWallpaperSort),
                    base64Icon,
                  );
                } else {
                  unregisterDailyWallpaperService();
                }
              }}
            />
            {store.isDailyWallpaperEnabled && (
              <Animated.View entering={FadeInUp} className="z-50 flex flex-row items-center gap-3 px-4 mb-4">
                <Text className="flex-1 text-zinc-400">Select mode</Text>
                <View>
                  <Select
                    defaultValue={store.dailyWallpaperMode === "online" ? "Online" : "Downloaded"}
                    options={DAILY_WALLPAPER_MODES}
                    onChange={e => {
                      store.setDailyWallpaperMode(e.toLowerCase() as any);
                      changeDailyWallpaperType(e.toLowerCase() === "online" ? "online" : "downloaded");
                    }}
                    width={140}
                  />
                </View>
                <View>
                  {store.dailyWallpaperMode === "online" && (
                    <Select
                      defaultValue={store.dailyWallpaperSort}
                      options={Object.keys(SortOptions)}
                      onChange={e => {
                        store.setDailyWallpaperSort(SortOptions[e as keyof typeof SortOptions]);
                        changeDailyWallpaperSort(getURIFromSort(SortOptions[e as keyof typeof SortOptions]));
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
              description="Remember the last sort preferences you used in Home tab"
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

            <SettingSwitchComponent
              title="Permissions"
              description={
                "Read device images to show in Downloads tab. Modifying this may require restarting the app to take effect."
              }
              isEnabled={hasPermissionForStorage()}
              onChange={e => {
                openAppInDeviceSettings();
              }}
            />

            <Pressable
              className="p-4 active:bg-foreground/10"
              onPress={async () => {
                await WebBrowser.openBrowserAsync(CHANGELOG_URL);
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

            <View className="p-4">
              <Text className="text-zinc-400">
                Version {Constants.expoConfig?.version ?? "Unknown"}{" "}
                {Constants.expoConfig?.extra?.commit && `(${Constants.expoConfig?.extra?.commit.slice(0, 7)})`}
              </Text>
            </View>
          </View>
        </ScrollView>
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
          <Text className="mb-1 font-bold text-[16.5px]">{title}</Text>
          <Text className="text-sm text-zinc-400">{description}</Text>
        </View>
        <View>
          <Switch checked={isEnabled} onCheckedChange={onChange} />
        </View>
      </View>
    </Pressable>
  );
}
