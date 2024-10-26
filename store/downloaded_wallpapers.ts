import {create} from "zustand";
import * as DownloadManager from "@/modules/download-manager";

export interface DownloadedWallpaperStore {
  initialize: () => Promise<void>;
  files: DownloadedWallpaperPostType[];
  addFile: (file: DownloadedWallpaperPostType) => void;
  removeFile: (uri: string) => void;
  setFiles: (files: DownloadedWallpaperPostType[]) => void;
  exists: (uri: string) => boolean;
  getFile: (uri: string) => DownloadedWallpaperPostType | undefined;
}

export const useDownloadedWallpapersStore = create<DownloadedWallpaperStore>((set, get) => ({
  initialize: async () => {
    const files = await getDownloadedWallpapers();
    set({files: files});
  },
  files: [],
  addFile: async (file: DownloadedWallpaperPostType) => {
    set(state => {
      return {files: [...state.files, file]};
    });
  },
  removeFile: (filename: string) => {
    set(state => {
      return {files: state.files.filter(file => !file.path.includes(filename))};
    });
  },
  setFiles: (files: DownloadedWallpaperPostType[]) => {
    set({files: files});
  },
  exists: (filename: string) => get().files.some(file => file.path.includes(filename)),
  getFile: (filename: string) => get().files.find(file => file.path.includes(filename)),
}));

const getDownloadedWallpapers = async () => {
  const files = DownloadManager.getDownloadedFiles("_amoled_droidheat");
  const list: DownloadedWallpaperPostType[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Two possible formats
    // 1. name_t3_[id]_amoled_droidheat.jpg
    // 2. name_-_[id]_amoled_droidheat.jpg
    let name = file.name.replace("_amoled_droidheat", "");
    // remove extension
    name = name.split(".").slice(0, -1).join(".");
    if (name.includes("_t3_")) {
      name = name.split("_t3_")[0];
    } else {
      name = name.split("_-_")[0];
    }

    list.push({
      title: name.replace(/_/g, " ").replace(/_/g, " ").trim(),
      path: file.path,
      width: parseInt(file.width),
      height: parseInt(file.height),
    });
  }
  return list;
};

export type DownloadedWallpaperPostType = {
  title: string;
  path: string;
  width: number | null;
  height: number | null;
};
