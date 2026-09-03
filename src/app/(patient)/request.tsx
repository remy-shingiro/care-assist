import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { TextInput } from '../../components/ui/TextInput';
import { isValidDate, isValidTimeRange } from '../../features/assistants/availability';

export default function RequestAssistance() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!isValidDate(date.trim())) {
      setError('Enter a valid date in YYYY-MM-DD format.');
      return;
    }
    if (!isValidTimeRange(startTime.trim(), endTime.trim())) {
      setError('End time must be later than start time.');
      return;
    }
    setError('');
    router.push(
      `/(patient)/assistants?date=${encodeURIComponent(date.trim())}&startTime=${encodeURIComponent(startTime.trim())}&endTime=${encodeURIComponent(endTime.trim())}`,
    );
  };

  return (
    <Screen>
      <Text style={styles.title}>Request assistance</Text>
      <Text style={styles.subtitle}>Choose a period to see assistants who are available.</Text>
      <TextInput label="Date (YYYY-MM-DD)" onChangeText={setDate} value={date} />
      <TextInput label="Start time (HH:mm)" onChangeText={setStartTime} value={startTime} />
      <TextInput label="End time (HH:mm)" onChangeText={setEndTime} value={endTime} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="View available assistants" onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#173042', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#526775', fontSize: 16, marginBottom: 28 },
  error: { color: '#B42318', marginBottom: 16 },
});
