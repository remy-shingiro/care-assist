import { Link } from 'expo-router';
import { Text } from 'react-native';

import { Screen } from '../../components/ui/Screen';

export default function Welcome() {
  return (
    <Screen>
      <Text>Care Assist</Text>
      <Link href="/(auth)/login">Continue to login</Link>
    </Screen>
  );
}
