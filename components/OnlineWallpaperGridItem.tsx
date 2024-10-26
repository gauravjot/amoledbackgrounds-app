import {View, Image, Pressable} from "react-native";
import {Text} from "@/components/ui/Text";
import {WallpaperPostType} from "@/lib/services/wallpaper_type";
import {ArrowUp, MessageSquareMore} from "lucide-react-native";
import {timeSince} from "@/lib/utils/time_since";
import {PREVIEW_USE_LOWER_QUALITY} from "@/appconfig";
import Animated from "react-native-reanimated";
import {fadingPulseAnimation} from "@/lib/animations/fading_pulse";
import {useRouter} from "expo-router";

export default function OnlineWallpaperGridItem(wallpaper: WallpaperPostType) {
  const router = useRouter();
  const thumbnail: string =
    (PREVIEW_USE_LOWER_QUALITY ? wallpaper.image.preview_small_url : null) ??
    wallpaper.image.preview_url ??
    wallpaper.image.url;

  function openDownloadScreen() {
    router.push({pathname: "/download", params: {wallpaper: JSON.stringify(wallpaper)}});
  }

  return (
    <View className="pb-2" style={{flex: 0.5}}>
      <Pressable onPress={openDownloadScreen}>
        <View className="flex flex-col h-[26rem]">
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
                <Text className="text-sm text-zinc-200 pe-1">{wallpaper.score}</Text>
              </View>
              <View className="flex-1"></View>
              <View className="flex flex-row items-center justify-center px-1.5 py-1 rounded bg-background/80">
                <Text className="text-sm text-zinc-200">
                  {wallpaper.image.width} x {wallpaper.image.height}
                </Text>
              </View>
            </View>
          </View>
          <Text numberOfLines={1} className="mt-2 font-semibold">
            {wallpaper.title}
          </Text>
          <View className="flex flex-row gap-1 justify-center items-center mt-1.5">
            <MessageSquareMore size={16} color="gray" />
            <Text className="text-sm text-zinc-400">{wallpaper.comments}</Text>
            <Text numberOfLines={1} className="flex-1 text-sm text-zinc-400">
              &nbsp;&bull;&nbsp; {timeSince(wallpaper.created_utc)}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
