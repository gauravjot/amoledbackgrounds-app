import {Tabs} from "expo-router";
import React, {useEffect, useState} from "react";
import {FolderDown, Home, LucideIcon, Search, Settings} from "lucide-react-native";
import {View} from "react-native";
import {Button, ButtonText} from "@/components/ui/Button";
import {NavigationHelpers, ParamListBase, TabNavigationState} from "@react-navigation/native";

export default function TabLayout() {
  return (
    <View className="flex-1 bg-background">
      <Tabs
        tabBar={props => <TapBar state={props.state} descriptors={props.descriptors} navigation={props.navigation} />}
        screenOptions={{
          headerShown: false,
        }}></Tabs>
    </View>
  );
}

function TapBar({
  state,
  descriptors,
  navigation,
}: {
  state: TabNavigationState<ParamListBase>;
  descriptors: any;
  navigation: NavigationHelpers<ParamListBase, any>;
}) {
  const dataMap: {
    [key: string]: {name: string; Icon: LucideIcon; sort: number};
  } = {
    index: {
      name: "Home",
      Icon: Home,
      sort: 0,
    },
    search: {
      name: "Search",
      Icon: Search,
      sort: 1,
    },
    downloads: {
      name: "Downloads",
      Icon: FolderDown,
      sort: 2,
    },
    settings: {
      name: "Settings",
      Icon: Settings,
      sort: 3,
    },
  };

  const [tabs, setTabs] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    setTabs([]);
    let tabList: {Tab: React.JSX.Element; label: string}[] = [];
    for (let index = 0; index < state.routes.length; index++) {
      const route = state.routes[index];
      const {options} = descriptors[route.key];
      const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;

      const isFocused = state.index === index;

      const onPress = () => {
        const event = navigation.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused) {
          navigation.navigate(route.name);
        }
      };
      const name = dataMap[label].name;
      const Icon = dataMap[label].Icon;
      const TabBtn = (
        <Button key={index} variant={"ghost"} className="items-center justify-center flex-1 px-1 h-16 gap-0.5" flex={"column"} onPress={onPress}>
          <Icon size={24} color={isFocused ? "white" : "gray"} />
          <ButtonText size={"sm"} numberOfLines={1} className={(isFocused ? "text-foreground" : "text-zinc-500") + " font-medium"}>
            {name}
          </ButtonText>
        </Button>
      );
      tabList.push({Tab: TabBtn, label: label});
    }
    // Sort
    tabList.sort((a, b) => {
      return dataMap[a.label].sort - dataMap[b.label].sort;
    });
    setTabs(tabList.map(s => s.Tab));
  }, [state]);

  return (
    <View className="flex flex-row gap-1 px-4 bg-opacity-80 bg-background backdrop-blur">
      {tabs.map(tab => {
        return tab;
      })}
    </View>
  );
}
