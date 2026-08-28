import { Text } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../features/auth/AuthProvider';

export default function PatientHome() {
  const { profile, signOut } = useAuth();

  return (
    <Screen>
      <Text>Welcome, {profile?.fullName}</Text>
      <Button label="Sign out" onPress={() => void signOut()} />
    </Screen>
  );
}
