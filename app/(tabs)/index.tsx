import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button, ButtonText } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function HomeScreen() {
  return (
      <View>
        <Text>Welcome!</Text>
        <Text>Some Text</Text>
        <Button variant={"accent"}>
          <ButtonText>Click me!</ButtonText>
        </Button>
        <Input/>
      </View>
  );
}
