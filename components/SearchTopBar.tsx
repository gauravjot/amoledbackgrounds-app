import * as React from "react";
import TopBar from "./ui/TopBar";
import {Search, View} from "lucide-react-native";
import useDebounce from "@/hooks/useDebounce";
import {TextInput} from "react-native";
import {Text} from "./ui/Text";
import {Input} from "./ui/Input";

export default function SearchTopBar({
  onQueryChanged,
}: {
  hide?: boolean;
  showLoader?: boolean;
  onQueryChanged: (query: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 1000);

  React.useEffect(() => {
    onQueryChanged(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <View className="bg-red-500">
      <Input className="absolute top-0 left-0 right-0 h-16 bg-teal-500 -bottom-2" />
    </View>
  );
}
