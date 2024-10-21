import AsyncStorage from "@react-native-async-storage/async-storage";
import {create} from "zustand";

export interface SettingsStore {
  initialize: () => Promise<void>;
  downloadDir: string | null;
  setDownloadDir: (dir: string | null) => void;
}

export const useSettingsStore = create<SettingsStore>(set => ({
  initialize: async () => {
    const settings = await getSettings();
    set(settings);
  },
  downloadDir: null,
  setDownloadDir: (dir: string | null) =>
    set(() => {
      AsyncStorage.setItem("settings", JSON.stringify({...getSettings(), downloadDir: dir}));
      return {...getSettings(), downloadDir: dir};
    }),
}));

const getSettings = async () => {
  return (await AsyncStorage.getItem("settings").then(result => (result ? JSON.parse(result) : {}))) || {};
};
