import {FlatList, View, Image} from "react-native";
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

export default function HomeScreen() {
  const [page, setPage] = useState<number>(0);
  const [posts, setPosts] = useState<{
    posts: WallpaperPostType[];
    pagination: PaginationType;
  } | null>();
  const sortStore = useSortStore();

  // Fetch wallpapers logic
  const wallpaperMutation = useMutation({
    mutationKey: ["wallpapers", sortStore.sort, page],
    mutationFn: (resetPrior?: boolean) => {
      if (resetPrior) {
        setPage(1);
        setPosts(null);
      }
      return getWallpapers(
        sortStore.sort,
        resetPrior ? undefined : posts?.pagination.after,
        resetPrior ? 1 : page + 1 /* next page number */,
      );
    },
    onSuccess: data => {
      setPosts(s => ({
        posts: page !== 0 && s !== null && s !== undefined ? s.posts.concat(data.posts) : data.posts,
        pagination: data.pagination,
      }));
      setPage(p => p + 1);
    },
    onError: error => {
      // TODO: Log this error somewhere
      console.error(error);
    },
  });

  // Trigger fetch on sort change
  useEffect(() => {
    setPosts(null);
    console.log("fetching wallpapers");
    if (wallpaperMutation.isPending) {
    }
    wallpaperMutation.mutate(true);
  }, [sortStore.sort]);

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <View className="absolute top-0 z-10 w-full">
          <HomeTopBar showLoader={posts !== null && wallpaperMutation.isPending} />
        </View>
        {wallpaperMutation.isError && (
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
          className="z-0 w-full px-3 py-20"
          columnWrapperClassName="gap-4"
          contentContainerClassName="gap-4"
          renderItem={({item}) => <WallpaperGridItem {...item} />}
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

  return (
    <View className="pb-2" style={{flex: 0.5}}>
      <View className="flex-1 h-96 bg-foreground/10">
        <Image className="flex-1 object-contain w-full h-full" source={{uri: thumbnail}} />
      </View>
      <Text numberOfLines={1} className="flex-1 mt-2 font-semibold">
        {wallpaper.title}
      </Text>
      <View className="flex flex-row flex-1 gap-2 items-center mt-1.5">
        <ArrowUp size={16} color="gray" />
        <Text className="text-sm text-zinc-400 min-w-6">{wallpaper.score}</Text>
        <MessageSquareMore size={16} color="gray" />
        <Text className="text-sm text-zinc-400">{wallpaper.comments}</Text>
        <Text numberOfLines={1} className="flex-1 text-sm text-zinc-400">
          &nbsp;&bull;&nbsp; {timeSince(wallpaper.created_utc)}
        </Text>
      </View>
    </View>
  );
}
