import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../features/auth/AuthProvider';

export default function PatientHome() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  return (
    <Screen>
      <Text>Welcome, {profile?.fullName}</Text>
      <Button label="Request assistance" onPress={() => router.push('/(patient)/request')} />
      <Button label="Sign out" onPress={() => void signOut()} />
    </Screen>
  );
}
