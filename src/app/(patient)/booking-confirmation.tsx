import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';

export default function BookingConfirmation() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <Text style={styles.title}>Request submitted</Text>
      <Text style={styles.message}>Your assistance request is pending manager review.</Text>
      <Text style={styles.reference}>Request reference: {id}</Text>
      <Button label="Back to home" onPress={() => router.replace('/(patient)/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#173042', fontSize: 28, fontWeight: '700', marginBottom: 16 },
  message: { color: '#526775', fontSize: 17, marginBottom: 16 },
  reference: { color: '#526775', marginBottom: 24 },
});
