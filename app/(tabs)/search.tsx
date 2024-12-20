import {FlatList, TextInput, View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import OnlineWallpaperGridItem from "@/components/OnlineWallpaperGridItem";
import {PaginationType, WallpaperPostType} from "@/lib/services/wallpaper_type";
import {useMutation} from "@tanstack/react-query";
import {getWallpapersFromSearch} from "@/lib/services/search_wallpapers";
import {Input} from "@/components/ui/Input";
import useDebounce from "@/hooks/useDebounce";
import {CircleX, Search, SearchX} from "lucide-react-native";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {LinearGradient} from "expo-linear-gradient";
import {useSettingsStore} from "@/store/settings";
import {Button, ButtonText} from "@/components/ui/Button";
import {fadingPulseAnimation} from "@/lib/animations/fading_pulse";
import Animated from "react-native-reanimated";
import * as SqlUtility from "@/lib/utils/sql";

type PostsType = {
  posts: WallpaperPostType[];
  pagination: PaginationType;
} | null;

export default function SearchScreen() {
  const [posts, setPosts] = React.useState<PostsType>(null);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<TextInput>(null);
  const debouncedQuery = useDebounce(query, query.length > 2 ? 500 : 0);

  const store = useSettingsStore();

  // Lock to prevent multiple fetches
  const [isMutationLock, setIsMutationLock] = React.useState(false);

  // Focus input on mount
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Process debounced query
  React.useEffect(() => {
    if (debouncedQuery.length < 3) {
      setPosts({posts: [], pagination: {after: undefined, page_number: 0}});
      wallpaperMutation.reset();
      return;
    }
    wallpaperMutation.mutate(debouncedQuery);
    if (store.rememberSearchHistory) {
      store.addSearchHistory(debouncedQuery);
    }
  }, [debouncedQuery]);

  // Fetch wallpapers logic
  const wallpaperMutation = useMutation({
    mutationKey: ["wallpaper_search"],
    mutationFn: (query: string) => {
      if (posts?.posts && posts?.posts.length > 0 && posts.pagination.after === null) {
        return Promise.reject("[SafeError, EndOfPosts] No more to fetch.");
      }
      if (isMutationLock) {
        return Promise.reject("[SafeError, Lock] Mutation is locked.");
      }
      // Lock the mutation
      setIsMutationLock(true);
      // Fetch wallpapers
      return getWallpapersFromSearch(
        query,
        (posts?.pagination.page_number ?? 0) + 1,
        posts?.pagination.after,
        store.deviceIdentifier,
      );
    },
    onSuccess: data => {
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
      if (!error.toString().toLowerCase().includes("safeerror") && error.message !== "Network Error") {
        SqlUtility.insertErrorLog(
          {
            file: "(tabs)/search.tsx[SearchScreen]",
            description: error.message,
            error_title: "Wallpaper Fetch Error",
            method: "wallpaperMutation",
            params: JSON.stringify({
              query: query,
              pagination: posts?.pagination,
            }),
            severity: "error",
            stacktrace: error.stack || error.toString() || "",
          },
          store.deviceIdentifier,
        );
      }
      setIsMutationLock(false);
    },
  });

  return (
    <>
      <View className="h-screen bg-background">
        <LinearGradient colors={["black", "rgba(0,0,0,0.25)"]} className="absolute top-0 right-0 z-10 w-screen">
          <View className="w-screen bg-background/80">
            <View className="flex flex-row items-center h-[68px] gap-4 px-4 relative">
              <Search size={24} color="#454545" />
              <Input
                ref={inputRef}
                className="flex-1 py-1.5 px-4 rounded-lg"
                onChangeText={text => setQuery(text)}
                showClearButton={true}
                value={query}
                placeholder="Type something..."
                placeholderTextColor={"#787878"}
              />
            </View>
          </View>
        </LinearGradient>
        {debouncedQuery.length < 3 ? (
          <>
            {store.rememberSearchHistory && (
              <View className="relative z-10 flex flex-row flex-wrap items-center gap-3 px-4 mt-20 bg-background">
                <Text className="text-sm text-zinc-500">Recent searches</Text>
                {store.searchHistory.length > 0 && (
                  <>
                    {store.searchHistory.map(q => (
                      <Button key={q} size={"sm"} onPress={() => setQuery(q)}>
                        <ButtonText>{q}</ButtonText>
                      </Button>
                    ))}
                    <Button size={"sm"} variant={"ghost"} onPress={() => store.clearSearchHistory()}>
                      <ButtonText variant={"secondary"} size={"md"}>
                        Clear history
                      </ButtonText>
                    </Button>
                  </>
                )}
              </View>
            )}
          </>
        ) : wallpaperMutation.isSuccess && posts?.posts.length === 0 ? (
          <View className="absolute top-0 right-0 z-0 flex items-center justify-center w-full h-screen -mt-16">
            <SearchX size={48} color="#565656" strokeWidth={1.25} />
            <Text className="mt-2 font-bold text-zinc-600">No results found for '{debouncedQuery}'</Text>
          </View>
        ) : (
          <></>
        )}
        <FlatList
          numColumns={2}
          keyExtractor={item => item.id}
          data={posts?.posts}
          onEndReached={() => {
            if (!wallpaperMutation.isPending) {
              wallpaperMutation.mutate(debouncedQuery);
            }
          }}
          className="z-0 w-full px-3 pt-20"
          columnWrapperClassName="gap-3"
          contentContainerClassName="gap-3"
          renderItem={({item}) => <OnlineWallpaperGridItem {...item} />}
          ListHeaderComponent={() =>
            posts?.posts && posts.posts.length > 0 ? (
              <View className="flex items-center w-full pb-2 border-b border-zinc-900">
                <Text className="text-sm text-zinc-500">Results for '{debouncedQuery}'</Text>
              </View>
            ) : (
              <></>
            )
          }
          ListFooterComponent={() => {
            if (posts?.posts && posts.posts.length > 0 && posts.pagination.after === null) {
              return (
                <View className="flex flex-row justify-center w-full pt-16 pb-24 mb-48">
                  <Text className="px-4 text-sm text-zinc-400">End of posts for current filter</Text>
                </View>
              );
            } else if (
              wallpaperMutation.isPending &&
              (posts?.pagination.page_number ?? 0) > 0 &&
              posts?.pagination.after != null
            ) {
              return (
                <View className="flex flex-row items-center justify-center w-full gap-2 pt-16 pb-24 mb-48">
                  <LoadingSpinner size={24} color="#676767" />
                  <Animated.View style={fadingPulseAnimation(4500)}>
                    <Text className="text-sm text-zinc-200">Loading more...</Text>
                  </Animated.View>
                </View>
              );
            } else if (wallpaperMutation.isError && (posts?.posts.length ?? 0) > 0) {
              return (
                <View className="flex flex-col items-center justify-center w-full pt-16 pb-24 mb-36">
                  <ErrorFetching reload={() => wallpaperMutation.mutate(debouncedQuery)} />
                </View>
              );
            }
          }}
        />
        {wallpaperMutation.isPending && (posts === null || posts.posts.length === 0) ? (
          /* LOADING SPINNER */
          <>
            <View className="absolute top-0 right-0 z-0 flex items-center justify-center w-full h-screen -mt-16">
              <LoadingSpinner size={48} color="#343434" />
              <Text className="mt-2 text-sm font-bold text-zinc-600">Loading...</Text>
            </View>
          </>
        ) : wallpaperMutation.isError && (posts === null || posts.posts.length === 0) ? (
          /* Error message */
          <>
            <View className="absolute top-0 right-0 z-0 flex items-center justify-center w-full h-screen -mt-16">
              <ErrorFetching reload={() => wallpaperMutation.mutate(debouncedQuery)} />
            </View>
          </>
        ) : posts === null || posts.posts.length === 0 ? (
          /* Type in to search */
          <>
            <View className="absolute top-0 right-0 z-0 flex items-center justify-center w-full h-screen -mt-16">
              <Search size={48} color="#565656" strokeWidth={1.25} />
              <Text className="mt-2 font-bold text-zinc-600">Type in the search box above to get started</Text>
            </View>
          </>
        ) : (
          <></>
        )}
      </View>
    </>
  );
}

function ErrorFetching({reload}: {reload: () => void}) {
  return (
    <>
      {/* show in center of screen */}
      <CircleX size={48} color="#343434" />
      <Text className="mt-2 font-bold text-md text-zinc-600">Error occured while loading wallpapers...</Text>
      <Text className="mt-2 text-zinc-600 text-md">Make sure you are connected to the internet.</Text>
      <Button className="mt-4" variant={"accent"} size={"md"} onPress={reload}>
        <ButtonText>Retry</ButtonText>
      </Button>
    </>
  );
}
