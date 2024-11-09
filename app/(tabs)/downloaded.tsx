import {FlatList, Image, Pressable, ToastAndroid, View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import {DownloadedWallpaperPostType, useDownloadedWallpapersStore} from "@/store/downloaded_wallpapers";
import TopBar from "@/components/ui/TopBar";
import Animated, {useAnimatedStyle, withDelay, withTiming} from "react-native-reanimated";
import {Button, ButtonText} from "@/components/ui/Button";
import {CheckCircle, ImageIcon, MoreVertical, Trash2} from "lucide-react-native";
import * as WallpaperManager from "@/modules/wallpaper-manager";
import {fadingPulseAnimation} from "@/lib/animations/fading_pulse";
import {onChangeListener} from "../../modules/wallpaper-manager/index";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Select from "@/components/ui/Select";
import {useSettingsStore} from "@/store/settings";
import {hasPermissionForStorage, requestStoragePermissionsAsync} from "@/modules/download-manager";

type WallpaperApplyState = {
  status: "idle" | "applying" | "applied" | "error";
  path: string;
};

export default function DownloadedWallpapersScreen() {
  const store = useSettingsStore();
  const DownloadedWallpaperStore = useDownloadedWallpapersStore();
  const [applyState, setApplyState] = React.useState<WallpaperApplyState>({status: "idle", path: ""});
  const flatListRef = React.useRef<FlatList>(null);
  let posts = DownloadedWallpaperStore.files;

  // Listeners
  React.useEffect(() => {
    // request permission for storage if we dont have it
    const runPermissions = async () => {
      if (!hasPermissionForStorage()) {
        await requestStoragePermissionsAsync();
        await DownloadedWallpaperStore.initialize();
        posts = DownloadedWallpaperStore.files;
      }
    };
    runPermissions();
    // wallpaper change listener
    const wallpaperChangeListener = onChangeListener(e => {
      setApplyState({status: e.success ? "applied" : "error", path: e.path});
      if (e.success) {
        ToastAndroid.show("Wallpaper applied successfully", ToastAndroid.SHORT);
      } else {
        ToastAndroid.show("Failed to apply wallpaper", ToastAndroid.SHORT);
      }
    });
    return () => {
      // When component is killed, clear all listeners
      wallpaperChangeListener.remove();
    };
  }, []);

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <View className="absolute top-0 z-10 w-full">
          <TopBar showLoader={false} title="Downloads">
            <Select
              options={["Old to New", "New to Old"]}
              defaultValue={store.downloadedScreenSort}
              onChange={(value: string) => {
                store.setDownloadedScreenSort(value as any);
                if (flatListRef.current) flatListRef.current.scrollToOffset({offset: 0});
              }}
            />
          </TopBar>
        </View>
        <FlatList
          ref={flatListRef}
          numColumns={2}
          keyExtractor={item => item.path}
          data={store.downloadedScreenSort === "Old to New" ? posts : posts.slice().reverse()}
          className="z-0 w-full px-3 pt-20"
          columnWrapperClassName="gap-4"
          contentContainerClassName="gap-4"
          renderItem={({item}) => (
            <WallpaperGridItem
              wallpaper={item}
              applyState={applyState.path === item.path ? applyState.status : "idle"}
              applyWallpaper={async () => {
                setApplyState({status: "applying", path: item.path});
                await WallpaperManager.setWallpaper(item.path);
              }}
            />
          )}
          ListFooterComponent={() => (
            <View className="flex items-center justify-start w-full mb-16 h-52">
              <Text className="px-4 pt-12 text-sm text-zinc-400">End of posts for current filter</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function WallpaperGridItem({
  wallpaper,
  applyState,
  applyWallpaper,
}: {
  wallpaper: DownloadedWallpaperPostType;
  applyState: "idle" | "applying" | "applied" | "error";
  applyWallpaper: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      marginBottom: withTiming(isOpen ? 10 : 0, {
        duration: 200,
      }),
      opacity: withDelay(
        50,
        withTiming(isOpen ? 1 : 0, {
          duration: 100,
        }),
      ),
      display: isOpen ? "flex" : "none",
      width: 120,
    };
  });

  return (
    <View className="pb-2" style={{flex: 0.5}}>
      <View className="flex flex-col h-[26rem]">
        <View className="relative flex-1 web:block">
          <Animated.View
            style={fadingPulseAnimation(3000)}
            className="absolute top-0 left-0 z-0 w-full h-full rounded-lg bg-foreground/20"></Animated.View>
          <Image
            className="z-10 flex-1 object-contain w-full h-full border rounded-lg border-foreground/10"
            source={{uri: `file://${wallpaper.path}`}}
          />
          {applyState === "applied" ? (
            <Button
              variant={"ghost"}
              size={"md"}
              className="absolute z-20 px-3 rounded bottom-1 right-1 bg-emerald-700/80"
              disabled>
              <CheckCircle size={20} color="white" />
              <ButtonText>Applied</ButtonText>
            </Button>
          ) : applyState === "applying" ? (
            <Button
              variant={"ghost"}
              size={"md"}
              className="absolute z-20 px-3 rounded bottom-1 right-1 bg-background/80"
              disabled>
              <LoadingSpinner size={20} color="white" />
              <ButtonText>Applying</ButtonText>
            </Button>
          ) : (
            <Button
              variant={"ghost"}
              size={"md"}
              className="absolute z-20 px-3 rounded bottom-1 right-1 bg-background/80"
              onPress={applyWallpaper}>
              <ImageIcon size={20} color="white" />
              <ButtonText>Set</ButtonText>
            </Button>
          )}
        </View>
        <View className="flex flex-row items-center">
          <View className="flex-1">
            <Text numberOfLines={1} className="mt-2 font-semibold">
              {wallpaper.title}
            </Text>
            {wallpaper.width !== null &&
            wallpaper.height !== null &&
            !isNaN(wallpaper.width) &&
            !isNaN(wallpaper.height) ? (
              <Text className="text-zinc-500 mt-1.5">
                {wallpaper.width} x {wallpaper.height}
              </Text>
            ) : (
              <></>
            )}
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
            <Animated.View style={[animatedStyle]} className="absolute right-1 z-50 bottom-7">
              <View className="rounded-md shadow-md bg-zinc-900">
                <Button
                  variant={"ghost"}
                  className="justify-start h-12 text-base py-2"
                  style={{minWidth: 110}}
                  onPress={() => {}}>
                  <Trash2 size={16} color="#ffffff" />
                  <ButtonText numberOfLines={1} className="text-foreground">
                    Delete
                  </ButtonText>
                </Button>
              </View>
            </Animated.View>
            {/* catch outside presses */}
            <Pressable
              onPress={() => setIsOpen(false)}
              className={`${!isOpen && "hidden"} absolute -top-96 -right-96 z-40 w-[200vw] h-[200vh]`}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
