import {FlatList, View, Image} from "react-native";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import HomeTopBar from "@/components/HomeTopBar";
import {useEffect, useState} from "react";
import {getWallpapers} from "@/lib/services/wallpaper_grid_service";
import {useSortStore} from "@/store/sort";
import {useMutation} from "@tanstack/react-query";
import {PaginationType, WallpaperPostType} from "@/lib/services/wallpaper_type";
import {ArrowUp, MessageSquareMore} from "lucide-react-native";
import {timeSince} from "@/lib/utils/time_since";

export default function HomeScreen() {
  const [page, setPage] = useState<number>(1);
  const [posts, setPosts] = useState<{
    posts: WallpaperPostType[];
    pagination: PaginationType;
  }>();
  const sortStore = useSortStore();

  // Fetch wallpapers logic
  const wallpaperQuery = useMutation({
    mutationKey: ["wallpapers", sortStore.sort, page],
    mutationFn: () => getWallpapers(sortStore.sort, posts?.pagination.after, page),
    onSuccess: data => {
      setPosts(s => ({
        posts: page !== 1 && s !== undefined ? s.posts.concat(data.posts) : data.posts,
        pagination: data.pagination,
      }));
      setPage(p => p + 1);
    },
    onError: error => {
      console.error(error);
    },
  });

  // Trigger fetch on sort change
  useEffect(() => {
    if (posts?.pagination.page_number === page) return;
    console.log("fetching wallpapers");
    wallpaperQuery.mutate();
  }, [sortStore.sort]);

  return (
    <SafeAreaView className="bg-background">
      <View className="h-screen bg-background">
        <View className="z-10">
          <HomeTopBar />
        </View>
        <FlatList
          numColumns={2}
          keyExtractor={item => item.id}
          data={posts?.posts}
          className="z-0 w-full p-3"
          columnWrapperClassName="gap-3"
          contentContainerClassName="gap-3"
          renderItem={({item}) => <WallpaperGridItem {...item} />}
        />
      </View>
    </SafeAreaView>
  );
}

function WallpaperGridItem(wallpaper: WallpaperPostType) {
  return (
    <View className="flex-1 pb-2">
      <View className="flex-1 h-96 bg-foreground/10">
        <Image className="flex-1 object-contain w-full h-full" source={{uri: wallpaper.image.preview_url}} />
      </View>
      <Text numberOfLines={1} className="flex-1 mt-2 font-semibold">
        {wallpaper.title}
      </Text>
      <View className="flex flex-row flex-1 gap-2 items-center mt-1.5">
        <ArrowUp size={16} color="gray" />
        <Text className="text-zinc-400 min-w-6">{wallpaper.score}</Text>
        <MessageSquareMore size={16} color="gray" />
        <Text className="text-zinc-400 min-w-6">{wallpaper.comments}</Text>
        <Text numberOfLines={1} className="flex-1 text-right text-zinc-400">
          {timeSince(wallpaper.created_utc)}
        </Text>
      </View>
    </View>
  );
}
