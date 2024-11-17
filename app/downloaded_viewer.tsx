import {Button, ButtonText} from "@/components/ui/Button";
import {Text} from "@/components/ui/Text";
import * as WallpaperManager from "@/modules/wallpaper-manager";
import {useDownloadedWallpapersStore} from "@/store/downloaded_wallpapers";
import {LinearGradient} from "expo-linear-gradient";
import {ArrowLeft, CheckCircle, ImageIcon, Maximize2, MoreVertical} from "lucide-react-native";
import * as React from "react";
import {Dimensions, Image, ToastAndroid, View} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import * as SqlUtility from "@/lib/utils/sql";
import {useSettingsStore} from "@/store/settings";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {useLocalSearchParams, useRouter} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {useEvent} from "expo";

type WallpaperApplyState = "idle" | "applying" | "applied" | "error";

export default function DownloadedViewer() {
  const WallpaperChangeListener = useEvent(WallpaperManager.Module, WallpaperManager.ChangeEvent);
  const params = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [applyState, setApplyState] = React.useState<WallpaperApplyState>("idle");
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;
  const DownloadedStore = useDownloadedWallpapersStore();
  const settingStore = useSettingsStore();
  const router = useRouter();
  const isWallpaperOrderReversed = settingStore.downloadedScreenSort === "New to Old";
  const wallpapers = isWallpaperOrderReversed ? DownloadedStore.files.slice().reverse() : DownloadedStore.files;
  const currentWallpaper = wallpapers[currentIndex];

  React.useEffect(() => {
    setCurrentIndex(wallpapers.findIndex(file => file.path === params["path"]));
  }, []);

  // Wallpaper change listener
  React.useEffect(() => {
    // wallpaper change listener
    const wallpaper_change_event = WallpaperChangeListener as WallpaperManager.ChangeEventType | null;
    if (wallpaper_change_event !== null) {
      setApplyState(wallpaper_change_event.success ? "applied" : "error");
      if (!wallpaper_change_event.success) {
        ToastAndroid.show("Failed to apply wallpaper", ToastAndroid.SHORT);
      }
    }
  }, [WallpaperChangeListener]);

  // Apply wallpaper
  const applyWallpaper = async (path: string) => {
    try {
      setApplyState("applying");
      await WallpaperManager.setWallpaper(path as string);
    } catch (error) {
      // Log error
      SqlUtility.insertErrorLog(
        {
          file: "downloaded_viewer.tsx[DownloadedViewer]",
          description: "Error while applying wallpaper",
          error_title: error instanceof Error ? error.name : "Applying wallpaper fail",
          method: "applyWallpaper",
          params: JSON.stringify({
            fileSystemPath: path,
          }),
          severity: "error",
          stacktrace: error instanceof Error ? error.stack || error.message : "",
        },
        settingStore.deviceIdentifier,
      );
    }
  };

  // Animations
  const pressAnim = useSharedValue<number>(0);
  const animationStyle = React.useCallback((value: number) => {
    "worklet";
    const zIndex = interpolate(value, [-1, 0, 1], [-20, 0, 20]);
    const translateX = interpolate(value, [-1, 0, 1], [-width, 0, width]);
    return {
      transform: [{translateX}],
      zIndex,
    };
  }, []);
  const buttonStyle = useAnimatedStyle(() => {
    const scale = interpolate(Math.abs(pressAnim.value - 1), [0, 1], [1, 1]);
    const opacity = interpolate(Math.abs(pressAnim.value - 1), [0, 1], [0, 1]);
    return {
      opacity,
      transform: [{scale}],
    };
  }, []);

  return (
    <View style={{flex: 1}}>
      <Carousel
        width={width}
        height={height}
        style={{flex: 1, height: "100%"}}
        autoPlay={false}
        windowSize={2}
        data={wallpapers}
        scrollAnimationDuration={100}
        customAnimation={animationStyle}
        onScrollBegin={() => {
          pressAnim.value = withTiming(1);
        }}
        onScrollEnd={() => {
          pressAnim.value = withTiming(0);
        }}
        onSnapToItem={index => {
          setCurrentIndex(index);
          setApplyState("idle");
        }}
        defaultIndex={currentIndex}
        renderItem={item => <CarouselItem path={item.item.path} width={width} height={height} pressAnim={pressAnim} />}
      />
      <Animated.View style={[buttonStyle]} className="absolute bottom-0 left-0 right-0 z-30 w-full bg-background/80">
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "black"]}
          className="relative z-10 flex flex-row items-center px-4 pt-4 pb-7">
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground mb-1.5">{currentWallpaper.title.trim()}</Text>
            {currentWallpaper.width && currentWallpaper.height && (
              <View className="flex flex-row items-center gap-2 p-1 rounded bg-background/80">
                <Maximize2 size={16} color="#a1a1aa" />
                <Text className="font-semibold text-zinc-400 pe-1">
                  {currentWallpaper.width} x {currentWallpaper.height}
                </Text>
              </View>
            )}
          </View>
          <View>
            {applyState !== "applied" ? (
              <Button
                variant={"emerald"}
                onPress={() => applyWallpaper(currentWallpaper.path)}
                className="rounded-full">
                <ImageIcon size={16} color="white" />
                <ButtonText>Apply</ButtonText>
              </Button>
            ) : applyState === "applied" ? (
              <Button variant={"secondary"} className="rounded-full" disabled>
                <CheckCircle size={16} color="white" />
                <ButtonText>Applied</ButtonText>
              </Button>
            ) : (
              <Button variant={"accent"} className="rounded-full" disabled>
                <LoadingSpinner />
              </Button>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
      <View className="absolute top-0 left-0 right-0 z-30 w-full h-24">
        <SafeAreaView>
          <View className="flex flex-row items-center gap-4">
            <Button
              variant={"ghost"}
              size={"icon"}
              className="w-12 h-12 m-2 rounded-lg bg-background/60"
              onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" strokeWidth={1.5} />
            </Button>
            <View className="flex flex-row flex-1">
              <Text className="h-12 px-4 text-lg font-bold align-middle rounded-lg bg-background/60">
                Viewing {currentIndex + 1} of {wallpapers.length}
              </Text>
            </View>
            <View>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="w-12 h-12 m-2 rounded-lg bg-background/60"
                onPress={() => router.back()}>
                <MoreVertical size={24} color="white" strokeWidth={1.5} />
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const CarouselItem = ({
  path,
  width,
  height,
  pressAnim,
}: {
  path: string;
  width: number;
  height: number;
  pressAnim: SharedValue<number>;
}) => {
  const itemStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressAnim.value, [0, 1], [1, 0.9]);
    const borderRadius = interpolate(pressAnim.value, [0, 1], [0, 30]);

    return {
      transform: [{scale}],
      borderRadius,
    };
  }, []);

  return (
    <Animated.View style={[{flex: 1, overflow: "hidden"}, itemStyle]}>
      <Image source={{uri: `file://${path}`}} width={width} height={height} />
    </Animated.View>
  );
};
