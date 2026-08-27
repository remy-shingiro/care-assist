import { Link } from 'expo-router';
import { Text } from 'react-native';

import { Screen } from '../../components/ui/Screen';

export default function Login() {
  return (
    <Screen>
      <Text>Login placeholder</Text>
      <Link href="/(auth)/register">Create an account</Link>
    </Screen>
  );
}
