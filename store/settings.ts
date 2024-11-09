import {SEARCH_HISTORY_LIMIT} from "@/appconfig";
import {SortOptions} from "@/constants/sort_options";
import generateUUID from "@/lib/utils/uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {create} from "zustand";

export interface SettingsStore {
  initialize: () => Promise<void>;
  deviceIdentifier: string;
  downloadDir: string | null;
  setDownloadDir: (dir: string | null) => void;
  homeSort: SortOptions;
  setHomeSort: (sort: SortOptions) => void;
  downloadedScreenSort: "Old to New" | "New to Old";
  setDownloadedScreenSort: (sort: "Old to New" | "New to Old") => void;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  isDailyWallpaperEnabled: boolean;
  setDailyWallpaperEnabled: (enabled: boolean) => void;
  dailyWallpaperMode: "online" | "downloaded";
  setDailyWallpaperMode: (mode: "online" | "downloaded") => void;
  dailyWallpaperSort: SortOptions;
  setDailyWallpaperSort: (sort: SortOptions) => void;
  isLowerThumbnailQualityEnabled: boolean;
  setLowerThumbnailQualityEnabled: (enabled: boolean) => void;
  rememberSortPreferences: boolean;
  setRememberedSortPreferences: (e: boolean) => void;
  rememberSearchHistory: boolean;
  setRememberedSearchHistory: (e: boolean) => void;

  // Error Logs
  sendErrorLogsEnabled: boolean;
  setSendErrorLogsEnabled: (e: boolean) => void;
  logsLastSent: string | null;
  setLogsLastSent: (date: Date | null) => void;

  // Privacy Policy
  IsPrivacyPolicyAccepted: boolean;
  setPrivacyPolicyAccepted: (accepted: boolean) => void;
  PrivacyPolicyAcceptedVersion: string | null;
  setPrivacyPolicyAcceptedVersion: (version: string | null) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  initialize: async () => {
    const settings = await getSettings();
    let device_identifier = settings.deviceIdentifier;
    if (settings.deviceIdentifier === null || settings.deviceIdentifier === undefined) {
      // Generate a new device identifier
      device_identifier = generateUUID();
      const newSettings = {...settings, deviceIdentifier: device_identifier};
      await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    }
    set({
      deviceIdentifier: device_identifier,
      downloadDir: settings.downloadDir,
      homeSort: settings.homeSort || SortOptions.Hot,
      downloadedScreenSort: settings.downloadedScreenSort || "Old to New",
      searchHistory: settings.searchHistory || [],
      isDailyWallpaperEnabled: settings.isDailyWallpaperEnabled || false,
      dailyWallpaperMode: settings.dailyWallpaperMode || "online",
      dailyWallpaperSort: settings.dailyWallpaperSort || SortOptions.Hot,
      isLowerThumbnailQualityEnabled: settings.isLowerThumbnailQualityEnabled || false,
      rememberSortPreferences: settings.rememberSortPreferences || false,
      rememberSearchHistory: settings.rememberSearchHistory || true,
      sendErrorLogsEnabled: settings.sendErrorLogsEnabled || true,
      logsLastSent: settings.logsLastSent || null,
      IsPrivacyPolicyAccepted: settings.IsPrivacyPolicyAccepted || false,
      PrivacyPolicyAcceptedVersion: settings.PrivacyPolicyAcceptedVersion || null,
    });
  },

  deviceIdentifier: "",

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

  downloadedScreenSort: "Old to New",
  setDownloadedScreenSort: async (sort: string) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, downloadedScreenSort: sort};
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
  dailyWallpaperMode: "online",
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

  sendErrorLogsEnabled: true,
  setSendErrorLogsEnabled: async (e: boolean) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, sendErrorLogsEnabled: e};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },
  logsLastSent: null,
  setLogsLastSent: async (date: Date | null) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, logsLastSent: date ? date.toISOString().toString() : null};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },

  IsPrivacyPolicyAccepted: false,
  setPrivacyPolicyAccepted: async (e: boolean) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, IsPrivacyPolicyAccepted: e};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },
  PrivacyPolicyAcceptedVersion: null,
  setPrivacyPolicyAcceptedVersion: async (version: string | null) => {
    const currentSettings = await getSettings();
    const newSettings = {...currentSettings, PrivacyPolicyAcceptedVersion: version};
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    set(newSettings);
  },
}));

const getSettings = async () => {
  return (await AsyncStorage.getItem("settings").then(result => (result ? JSON.parse(result) : {}))) || {};
};
