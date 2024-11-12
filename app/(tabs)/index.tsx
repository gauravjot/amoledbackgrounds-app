import {FlatList, View} from "react-native";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import React from "react";
import {getWallpapers} from "@/lib/services/get_wallpapers";
import {useMutation} from "@tanstack/react-query";
import {PaginationType, WallpaperPostType} from "@/lib/services/wallpaper_type";
import {CircleX} from "lucide-react-native";
import {Button, ButtonText} from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Animated, {useSharedValue, withTiming} from "react-native-reanimated";
import OnlineWallpaperGridItem from "@/components/OnlineWallpaperGridItem";
import {fadingPulseAnimation} from "@/lib/animations/fading_pulse";
import {useSettingsStore} from "@/store/settings";
import {SortOptions} from "@/constants/sort_options";
import Select from "@/components/ui/Select";
import TopBar from "@/components/ui/TopBar";
import * as SqlUtility from "@/lib/utils/sql";
import SendErrorLogs from "@/lib/services/send_error_logs";

type PostsType = {
  posts: WallpaperPostType[];
  pagination: PaginationType;
} | null;

export default function HomeScreen() {
  const store = useSettingsStore();
  const flatListRef = React.useRef<FlatList>(null);
  const [posts, setPosts] = React.useState<PostsType>();
  const [sort, setSort] = React.useState<SortOptions>(store.rememberSortPreferences ? store.homeSort : SortOptions.Hot);

  // Animations
  const topBarAnimateTop = useSharedValue(0);
  const topBarAnimateOpacity = useSharedValue(1);

  // Lock to prevent multiple fetches
  const [isMutationLock, setIsMutationLock] = React.useState(false);

  // Fetch wallpapers logic
  const wallpaperMutation = useMutation({
    mutationKey: ["wallpapers", sort],
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
        sort,
        posts?.pagination.after,
        posts?.pagination.page_number ? posts.pagination.page_number + 1 : 1,
        store.deviceIdentifier,
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
      // Log error
      if (!error.toString().toLowerCase().includes("safeerror")) {
        SqlUtility.insertErrorLog(
          {
            file: "(tabs)/index.tsx[HomeScreen]",
            description: error.message,
            error_title: "Wallpaper Fetch Error",
            method: "wallpaperMutation",
            params: JSON.stringify({
              sort: sort,
              pagination: posts?.pagination,
            }),
            severity: "error",
            stacktrace: error.stack || "",
          },
          store.deviceIdentifier,
        );
      }
      setIsMutationLock(false);
    },
  });

  // When sort is changed, change states
  function onSortChange(sort: SortOptions) {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({animated: true, offset: 0});
    }
    setPosts(null); // empty out posts
    setSort(sort); // set new sort
    store.setHomeSort(sort); // store
  }

  // Trigger wallpaper fetch on sort change
  React.useEffect(() => {
    wallpaperMutation.mutate();
  }, [sort]);

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <Animated.View style={{top: topBarAnimateTop, opacity: topBarAnimateOpacity}} className="absolute z-10 w-full">
          <TopBar showLoader={posts !== null && wallpaperMutation.isPending} title="Amoled Backgrounds">
            <Select
              defaultValue={sort}
              options={Object.keys(SortOptions)}
              onChange={e => {
                onSortChange(SortOptions[e as keyof typeof SortOptions]);
              }}
              width={140}
            />
          </TopBar>
        </Animated.View>
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
          ref={flatListRef}
          numColumns={2}
          keyExtractor={item => item.id}
          data={posts?.posts}
          onEndReached={() => {
            if (!wallpaperMutation.isPending) {
              wallpaperMutation.mutate();
            }
          }}
          onScroll={e => {
            if (e.nativeEvent.contentOffset.y > 96 && e.nativeEvent.velocity && e.nativeEvent.velocity.y > 0) {
              topBarAnimateTop.value = withTiming(-72, {duration: 200});
              topBarAnimateOpacity.value = withTiming(0, {duration: 200});
            } else {
              topBarAnimateTop.value = withTiming(0, {duration: 200});
              topBarAnimateOpacity.value = withTiming(1, {duration: 200});
            }
          }}
          onEndReachedThreshold={0.5}
          className="z-0 w-full px-3 pt-20"
          columnWrapperClassName="gap-3"
          contentContainerClassName="gap-3"
          renderItem={({item}) => <OnlineWallpaperGridItem {...item} />}
          ListFooterComponent={() => {
            if (posts && posts.pagination.after === null) {
              return (
                <View className="flex items-center justify-start w-full h-64 mb-20">
                  <Text className="px-4 pt-12 text-sm text-zinc-400">End of posts for current filter</Text>
                </View>
              );
            } else if ((posts?.pagination.page_number ?? 0) > 0) {
              return (
                <View className="flex flex-row items-center justify-center w-full h-64 gap-3 mb-24">
                  <LoadingSpinner size={24} color="#676767" />
                  <Animated.View style={fadingPulseAnimation(4500)}>
                    <Text className="text-sm text-zinc-200">Loading more...</Text>
                  </Animated.View>
                </View>
              );
            }
          }}
        />
      </View>
      <SendLogs isSendLogsEnabled={store.sendErrorLogsEnabled} />
    </SafeAreaView>
  );
}

function SendLogs({isSendLogsEnabled}: {isSendLogsEnabled: boolean}) {
  const store = useSettingsStore();

  React.useEffect(() => {
    const lastDateSent: string | null = store.logsLastSent;
    const currentDate = new Date();
    const diffDays = lastDateSent
      ? (currentDate.getTime() - new Date(lastDateSent).getTime()) / (1000 * 60 * 60 * 24)
      : 1;

    async function send() {
      if (isSendLogsEnabled && diffDays >= 1) {
        const success = await SendErrorLogs(isSendLogsEnabled);
        if (success) {
          store.setLogsLastSent(currentDate);
        }
      }
    }

    send();
  }, []);

  return <></>;
}
