import {FlatList, View, Image, Pressable} from "react-native";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import HomeTopBar from "@/components/HomeTopBar";
import {useEffect, useState} from "react";
import {getWallpapers} from "@/lib/services/wallpaper_grid_service";
import {useSortStore} from "@/store/sort";
import {useMutation} from "@tanstack/react-query";
import {PaginationType, WallpaperPostType} from "@/lib/services/wallpaper_type";
import {ArrowUp, CircleX, MessageSquareMore} from "lucide-react-native";
import {timeSince} from "@/lib/utils/time_since";
import {Button, ButtonText} from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {PREVIEW_USE_LOWER_QUALITY} from "@/appconfig";
import Animated, {useAnimatedStyle, withRepeat, withSequence, withTiming} from "react-native-reanimated";
import {router} from "expo-router";

export default function HomeScreen() {
  const [posts, setPosts] = useState<{
    posts: WallpaperPostType[];
    pagination: PaginationType;
  } | null>();

  // Lock to prevent multiple fetches
  const [isMutationLock, setIsMutationLock] = useState(false);

  // Sort store
  const sortStore = useSortStore();

  // Fetch wallpapers logic
  const wallpaperMutation = useMutation({
    mutationKey: ["wallpapers", sortStore.sort],
    mutationFn: () => {
      if (posts && posts.pagination.after === null) {
        return Promise.reject("[SafeError, EndOfPosts] No more to fetch.");
      }
      if (isMutationLock) {
        return Promise.reject("[SafeError, Lock] Mutation is locked.");
      }
      // Lock the mutation
      setIsMutationLock(true);
      // Fetch wallpapers
      return getWallpapers(
        sortStore.sort,
        posts?.pagination.after,
        posts?.pagination.page_number ? posts.pagination.page_number + 1 : 1,
      );
    },
    onSuccess: data => {
      // Concat if we are not on the first page
      setPosts(prev => ({
        posts:
          (posts?.pagination.page_number ?? 0) > 0 && prev !== null && prev !== undefined
            ? prev.posts.concat(data.posts)
            : data.posts,
        pagination: data.pagination,
      }));
      setIsMutationLock(false);
    },
    onError: error => {
      // TODO: Log this error somewhere
      console.error(error);
      setIsMutationLock(false);
    },
  });

  // Trigger fetch on sort change
  useEffect(() => {
    if (wallpaperMutation.isPending) {
    }
    setPosts(null);
    wallpaperMutation.mutate();
  }, [sortStore.sort]);

  // Animations
  const fadingTextAnimation = useAnimatedStyle(() => {
    return {
      opacity: withRepeat(
        withSequence(
          withTiming(0.5, {
            duration: 1500,
          }),
          withTiming(1, {
            duration: 1500,
          }),
          withTiming(0.5, {
            duration: 1500,
          }),
        ),
        -1,
      ),
    };
  });

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <View className="absolute top-0 z-10 w-full">
          <HomeTopBar showLoader={posts !== null && wallpaperMutation.isPending} />
        </View>
        {wallpaperMutation.isError && wallpaperMutation.error.message?.includes("SafeError") && (
          <View className="absolute top-0 right-0 z-50 flex justify-center w-full h-screen bg-background/70">
            <View className="flex flex-row items-center gap-3 px-4">
              <CircleX size={36} color="white" />
              <Text className="text-xl font-black">Oh no!</Text>
            </View>
            <Text className="m-4 text-lg text-zinc-300">
              We encountered some problem while loading wallpapers. Please try again.
            </Text>
            <Button className="m-4" variant={"accent"} onPress={() => wallpaperMutation.mutate()}>
              <ButtonText>Retry</ButtonText>
            </Button>
          </View>
        )}
        {/* LOADING SPINNER */}
        {wallpaperMutation.isPending && posts === null && (
          <>
            {/* show in center of screen */}
            <View className="absolute top-0 right-0 z-0 flex items-center justify-center w-full h-screen">
              <LoadingSpinner size={48} color="#343434" />
              <Text className="mt-2 text-sm font-bold text-zinc-600">Loading...</Text>
            </View>
          </>
        )}
        <FlatList
          numColumns={2}
          keyExtractor={item => item.id}
          data={posts?.posts}
          onEndReached={() => {
            if (!wallpaperMutation.isPending) {
              wallpaperMutation.mutate();
            }
          }}
          onEndReachedThreshold={0.5}
          className="z-0 w-full px-3 pt-24"
          columnWrapperClassName="gap-4"
          contentContainerClassName="gap-4"
          renderItem={({item}) => <WallpaperGridItem {...item} />}
          ListFooterComponent={() => {
            if (posts && posts.pagination.after === null) {
              return (
                <View className="flex items-center justify-start w-full h-48 mb-16">
                  <Text className="px-4 pt-12 text-sm text-zinc-400">End of posts for current filter</Text>
                </View>
              );
            } else if ((posts?.pagination.page_number ?? 0) > 0) {
              return (
                <Animated.View
                  style={fadingTextAnimation}
                  className="flex items-center justify-start w-full h-48 mb-16">
                  <Text className="pt-12 text-sm text-zinc-200">Loading more...</Text>
                </Animated.View>
              );
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function WallpaperGridItem(wallpaper: WallpaperPostType) {
  const thumbnail: string =
    (PREVIEW_USE_LOWER_QUALITY ? wallpaper.image.preview_small_url : null) ??
    wallpaper.image.preview_url ??
    wallpaper.image.url;

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
      <Pressable onPress={() => router.push({pathname: "/download", params: {wallpaper: JSON.stringify(wallpaper)}})}>
        <View className="relative flex-1 h-96">
          <Animated.View
            style={fadingPulseAnimation}
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
        <Text numberOfLines={1} className="flex-1 mt-2 font-semibold">
          {wallpaper.title}
        </Text>
        <View className="flex flex-row flex-1 gap-1 justify-center items-center mt-1.5">
          <MessageSquareMore size={16} color="gray" />
          <Text className="text-sm text-zinc-400">{wallpaper.comments}</Text>
          <Text numberOfLines={1} className="flex-1 text-sm text-zinc-400">
            &nbsp;&bull;&nbsp; {timeSince(wallpaper.created_utc)}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
