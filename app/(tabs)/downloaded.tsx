import {Dimensions, FlatList, Image, Pressable, ToastAndroid, View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {DownloadedWallpaperPostType, useDownloadedWallpapersStore} from "@/store/downloaded_wallpapers";
import TopBar from "@/components/ui/TopBar";
import Animated, {FadeIn, FadeInDown, FadeOutDown, useSharedValue, withTiming} from "react-native-reanimated";
import {Button, ButtonText} from "@/components/ui/Button";
import {CheckCircle, ExternalLink, ImageIcon, Maximize2, MoreVertical, Trash2} from "lucide-react-native";
import * as WallpaperManager from "@/modules/wallpaper-manager";
import {fadingPulseAnimation} from "@/lib/animations/fading_pulse";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Select from "@/components/ui/Select";
import {useSettingsStore} from "@/store/settings";
import {hasPermissionForStorage, requestStoragePermissionsAsync} from "@/modules/download-manager";
import * as WebBrowser from "expo-web-browser";
import {useRouter} from "expo-router";
import {useEvent} from "expo";

type WallpaperApplyState = {
  status: "idle" | "applying" | "applied" | "error";
  path: string;
};

export default function DownloadedWallpapersScreen() {
  const WallpaperChangeListener = useEvent(WallpaperManager.Module, WallpaperManager.ChangeEvent);
  const store = useSettingsStore();
  const DownloadedWallpaperStore = useDownloadedWallpapersStore();
  const [applyState, setApplyState] = React.useState<WallpaperApplyState>({status: "idle", path: ""});
  const flatListRef = React.useRef<FlatList>(null);

  // Animations
  const topBarAnimateTop = useSharedValue(0);
  const topBarAnimateOpacity = useSharedValue(1);

  // Listeners
  React.useEffect(() => {
    // request permission for storage if we dont have it
    const runPermissions = async () => {
      if (!hasPermissionForStorage()) {
        await requestStoragePermissionsAsync();
        await DownloadedWallpaperStore.initialize();
      }
    };
    runPermissions();
  }, []);

  // Wallpaper change listener
  React.useEffect(() => {
    // wallpaper change listener
    const wallpaper_change_event = WallpaperChangeListener as WallpaperManager.ChangeEventType | null;
    if (wallpaper_change_event !== null) {
      setApplyState({status: wallpaper_change_event.success ? "applied" : "error", path: wallpaper_change_event.path});
      if (!wallpaper_change_event.success) {
        ToastAndroid.show("Failed to apply wallpaper", ToastAndroid.SHORT);
      }
    }
  }, [WallpaperChangeListener]);

  const removeWallpaper = (wallpaper: DownloadedWallpaperPostType) => {
    DownloadedWallpaperStore.removeFile(wallpaper.path);
  };

  return (
    <>
      <View className="h-screen bg-background">
        <Animated.View style={{top: topBarAnimateTop, opacity: topBarAnimateOpacity}} className="absolute z-10 w-full">
          <TopBar showLoader={false} title="Downloads">
            <Select
              options={["Old to New", "New to Old"]}
              defaultValue={store.downloadedScreenSort}
              onChange={(value: string) => {
                store.setDownloadedScreenSort(value as any);
                if (flatListRef.current) flatListRef.current.scrollToOffset({offset: 0});
              }}
              width={130}
            />
          </TopBar>
        </Animated.View>
        <FlatList
          ref={flatListRef}
          numColumns={2}
          keyExtractor={item => item.path}
          data={
            store.downloadedScreenSort === "Old to New"
              ? DownloadedWallpaperStore.files
              : DownloadedWallpaperStore.files.slice().reverse()
          }
          className="z-0 w-full px-3 pt-20"
          columnWrapperClassName="gap-3"
          contentContainerClassName="gap-3"
          onScroll={e => {
            if (e.nativeEvent.contentOffset.y > 96 && e.nativeEvent.velocity && e.nativeEvent.velocity.y > 0) {
              topBarAnimateTop.value = withTiming(-72, {duration: 200});
              topBarAnimateOpacity.value = withTiming(0, {duration: 200});
            } else {
              topBarAnimateTop.value = withTiming(0, {duration: 200});
              topBarAnimateOpacity.value = withTiming(1, {duration: 200});
            }
          }}
          ListHeaderComponent={() =>
            DownloadedWallpaperStore.files.length > 0 ? (
              <View className="flex items-center w-full pb-2 border-b border-zinc-900">
                <Text className="text-sm text-zinc-500">
                  Total of {DownloadedWallpaperStore.files.length} downloaded wallpapers
                </Text>
              </View>
            ) : (
              <></>
            )
          }
          renderItem={({item}) => (
            <WallpaperGridItem
              wallpaper={item}
              applyState={applyState.path === item.path ? applyState.status : "idle"}
              applyWallpaper={async () => {
                setApplyState({status: "applying", path: item.path});
                await WallpaperManager.setWallpaper(item.path);
              }}
              removeWallpaper={() => removeWallpaper(item)}
            />
          )}
          ListFooterComponent={() => (
            <View className="flex items-center justify-start w-full mb-16 h-52">
              <Text className="px-4 pt-12 text-sm text-zinc-400">End of posts for current filter</Text>
            </View>
          )}
        />
      </View>
    </>
  );
}

function WallpaperGridItem({
  wallpaper,
  applyState,
  applyWallpaper,
  removeWallpaper,
}: {
  wallpaper: DownloadedWallpaperPostType;
  applyState: "idle" | "applying" | "applied" | "error";
  applyWallpaper: () => void;
  removeWallpaper: () => void;
}) {
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  function openDownloadedViewerScreen(path: string) {
    router.push({pathname: "/downloaded_viewer", params: {path: path}});
  }

  const deleteWallpaper = async () => {
    const e = await WallpaperManager.deleteWallpaper(wallpaper.path);
    if (e) {
      removeWallpaper();
      setIsOpen(false);
    } else {
      ToastAndroid.show("Failed to delete wallpaper", ToastAndroid.SHORT);
    }
  };

  return (
    <>
      <Animated.View entering={FadeIn} className="pb-2" style={{flex: 0.5}}>
        <View className="flex flex-col h-[26rem]">
          <Pressable className="relative flex-1 web:block" onPress={() => openDownloadedViewerScreen(wallpaper.path)}>
            <Animated.View
              style={fadingPulseAnimation(3000)}
              className="absolute top-0 left-0 z-0 w-full h-full rounded-lg bg-foreground/20"></Animated.View>
            <Image
              className="z-10 flex-1 object-cover max-w-full border rounded-lg border-foreground/10"
              source={{uri: `file://${wallpaper.path}`}}
              width={width / 2}
              height={height / 2}
            />
            {applyState === "applied" ? (
              <Button
                variant={"ghost"}
                size={"md"}
                className="absolute z-20 px-3 rounded bottom-1 right-1 bg-emerald-700/80"
                disabled>
                <CheckCircle size={16} color="white" />
                <ButtonText>Applied</ButtonText>
              </Button>
            ) : applyState === "applying" ? (
              <Button
                variant={"ghost"}
                size={"md"}
                className="absolute z-20 px-3 rounded bottom-1 right-1 bg-background/80"
                disabled>
                <LoadingSpinner size={16} color="white" />
                <ButtonText>Applying</ButtonText>
              </Button>
            ) : (
              <Button
                variant={"ghost"}
                size={"md"}
                className="absolute z-20 px-3 rounded bottom-1 right-1 bg-background/80"
                onPress={applyWallpaper}>
                <ImageIcon size={16} color="white" />
                <ButtonText>Set</ButtonText>
              </Button>
            )}
          </Pressable>
          <View className="flex flex-row items-center">
            <View className="relative z-30 flex-1">
              <Pressable onPress={() => openDownloadedViewerScreen(wallpaper.path)}>
                <Text numberOfLines={1} className="mt-2 font-semibold">
                  {wallpaper.title}
                </Text>
                {wallpaper.width !== null &&
                wallpaper.height !== null &&
                !isNaN(wallpaper.width) &&
                !isNaN(wallpaper.height) ? (
                  <View className="mt-1.5 flex flex-row gap-1.5 items-center">
                    <Maximize2 size={12} color="#71717a" />
                    <Text className="text-sm font-medium text-zinc-500">
                      {wallpaper.width} x {wallpaper.height}
                    </Text>
                  </View>
                ) : (
                  <></>
                )}
              </Pressable>
            </View>
            <View className="relative">
              <Button
                variant={"ghost"}
                size={"icon"}
                onPress={() => {
                  setIsOpen(v => !v);
                }}>
                <MoreVertical size={20} color="#bbbbbb" />
              </Button>
              {/* dropdown options */}
              {isOpen && (
                <Animated.View entering={FadeInDown} exiting={FadeOutDown} className="absolute z-50 right-1 bottom-12">
                  <View className="rounded-md shadow-md bg-zinc-900" style={{width: 160}}>
                    <Button
                      variant={"ghost"}
                      className="justify-start h-12 gap-3 px-4 py-2 text-base"
                      onPress={async () => {
                        await WebBrowser.openBrowserAsync(
                          "https://www.reddit.com/r/Amoledbackgrounds/comments/" + wallpaper.id,
                        );
                      }}>
                      <ExternalLink size={16} color="#ffffff" />
                      <ButtonText>See on Reddit</ButtonText>
                    </Button>
                    <Button
                      variant={"ghost"}
                      className="justify-start h-12 gap-3 px-4 py-2 text-base"
                      onPress={deleteWallpaper}>
                      <Trash2 size={16} color="#f87171" />
                      <ButtonText numberOfLines={1} className="text-red-400">
                        Delete
                      </ButtonText>
                    </Button>
                  </View>
                </Animated.View>
              )}
            </View>
          </View>
          {/* catch outside presses */}
          <Pressable
            onPress={() => setIsOpen(false)}
            className={`${!isOpen && "hidden"} absolute -top-96 -right-96 z-40 w-[200vh] h-[200vh]`}
          />
        </View>
      </Animated.View>
    </>
  );
}
