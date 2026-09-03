import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../features/auth/AuthProvider';

export default function ManagerDashboard() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  return (
    <Screen>
      <Text>Manager dashboard</Text>
      <Text>Welcome, {profile?.fullName}</Text>
      <Button label="Assistants" onPress={() => router.push('/(manager)/assistants')} />
      <Button label="Sign out" onPress={() => void signOut()} />
    </Screen>
  );
}
