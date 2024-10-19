import { Text } from "@/components/ui/Text";
import { Link, Stack } from "expo-router";
import { View } from "react-native";

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />
			<View className="flex-1 h-screen bg-background">
				<Text>This screen doesn't exist.</Text>
				<Link href="/" className="text-accent">
					<Text>Go to home screen!</Text>
				</Link>
			</View>
		</>
	);
}
