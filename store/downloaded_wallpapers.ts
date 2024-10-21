import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DownloadedWallpaperStore {
  initialize: () => Promise<void>;
  files: DownloadedWallpaperPostType[];
  addFile: (file: DownloadedWallpaperPostType) => void;
  removeFile: (id: string) => void;
  setFiles: (files: DownloadedWallpaperPostType[]) => void;
  exists: (id: string) => boolean;
  getFile: (id: string) => DownloadedWallpaperPostType | undefined;
}

export const useDownloadedWallpapersStore = create<DownloadedWallpaperStore>((set, get) => ({
  initialize: async () => {
    const files = await getDownloadedWallpapers();
    console.log(files);
    set({files: files});
  },
  files: [],
  addFile: async (file: DownloadedWallpaperPostType) => {
    const f = [...get().files, file];
    await AsyncStorage.setItem("downloaded_wallpapers", JSON.stringify(f));
    set({files: f});
  },
  removeFile: (id: string) => {
    const f = get().files.filter(file => file.id !== id);
    AsyncStorage.setItem("downloaded_wallpapers", JSON.stringify(f));
    set({files: f});
  },
  setFiles: (files: DownloadedWallpaperPostType[]) => {
    AsyncStorage.setItem("downloaded_wallpapers", JSON.stringify(files));
    set({files: files});
  },
  exists: (id: string) => get().files.some(file => file.id === id),
  getFile: (id: string) => get().files.find(file => file.id === id),
}));

const getDownloadedWallpapers = async () => {
  return (await AsyncStorage.getItem("downloaded_wallpapers").then(result => (result ? JSON.parse(result) : []))) || [];
};

export type DownloadedWallpaperPostType = {
  id: string;
  title: string;
  uri: string;
  createdAt: Date;
  width: number;
  height: number;
  post_link: string;
  author: string;
};
