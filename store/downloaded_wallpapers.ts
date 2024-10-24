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
  const files = DownloadManager.getDownloadedFiles();
  const list: DownloadedWallpaperPostType[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.name.includes("amoled_droidheat")) {
      let name = file.name.replace("_amoled_droidheat", "");
      // remove extension
      name = name.split(".").slice(0, -1).join(".");
      let id = name.split("_").pop();
      let width: number | null = null;
      let height: number | null = null;
      name = name
        .replace(id || "", "")
        .replace("_t3_", "")
        // trim any number of trailing underscores
        .replace(/_+$/, "");
      let resolution = name.split("_").pop() || "";
      width = parseInt(resolution.split("x")[0]);
      height = parseInt(resolution.split("x")[1]);

      if (isNaN(width) || isNaN(height)) {
        // Resolution was not present in name
        name = name.replaceAll("_", " ");
      } else {
        // Remove resolution from name
        name = name.replace(`_${resolution}`, "");
      }

      list.push({
        title: name.replace(/_/g, " ").replace(/-/g, " ").replace(/_/g, " ").trim(),
        path: file.path,
        width: width,
        height: height,
      });
    }
  }
  return list;
};

export type DownloadedWallpaperPostType = {
  title: string;
  path: string;
  width: number | null;
  height: number | null;
};
