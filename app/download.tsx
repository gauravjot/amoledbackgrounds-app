import {Image, Platform, Pressable, View} from "react-native";
import React, {useEffect} from "react";
import {WallpaperPostType} from "@/lib/services/wallpaper_type";
import {Link, useLocalSearchParams} from "expo-router";
import {Text} from "@/components/ui/Text";
import {SafeAreaView} from "react-native-safe-area-context";
import Animated, {useAnimatedStyle, withRepeat, withSequence, withTiming} from "react-native-reanimated";
import {ArrowDownCircle, ArrowUp, ExternalLink, ImageIcon, MessageSquareMore} from "lucide-react-native";
import {Button, ButtonText} from "@/components/ui/Button";
import * as WebBrowser from "expo-web-browser";
import * as FileSystem from "expo-file-system";
import {shareAsync} from "expo-sharing";
import {useSettingsStore} from "@/store/settings";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {useDownloadedWallpapersStore} from "@/store/downloaded_wallpapers";
import {DownloadedWallpaperPostType} from "../store/downloaded_wallpapers";
import {NativeModules} from "react-native";

export default function DownloadScreen() {
  const params = useLocalSearchParams();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isDownloaded, setIsDownloaded] = React.useState(false);
  const [downloadedFile, setDownloadedFile] = React.useState<DownloadedWallpaperPostType | null>(null);

  const {WallpaperManagerModule} = NativeModules;

  const wallpaper = JSON.parse(params["wallpaper"] as string) as WallpaperPostType;
  const filename =
    wallpaper.title.replaceAll(" ", "_") + "_" + wallpaper.id + "." + wallpaper.image.url.split(".").pop();

  const settingsStore = useSettingsStore();
  const downloadedStore = useDownloadedWallpapersStore();

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

  const showComments = () => {
    console.log("Show Comments");
  };

  const fullScreenWallpaperToggle = () => {
    console.log("Toggle Fullscreen");
  };

  const downloadWallpaper = async () => {
    if (isDownloaded) {
      return;
    }
    setIsDownloading(true);
    const fileuri = await download(wallpaper.image.url, filename);
    setIsDownloading(false);
    // See if the file was saved
    if (fileuri) {
      const file = await FileSystem.getInfoAsync(fileuri);
      if (file.exists) {
        // file was downloaded successfully, set the flag
        setIsDownloaded(true);
        // Save to downloaded store
        saveToDownloadedStore(fileuri);
      }
    }
  };

  const applyWallpaper = async () => {
    console.log("Apply Wallpaper");
    const response = WallpaperManagerModule.setWallpaper(downloadedFile?.uri);
    console.log(response);
  };

  // check if current wallpaper is downloaded
  useEffect(() => {
    const saved_file = downloadedStore.getFile(wallpaper.id);
    if (saved_file) {
      FileSystem.getInfoAsync(saved_file.uri)
        .then(() => {
          setIsDownloaded(true);
          setDownloadedFile(saved_file);
        })
        .catch(e => {
          setIsDownloaded(false);
          downloadedStore.removeFile(wallpaper.id);
        });
    } else {
      setIsDownloaded(false);
    }
  }, []);

  console.log(settingsStore.downloadDir);

  return (
    <View className="relative h-screen bg-background">
      <Animated.View
        style={fadingPulseAnimation}
        className="absolute top-0 left-0 z-0 w-full h-full bg-foreground/20"></Animated.View>
      <Image className="z-10 flex-1 object-contain w-full h-full" source={{uri: wallpaper.image.url}} />
      <SafeAreaView className="absolute top-0 bottom-0 left-0 right-0 z-20 flex flex-col">
        <Pressable className="relative z-0 flex-1" onPress={fullScreenWallpaperToggle}></Pressable>
        <View className="relative z-10 p-4 bg-background/50">
          {!isDownloaded && !isDownloading ? (
            <Button
              variant={"accent"}
              className="absolute z-30 rounded-full -top-6 right-4"
              onPress={downloadWallpaper}>
              <ArrowDownCircle size={16} color="white" />
              <ButtonText>Download</ButtonText>
            </Button>
          ) : isDownloaded ? (
            <Button variant={"accent"} className="absolute z-30 rounded-full -top-6 right-4" onPress={applyWallpaper}>
              <ImageIcon size={16} color="white" />
              <ButtonText>Apply</ButtonText>
            </Button>
          ) : (
            <Button variant={"accent"} className="absolute z-30 rounded-full -top-6 right-4" disabled>
              <LoadingSpinner />
            </Button>
          )}
          {wallpaper.flair && (
            <View className="flex flex-row items-center gap-3 py-1 rounded">
              <View className="flex flex-row items-center justify-center px-1.5 py-0.5 rounded bg-background/80 border border-foreground/30">
                <Text className="text-sm text-zinc-200">
                  {wallpaper.image.width} x {wallpaper.image.height}
                </Text>
              </View>
              <Text className="inline px-1 text-xs font-semibold uppercase rounded bg-emerald-700">
                {wallpaper.flair}
              </Text>
            </View>
          )}
          <View className="flex flex-row items-center gap-3 mt-3 bottom-1">
            <View className="flex flex-row items-center justify-center gap-2 p-1 rounded bg-background/80">
              <ArrowUp size={16} color="white" />
              <Text className="text-sm font-semibold text-zinc-200 pe-1">{wallpaper.score}</Text>
            </View>
            <Button variant={"ghost"} size={"xs"} className="h-7 bg-background/80">
              <MessageSquareMore size={16} color="white" />
              <ButtonText className="text-sm font-semibold" size={"md"} onPress={showComments}>
                {wallpaper.comments} Comments
              </ButtonText>
            </Button>
          </View>
          <View className="mt-4">
            <Text className="text-lg font-bold text-foreground" numberOfLines={2}>
              {wallpaper.title}
            </Text>
            <View className="flex flex-row items-center gap-3 mt-3">
              <Text className="text-zinc-400" numberOfLines={1}>
                u/{wallpaper.author}
              </Text>
              <Text
                className="inline px-1 text-xs font-semibold uppercase rounded bg-sky-800 text-white/80"
                numberOfLines={1}>
                {wallpaper.author_flair}
              </Text>
            </View>
          </View>
          <View className="absolute bottom-3 right-4">
            {wallpaper.postlink && (
              <Button
                variant={"outline"}
                size={"xs"}
                className="h-8"
                onPress={async () => {
                  await WebBrowser.openBrowserAsync(wallpaper.postlink as string);
                }}>
                <ButtonText>thread</ButtonText>
                <ExternalLink size={16} color="white" />
              </Button>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  async function download(url: string, filename: string): Promise<string | null> {
    const result = await FileSystem.downloadAsync(url, FileSystem.documentDirectory + filename);
    return saveFile(result.uri, filename, result.headers["content-type"]);

    async function saveFile(uri: string, filename: string, mimetype: string) {
      if (Platform.OS === "android") {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
          settingsStore.downloadDir,
        );

        if (permissions.granted) {
          // Save directory URI to settings
          let dir_uri = permissions.directoryUri;
          if (settingsStore.downloadDir !== dir_uri) {
            settingsStore.setDownloadDir(dir_uri);
          }
          const base64 = await FileSystem.readAsStringAsync(uri, {encoding: FileSystem.EncodingType.Base64});
          try {
            const fileuri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              filename,
              mimetype,
            );
            await FileSystem.writeAsStringAsync(fileuri, base64, {encoding: FileSystem.EncodingType.Base64});
            // return the file uri
            return fileuri;
          } catch (error) {
            console.error(error);
          }
        } else {
          shareAsync(uri);
        }
      } else {
        shareAsync(uri);
      }
      return null;
    }
  }

  function saveToDownloadedStore(fileuri: string) {
    downloadedStore.addFile({
      id: wallpaper.id,
      title: wallpaper.title,
      uri: fileuri,
      createdAt: new Date(),
      width: wallpaper.image.width,
      height: wallpaper.image.height,
      post_link: wallpaper.postlink,
      author: wallpaper.author,
    });
  }
}
