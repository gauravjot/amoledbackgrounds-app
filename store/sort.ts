import {SortOptions} from "@/constants/sort_options";
import {create} from "zustand";

export interface SortStore {
  sort: SortOptions;
  setSort: (sort: SortOptions) => void;
}

export const useSortStore = create<SortStore>(set => ({
  sort: SortOptions.Hot,
  setSort: (sort: SortOptions) => set({sort}),
}));
