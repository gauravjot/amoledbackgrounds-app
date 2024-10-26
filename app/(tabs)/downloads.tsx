import {FlatList, Image, View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import {DownloadedWallpaperPostType, useDownloadedWallpapersStore} from "@/store/downloaded_wallpapers";
import TopBar from "@/components/ui/TopBar";
import Animated, {useAnimatedStyle, withRepeat, withSequence, withTiming} from "react-native-reanimated";
import {Button} from "@/components/ui/Button";
import {ImageIcon} from "lucide-react-native";
import * as WallpaperManager from "@/modules/wallpaper-manager";

export default function DownloadsScreen() {
  const downloadedWallpapersStore = useDownloadedWallpapersStore();

  const posts = downloadedWallpapersStore.files;

  return (
    <SafeAreaView className="bg-background">
      <TopBar showLoader={false} title="Downloads"></TopBar>
      <FlatList
        numColumns={2}
        keyExtractor={item => item.path}
        data={posts}
        className="z-0 w-full px-3 py-3"
        columnWrapperClassName="gap-4"
        contentContainerClassName="gap-4"
        renderItem={({item}) => <WallpaperGridItem {...item} />}
        ListFooterComponent={() => (
          <View className="flex items-center justify-start w-full mb-16 h-52">
            <Text className="px-4 pt-12 text-sm text-zinc-400">End of posts for current filter</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function WallpaperGridItem(wallpaper: DownloadedWallpaperPostType) {
  // Animations
  const fadingPulseAnimation = useAnimatedStyle(() => {
    return {
      opacity: withRepeat(
        withSequence(
          withTiming(0.5, {
            duration: 1000,
          }),
          withTiming(1, {
            duration: 1000,
          }),
          withTiming(0.5, {
            duration: 1000,
          }),
        ),
        -1,
      ),
    };
  });

  return (
    <View className="pb-2" style={{flex: 0.5}}>
      <View className="flex flex-col h-[26rem]">
        <View className="relative flex-1 web:block">
          <Animated.View
            style={fadingPulseAnimation}
            className="absolute top-0 left-0 z-0 w-full h-full rounded-lg bg-foreground/20"></Animated.View>
          <Image
            className="z-10 flex-1 object-contain w-full h-full border rounded-lg border-foreground/10"
            source={{uri: `file://${wallpaper.path}`}}
          />
          {/* <View className="z-10 flex-1 w-full h-full border rounded-lg border-foreground/10">
            <ImageView path={wallpaper.path} />
          </View> */}
          <Button
            variant={"ghost"}
            size="icon"
            className="absolute z-20 rounded bottom-1 right-1 bg-background/50"
            onPress={() => {
              WallpaperManager.setWallpaper(wallpaper.path);
            }}>
            <ImageIcon size={24} color="white" />
          </Button>
          <View className="absolute left-0 z-20 flex flex-row items-center gap-2 px-1 bottom-1">
            {wallpaper.width !== null &&
            wallpaper.height !== null &&
            !isNaN(wallpaper.width) &&
            !isNaN(wallpaper.height) ? (
              <View className="flex flex-row items-center justify-center px-1.5 py-1 rounded bg-background/80">
                <Text className="text-sm text-zinc-200">
                  {wallpaper.width} x {wallpaper.height}
                </Text>
              </View>
            ) : (
              <></>
            )}
          </View>
        </View>
        <Text numberOfLines={1} className="mt-2 font-semibold">
          {wallpaper.title}
        </Text>
        <View className="flex flex-row gap-1 justify-center items-center mt-1.5">{/* second line info */}</View>
      </View>
    </View>
  );
}
