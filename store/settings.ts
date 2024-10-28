import {SEARCH_HISTORY_LIMIT} from "@/appconfig";
import {SortOptions} from "@/constants/sort_options";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {create} from "zustand";

export interface SettingsStore {
  initialize: () => Promise<void>;
  downloadDir: string | null;
  setDownloadDir: (dir: string | null) => void;
  homeSort: SortOptions;
  setHomeSort: (sort: SortOptions) => void;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  isDailyWallpaperEnabled: boolean;
  setDailyWallpaperEnabled: (enabled: boolean) => void;
  dailyWallpaperMode: string;
  setDailyWallpaperMode: (mode: string) => void;
  dailyWallpaperSort: SortOptions;
  setDailyWallpaperSort: (sort: SortOptions) => void;
  isLowerThumbnailQualityEnabled: boolean;
  setLowerThumbnailQualityEnabled: (enabled: boolean) => void;
  rememberSortPreferences: boolean;
  setRememberedSortPreferences: (e: boolean) => void;
  rememberSearchHistory: boolean;
  setRememberedSearchHistory: (e: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  initialize: async () => {
    const settings = await getSettings();
    set({
      downloadDir: settings.downloadDir,
      homeSort: settings.homeSort || SortOptions.Hot,
      searchHistory: settings.searchHistory || [],
      isDailyWallpaperEnabled: settings.isDailyWallpaperEnabled || false,
      dailyWallpaperMode: settings.dailyWallpaperMode || "Online",
      dailyWallpaperSort: settings.dailyWallpaperSort || SortOptions.Hot,
      isLowerThumbnailQualityEnabled: settings.isLowerThumbnailQualityEnabled || false,
      rememberSortPreferences: settings.rememberSortPreferences || false,
      rememberSearchHistory: settings.rememberSearchHistory || true,
    });
  },

  downloadDir: null,
  setDownloadDir: async (dir: string | null) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, downloadDir: dir};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },

  homeSort: SortOptions.Hot,
  setHomeSort: async (sort: SortOptions) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, homeSort: sort};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },

  searchHistory: [],
  addSearchHistory: async (query: string) => {
    const history = get().searchHistory.filter(q => q !== query);
    history.unshift(query);
    const limit = SEARCH_HISTORY_LIMIT;
    if (history.length > limit) history.splice(limit);
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, searchHistory: history};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },
  clearSearchHistory: async () => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, searchHistory: []};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },

  isDailyWallpaperEnabled: false,
  setDailyWallpaperEnabled: async (enabled: boolean) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, isDailyWallpaperEnabled: enabled};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },
  dailyWallpaperMode: "Online",
  setDailyWallpaperMode: async (mode: string) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, dailyWallpaperMode: mode};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },
  dailyWallpaperSort: SortOptions.Hot,
  setDailyWallpaperSort: async (sort: SortOptions) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, dailyWallpaperSort: sort};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },

  isLowerThumbnailQualityEnabled: false,
  setLowerThumbnailQualityEnabled: async (enabled: boolean) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, isLowerThumbnailQualityEnabled: enabled};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },

  rememberSortPreferences: false,
  setRememberedSortPreferences: async (e: boolean) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, rememberSortPreferences: e};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },

  rememberSearchHistory: false,
  setRememberedSearchHistory: async (e: boolean) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, rememberSearchHistory: e};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },
}));

const getSettings = async () => {
  return (await AsyncStorage.getItem("settings").then(result => (result ? JSON.parse(result) : {}))) || {};
};
