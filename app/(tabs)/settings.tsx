import {Pressable, ScrollView, ToastAndroid, View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import TopBar from "@/components/ui/TopBar";
import {Switch} from "@/components/ui/Switch";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {useSettingsStore} from "@/store/settings";
import Select from "@/components/ui/Select";
import {SortOptions} from "@/constants/sort_options";
import {PLAY_STORE_URL, PRIVACY_POLICY_URL, SEARCH_HISTORY_LIMIT} from "@/appconfig";
import PlayStoreIcon from "@/assets/icons/play_store.svg";
import {
  hasPermissionForStorage,
  openAppInDeviceSettings,
  requestStoragePermissionsAsync,
} from "@/modules/download-manager";
import {Button} from "@/components/ui/Button";
import {
  changeDailyWallpaperSort,
  changeDailyWallpaperType,
  registerDailyWallpaperService,
  unregisterDailyWallpaperService,
} from "@/modules/dailywallpaper";
import {getURIFromSort} from "../../lib/services/get_wallpapers";
import ChangeLogDialog from "@/components/ChangeLog";
import * as SqlUtility from "@/lib/utils/sql";

export default function SettingsScreen() {
  const store = useSettingsStore();
  const DAILY_WALLPAPER_MODES = ["Online", "Downloaded"];
  const [showChangeLog, setShowChangeLog] = React.useState(false);

  return (
    <>
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
                  try {
                    await registerDailyWallpaperService(
                      store.dailyWallpaperMode,
                      getURIFromSort(store.dailyWallpaperSort),
                    );
                  } catch (err) {
                    SqlUtility.insertErrorLog(
                      {
                        file: "(tabs)/settings.tsx[SettingsScreen]",
                        description: "Failed to enable daily wallpaper",
                        error_title: "Daily Wallpaper Error",
                        method: "JSX SettingSwitchComponent",
                        params: JSON.stringify({}),
                        severity: "error",
                        stacktrace: typeof err === "string" ? err : "",
                      },
                      store.deviceIdentifier,
                    );
                    console.error(err);
                    ToastAndroid.showWithGravity("Failed to enable", ToastAndroid.SHORT, ToastAndroid.CENTER);
                    store.setDailyWallpaperEnabled(false);
                  }
                } else {
                  await unregisterDailyWallpaperService();
                }
              }}
            />
            <View className="z-50 flex flex-row items-center gap-3 px-4 mb-4">
              <Text className="flex-1 text-zinc-400">Select mode</Text>
              <View>
                <Select
                  defaultValue={store.dailyWallpaperMode === "online" ? "Online" : "Downloaded"}
                  options={DAILY_WALLPAPER_MODES}
                  onChange={async e => {
                    if (e === "downloadeded") {
                      if (!hasPermissionForStorage()) {
                        await requestStoragePermissionsAsync();
                      }
                      if (!hasPermissionForStorage()) {
                        ToastAndroid.showWithGravity("Permission denied", ToastAndroid.SHORT, ToastAndroid.CENTER);
                        return;
                      }
                    }
                    store.setDailyWallpaperMode(e.toLowerCase() as any);
                    changeDailyWallpaperType(e.toLowerCase() === "online" ? "online" : "downloaded");
                  }}
                  width={140}
                />
              </View>
              {store.dailyWallpaperMode === "online" && (
                <View>
                  <Select
                    defaultValue={store.dailyWallpaperSort}
                    options={Object.keys(SortOptions)}
                    onChange={e => {
                      store.setDailyWallpaperSort(SortOptions[e as keyof typeof SortOptions]);
                      changeDailyWallpaperSort(getURIFromSort(SortOptions[e as keyof typeof SortOptions]));
                    }}
                    width={140}
                  />
                </View>
              )}
            </View>

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

            <SettingSwitchComponent
              title="Send Error Logs"
              description={"Send error logs to the developer to help improve the app. No personal information is sent."}
              isEnabled={store.sendErrorLogsEnabled}
              onChange={e => {
                store.setSendErrorLogsEnabled(e);
              }}
            />

            <Pressable
              className="p-4 active:bg-foreground/10"
              onPress={() => {
                setShowChangeLog(true);
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
                {` ${process.env.EXPO_PUBLIC_BUILD_NAME ?? "BUILD_UNKNOWN"}`}
              </Text>
              <Text className="text-sm text-zinc-400">ID &mdash; {store.deviceIdentifier}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <ChangeLogDialog
        isVisible={showChangeLog}
        onClose={() => {
          setShowChangeLog(false);
        }}
      />
    </>
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
        <View className="pt-0.5">
          <Switch checked={isEnabled} onCheckedChange={onChange} />
        </View>
      </View>
    </Pressable>
  );
}
