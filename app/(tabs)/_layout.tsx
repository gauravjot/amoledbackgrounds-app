import {Tabs} from "expo-router";
import React from "react";
import {FolderDown, Home, LucideIcon, Search, Settings} from "lucide-react-native";
import {View} from "react-native";
import {Button, ButtonText} from "@/components/ui/Button";
import {NavigationHelpers, ParamListBase, TabNavigationState} from "@react-navigation/native";
import {LinearGradient} from "expo-linear-gradient";

const TABS: {
  [key: string]: {name: string; Icon: LucideIcon; sort: number};
} = {
  index: {name: "Home", Icon: Home, sort: 0},
  search: {name: "Search", Icon: Search, sort: 1},
  downloaded: {name: "Downloads", Icon: FolderDown, sort: 2},
  settings: {name: "Settings", Icon: Settings, sort: 3},
};

export default function TabLayout() {
  return (
    <View className="flex-1 bg-background">
      <Tabs
        tabBar={props => <TabBar state={props.state} descriptors={props.descriptors} navigation={props.navigation} />}
        screenOptions={{
          headerShown: false,
        }}></Tabs>
    </View>
  );
}

function TabBar({
  state,
  descriptors,
  navigation,
}: {
  state: TabNavigationState<ParamListBase>;
  descriptors: any;
  navigation: NavigationHelpers<ParamListBase, any>;
}) {
  const [tabs, setTabs] = React.useState<React.JSX.Element[]>([]);

  // Produce JSX for the tabs
  React.useEffect(() => {
    setTabs([]);
    let tabList: {Tab: React.JSX.Element; label: string}[] = [];
    for (let index = 0; index < state.routes.length; index++) {
      const route = state.routes[index];
      const {options} = descriptors[route.key];
      const label =
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

      const isFocused = state.index === index;

      const onPress = () => {
        navigation.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        });
        if (!isFocused) {
          navigation.navigate(route.name);
        }
      };

      const Icon = TABS[label].Icon;
      const TabBtn = (
        <Button
          key={index}
          variant={"ghost"}
          className="items-center justify-center flex-1 px-1 h-16 gap-0.5"
          flex={"column"}
          onPress={onPress}>
          <Icon size={24} color={isFocused ? "white" : "gray"} />
          <ButtonText
            size={"sm"}
            numberOfLines={1}
            className={(isFocused ? "text-foreground" : "text-zinc-500") + " font-medium"}>
            {TABS[label].name}
          </ButtonText>
        </Button>
      );
      tabList.push({Tab: TabBtn, label: label});
    }
    // Sort
    tabList.sort((a, b) => {
      return TABS[a.label].sort - TABS[b.label].sort;
    });
    setTabs(tabList.map(s => s.Tab));
  }, [state]);

  return (
    <>
      <LinearGradient colors={["rgba(0,0,0,0.25)", "black"]} className="absolute bottom-0 left-0 right-0 ">
        <View className="flex flex-row h-16 gap-1 px-4 bg-background/80">
          {tabs.map(tab => {
            return tab;
          })}
        </View>
      </LinearGradient>
    </>
  );
}
