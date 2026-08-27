import { Link } from 'expo-router';
import { Text } from 'react-native';

import { Screen } from '../../components/ui/Screen';

export default function Register() {
  return (
    <Screen>
      <Text>Registration placeholder</Text>
      <Link href="/(auth)/login">Back to login</Link>
    </Screen>
  );
}
