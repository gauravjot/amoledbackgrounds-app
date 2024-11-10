import {Image, Pressable, View} from "react-native";
import React from "react";
import {WallpaperPostType} from "@/lib/services/wallpaper_type";
import {useLocalSearchParams} from "expo-router";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import Animated, {useSharedValue, withTiming, withDelay} from "react-native-reanimated";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUp,
  CheckCircle,
  ExternalLink,
  ImageIcon,
  Maximize2,
  MessageSquareMore,
} from "lucide-react-native";
import {Button, ButtonText} from "@/components/ui/Button";
import * as WebBrowser from "expo-web-browser";
import * as FileSystem from "expo-file-system";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {useDownloadedWallpapersStore} from "@/store/downloaded_wallpapers";
import {setWallpaper, onChangeListener} from "@/modules/wallpaper-manager";
import {router} from "expo-router";
import {LinearGradient} from "expo-linear-gradient";
import * as DownloadManager from "@/modules/download-manager";
import {ToastAndroid} from "react-native";
import {useSettingsStore} from "@/store/settings";
import * as SqlUtility from "@/lib/utils/sql";

type DownloadState = {
  status: "idle" | "downloading" | "complete" | "error_finishing" | "error_starting";
  progress: number | null;
};

type WallpaperApplyState = "idle" | "applying" | "applied" | "error";

export default function DownloadScreen() {
  const params = useLocalSearchParams();
  const [downloadState, setDownloadState] = React.useState<DownloadState>({status: "idle", progress: null});
  const [applyState, setApplyState] = React.useState<WallpaperApplyState>("idle");
  const [fileSystemPath, setFileSystemPath] = React.useState<string | null>(null);

  // Wallpaper information
  const wallpaper = JSON.parse(params["wallpaper"] as string) as WallpaperPostType;
  const filename = `${wallpaper.title
    .replace(/[\/\\#,+()|~%'":*?<>{}]/g, "") // Remove special characters
    .replace(/\s\s+/g, " ") // Remove extra spaces
    .replaceAll(" ", "_")}_-_${wallpaper.id}_amoled_droidheat`;
  const file_extension = wallpaper.image.url.split(".").pop() || ".png";

  // Store to save downloaded wallpapers to
  const store = useDownloadedWallpapersStore();
  const settingStore = useSettingsStore();

  // Animations
  const animateOpacity = useSharedValue(1);
  const animatePushDown = useSharedValue(0);

  // On start of the screen
  // check if current wallpaper is downloaded
  React.useEffect(() => {
    const saved_file = store.getFile(filename);
    if (saved_file) {
      // Check if file exists in file system
      FileSystem.getInfoAsync(saved_file.path)
        .then(() => {
          setDownloadState({status: "complete", progress: null});
          setFileSystemPath(saved_file.path);
        })
        .catch(() => {
          store.removeFile(filename);
        });
    }
  }, []);

  // Toggle to show comments dialog
  function showComments() {
    console.log("Show Comments");
  }

  // Toggle to hide/show the bottom info panel
  function fullScreenWallpaperToggle() {
    if (animateOpacity.value === 0) {
      animateOpacity.value = withTiming(1, {
        duration: 200,
      });
      animatePushDown.value = withTiming(0, {
        duration: 200,
      });
    } else {
      animateOpacity.value = withTiming(0, {
        duration: 300,
      });
      animatePushDown.value = withTiming(-250, {
        duration: 800,
      });
    }
  }

  // Download wallpaper using native download manager
  function downloadUsingNative() {
    try {
      const downloading = DownloadManager.downloadImage(wallpaper.image.url, filename, file_extension);
      if (downloading > -1) {
        setDownloadState({status: "downloading", progress: 0});
      }
    } catch (error) {
      // Log error
      SqlUtility.insertErrorLog(
        {
          file: "download.tsx[DownloadScreen.tsx]",
          description: "Error while downloading wallpaper",
          error_title: error instanceof Error ? error.name : "Downloading wallpaper fail",
          method: "downloadUsingNative",
          params: JSON.stringify({
            url: wallpaper.image.url,
            filename: filename,
            file_extension: file_extension,
          }),
          severity: "error",
          stacktrace: error instanceof Error ? error.stack || error.message : "",
        },
        settingStore.deviceIdentifier,
      );
      setDownloadState({status: "error_starting", progress: null});
    }
  }

  // Listeners
  React.useEffect(() => {
    // download complete listener
    const downloadCompleteListener = DownloadManager.downloadCompleteListener(e => {
      if (e.success) {
        setDownloadState({status: "complete", progress: null});
        setFileSystemPath(e.path);
        store.addFile({
          id: wallpaper.id,
          title: wallpaper.title,
          path: e.path,
          width: wallpaper.image.width,
          height: wallpaper.image.height,
        });
        ToastAndroid.show("Download complete", ToastAndroid.SHORT);
      } else {
        setDownloadState({status: "error_finishing", progress: null});
        // TODO: show some error message to user in toast
        console.log("Download failed");
      }
    });
    // wallpaper change listener
    const wallpaperChangeListener = onChangeListener(e => {
      setApplyState(e.success ? "applied" : "error");
      ToastAndroid.show(e.success ? "Wallpaper applied" : "Failed to apply wallpaper", ToastAndroid.SHORT);
    });
    // download progress listener
    const downloadProgressListener = DownloadManager.downloadProgressListener(e => {
      if (downloadState.status !== "complete" && e.filename === filename) {
        setDownloadState({status: "downloading", progress: e.progress});
      }
    });

    return () => {
      // When component is killed, clear all listeners
      downloadCompleteListener.remove();
      wallpaperChangeListener.remove();
      downloadProgressListener.remove();
    };
  }, []);

  // Apply wallpaper
  async function applyWallpaper() {
    try {
      setApplyState("applying");
      await setWallpaper(fileSystemPath as string);
    } catch (error) {
      // Log error
      SqlUtility.insertErrorLog(
        {
          file: "download.tsx[DownloadScreen.tsx]",
          description: "Error while applying wallpaper",
          error_title: error instanceof Error ? error.name : "Applying wallpaper fail",
          method: "applyWallpaper",
          params: JSON.stringify({
            fileSystemPath: fileSystemPath,
          }),
          severity: "error",
          stacktrace: error instanceof Error ? error.stack || error.message : "",
        },
        settingStore.deviceIdentifier,
      );
    }
  }

  return (
    <View className="relative h-screen bg-background">
      <Image
        className="absolute top-0 left-0 z-0 object-contain w-full h-full"
        source={{
          uri: settingStore.isLowerThumbnailQualityEnabled
            ? wallpaper.image.preview_small_url
            : wallpaper.image.preview_url,
          height: wallpaper.image.height,
          width: wallpaper.image.width,
        }}
      />
      <Image
        className="absolute top-0 bottom-0 left-0 right-0 z-10 object-contain w-full h-full"
        source={{uri: wallpaper.image.url, height: wallpaper.image.height, width: wallpaper.image.width}}
      />
      <View className="absolute top-0 left-0 right-0 z-30 w-full h-10">
        <SafeAreaView>
          <Animated.View style={{opacity: animateOpacity}}>
            <Button
              variant={"ghost"}
              size={"icon"}
              className="w-12 h-12 m-2 rounded-lg bg-background/60"
              onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" strokeWidth={1.5} />
            </Button>
          </Animated.View>
        </SafeAreaView>
      </View>
      {/* Bottom Info Panel */}
      <SafeAreaView className="relative z-20 flex flex-col flex-1">
        <Pressable
          className="absolute top-0 bottom-0 left-0 right-0 z-0"
          onPress={fullScreenWallpaperToggle}></Pressable>
        <View className="flex-1"></View>
        <Animated.View
          className="relative w-full bg-background/80"
          style={{opacity: animateOpacity, bottom: animatePushDown}}>
          <LinearGradient colors={["rgba(0,0,0,0.1)", "black"]} className="relative z-10 px-4 pt-1 pb-7">
            {downloadState.status !== "complete" && downloadState.status !== "downloading" ? (
              <Button
                variant={"accent"}
                className="absolute z-30 rounded-full -top-6 right-4"
                onPress={downloadUsingNative}>
                <ArrowDownCircle size={16} color="white" />
                <ButtonText>Download</ButtonText>
              </Button>
            ) : applyState === "applying" ? (
              <Button variant={"emerald"} className="absolute z-30 px-0 pl-2 pr-4 rounded-full -top-6 right-4" disabled>
                <LoadingSpinner />
                <ButtonText>Applying</ButtonText>
              </Button>
            ) : downloadState.status === "complete" && applyState !== "applied" ? (
              <Button
                variant={"emerald"}
                className="absolute z-30 rounded-full -top-6 right-4"
                onPress={applyWallpaper}>
                <ImageIcon size={16} color="white" />
                <ButtonText>Apply</ButtonText>
              </Button>
            ) : applyState === "applied" ? (
              <Button variant={"secondary"} className="absolute z-30 rounded-full -top-6 right-4" disabled>
                <CheckCircle size={16} color="white" />
                <ButtonText>Applied</ButtonText>
              </Button>
            ) : downloadState.status === "downloading" ? (
              <Button variant={"accent"} className="absolute z-30 px-0 pl-2 pr-4 rounded-full -top-6 right-4" disabled>
                <LoadingSpinner />
                <ButtonText>{downloadState.progress}%</ButtonText>
              </Button>
            ) : (
              <Button variant={"accent"} className="absolute z-30 px-2 rounded-full -top-6 right-4" disabled>
                <LoadingSpinner />
              </Button>
            )}
            {wallpaper.flair && (
              <View className="flex flex-row items-center gap-3 py-1 rounded">
                <Text className="inline px-1 text-xs font-semibold uppercase rounded bg-emerald-700">
                  {wallpaper.flair}
                </Text>
              </View>
            )}
            <View className="flex flex-row items-center gap-3 mt-3 bottom-1">
              <View className="flex flex-row items-center justify-center gap-2 p-1 rounded bg-background/80">
                <ArrowUp size={16} color="white" />
                <Text className="text-sm font-semibold text-zinc-200 pe-1">{wallpaper.score}</Text>
              </View>
              <View className="flex flex-row items-center justify-center gap-2 p-1 rounded bg-background/80">
                <Maximize2 size={16} color="white" />
                <Text className="text-sm font-semibold text-zinc-200 pe-1">
                  {wallpaper.image.width} x {wallpaper.image.height}
                </Text>
              </View>
            </View>
            <View className="mt-4">
              <Text className="text-lg font-bold text-foreground" numberOfLines={2}>
                {wallpaper.title}
              </Text>
              <View className="flex flex-row items-center gap-3 mt-3">
                <Text className="text-sm text-zinc-400" numberOfLines={1}>
                  u/{wallpaper.author}
                </Text>
              </View>
            </View>
            <View className="absolute bottom-6 right-4">
              <Button
                variant={"outline"}
                size={"xs"}
                className="h-8"
                onPress={async () => {
                  await WebBrowser.openBrowserAsync(wallpaper.postlink as string);
                }}>
                <ButtonText> see thread</ButtonText>
                <ExternalLink size={16} color="white" />
              </Button>
            </View>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
