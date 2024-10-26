import {FlatList, TextInput, View} from "react-native";
import React from "react";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import OnlineWallpaperGridItem from "@/components/OnlineWallpaperGridItem";
import {WallpaperPostType} from "@/lib/services/wallpaper_type";
import {useMutation} from "@tanstack/react-query";
import {getWallpapersFromSearch} from "@/lib/services/search_wallpapers";
import {Input} from "@/components/ui/Input";
import useDebounce from "@/hooks/useDebounce";
import {Search} from "lucide-react-native";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {LinearGradient} from "expo-linear-gradient";

export default function SearchScreen() {
  const [posts, setPosts] = React.useState<WallpaperPostType[]>();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<TextInput>(null);
  const debouncedQuery = useDebounce(query, 1000);

  // Focus input on mount
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Process debounced query
  React.useEffect(() => {
    if (debouncedQuery.length < 3) {
      setPosts([]);
      wallpaperMutation.reset();
      return;
    }
    wallpaperMutation.mutate(debouncedQuery);
  }, [debouncedQuery]);

  // Fetch wallpapers logic
  const wallpaperMutation = useMutation({
    mutationKey: ["wallpaper_search"],
    mutationFn: (query: string) => {
      // Fetch wallpapers
      return getWallpapersFromSearch(query);
    },
    onSuccess: data => {
      setPosts(data);
    },
    onError: error => {
      // TODO: Log this error somewhere
      console.error(error);
    },
  });

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <LinearGradient colors={["black", "rgba(0,0,0,0.25)"]} className="absolute top-0 right-0 z-10 w-screen">
          <View className="w-screen bg-background/80">
            <View className="flex flex-row items-center h-[68px] gap-4 px-4">
              <Search size={24} color="gray" />
              <Input
                ref={inputRef}
                className="flex-1 py-1.5 px-4 rounded-lg"
                onChangeText={text => setQuery(text)}
                placeholder="Type something..."
                placeholderTextColor={"#787878"}
              />
            </View>
          </View>
        </LinearGradient>
        {wallpaperMutation.isSuccess ? (
          <FlatList
            numColumns={2}
            keyExtractor={item => item.id}
            data={posts}
            className="z-0 w-full px-3 pt-20"
            columnWrapperClassName="gap-4"
            contentContainerClassName="gap-4"
            renderItem={({item}) => <OnlineWallpaperGridItem {...item} />}
            ListFooterComponent={() => (
              <View className="flex items-center justify-start w-full h-64 mb-16">
                <Text className="px-4 pt-12 text-sm text-zinc-400">End of posts</Text>
              </View>
            )}
          />
        ) : wallpaperMutation.isPending ? (
          <View className="absolute top-0 right-0 z-0 flex items-center justify-center w-full h-screen">
            <LoadingSpinner size={48} color="#343434" />
            <Text className="mt-2 text-sm font-bold text-zinc-600">Loading...</Text>
          </View>
        ) : (
          <>
            <View className="absolute top-0 right-0 z-0 flex items-center justify-center w-full h-screen">
              <Search size={48} color="#565656" strokeWidth={1.25} />
              <Text className="mt-2 font-bold text-zinc-600">Type in the search box above to get started</Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
