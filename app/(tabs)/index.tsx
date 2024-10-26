import {FlatList, View} from "react-native";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import HomeTopBar from "@/components/HomeTopBar";
import React from "react";
import {getWallpapers} from "@/lib/services/wallpaper_grid_service";
import {useSortStore} from "@/store/sort";
import {useMutation} from "@tanstack/react-query";
import {PaginationType, WallpaperPostType} from "@/lib/services/wallpaper_type";
import {CircleX} from "lucide-react-native";
import {Button, ButtonText} from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Animated from "react-native-reanimated";
import OnlineWallpaperGridItem from "@/components/OnlineWallpaperGridItem";
import {fadingPulseAnimation} from "@/lib/animations/fading_pulse";

type PostsType = {
  posts: WallpaperPostType[];
  pagination: PaginationType;
} | null;

export default function HomeScreen() {
  const [posts, setPosts] = React.useState<PostsType>();

  // Lock to prevent multiple fetches
  const [isMutationLock, setIsMutationLock] = React.useState(false);

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
  React.useEffect(() => {
    if (wallpaperMutation.isPending) {
    }
    setPosts(null);
    wallpaperMutation.mutate();
  }, [sortStore.sort]);

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
        {/* TODO: on sort change, scroll to top */}
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
          renderItem={({item}) => <OnlineWallpaperGridItem {...item} />}
          ListFooterComponent={() => {
            if (posts && posts.pagination.after === null) {
              return (
                <View className="flex items-center justify-start w-full mb-16 h-72">
                  <Text className="px-4 pt-12 text-sm text-zinc-400">End of posts for current filter</Text>
                </View>
              );
            } else if ((posts?.pagination.page_number ?? 0) > 0) {
              return (
                <View className="flex flex-col items-center justify-start w-full mb-16 h-72">
                  <Animated.View style={fadingPulseAnimation(4500)}>
                    <Text className="pt-12 text-sm text-zinc-200">Loading more...</Text>
                  </Animated.View>
                  <Button
                    variant={"secondary"}
                    size={"sm"}
                    className="mt-4 opacity-60"
                    onPress={() => {
                      if (!wallpaperMutation.isPending) {
                        wallpaperMutation.mutate();
                      }
                    }}>
                    <ButtonText>Not loading?</ButtonText>
                  </Button>
                </View>
              );
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}
