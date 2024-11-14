import {View, Image, Pressable} from "react-native";
import {Text} from "@/components/ui/Text";
import {WallpaperPostType} from "@/lib/services/wallpaper_type";
import {ArrowUp} from "lucide-react-native";
import {timeSince} from "@/lib/utils/time_since";
import Animated from "react-native-reanimated";
import {fadingPulseAnimation} from "@/lib/animations/fading_pulse";
import {useRouter} from "expo-router";
import {useSettingsStore} from "@/store/settings";

export default function OnlineWallpaperGridItem(wallpaper: WallpaperPostType) {
  const router = useRouter();
  const store = useSettingsStore();
  const thumbnail: string =
    (store.isLowerThumbnailQualityEnabled ? wallpaper.image.preview_small_url : null) ??
    wallpaper.image.preview_url ??
    wallpaper.image.url;

  function openDownloadScreen() {
    router.push({pathname: "/download", params: {wallpaper: JSON.stringify(wallpaper)}});
  }

  return (
    <View className="pb-2 realtive" style={{flex: 0.5}}>
      <Pressable
        onPress={openDownloadScreen}
        className="absolute top-0 bottom-0 left-0 right-0 z-10 rounded-lg active:bg-foreground/10"></Pressable>
      <View className="flex flex-col h-[26rem] relative z-0">
        <View className="relative flex-1 web:block">
          <Animated.View
            style={fadingPulseAnimation(3000)}
            className="absolute top-0 left-0 z-0 w-full h-full rounded-lg bg-foreground/20"></Animated.View>
          <Image
            className="z-10 flex-1 object-contain w-full h-full border rounded-lg border-foreground/10"
            source={{uri: thumbnail}}
          />
          {wallpaper.flair && (
            <View className="absolute z-20 top-2 right-2">
              <Text className="inline px-1 text-xs font-semibold uppercase rounded bg-emerald-700">
                {wallpaper.flair}
              </Text>
            </View>
          )}
          <View className="absolute left-0 z-20 flex flex-row items-center gap-2 px-1 bottom-1">
            <View className="flex flex-row items-center justify-center gap-1 p-1 rounded bg-background/80">
              <ArrowUp size={16} color="white" />
              <Text className="text-sm font-medium text-zinc-200 pe-1">{wallpaper.score}</Text>
            </View>
            <View className="flex-1"></View>
            <View className="flex flex-row items-center justify-center p-1 rounded bg-background/80">
              <Text className="text-sm font-medium text-zinc-200">
                {wallpaper.image.width} x {wallpaper.image.height}
              </Text>
            </View>
          </View>
        </View>
        <Text numberOfLines={1} className="mt-2 font-semibold">
          {wallpaper.title}
        </Text>
        <View className="flex flex-row gap-1 justify-center items-center mt-1.5">
          <Text numberOfLines={1} className="flex-1 text-sm text-zinc-500">
            {timeSince(wallpaper.created_utc)} &nbsp;&bull;&nbsp; {wallpaper.author}
          </Text>
        </View>
      </View>
    </View>
  );
}
