import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { TextInput } from '../../components/ui/TextInput';
import { useAuth } from '../../features/auth/AuthProvider';
import { validateBookingRequest } from '../../features/bookings/bookings.validation';

export default function BookingRequest() {
  const router = useRouter();
  const { user } = useAuth();
  const { assistantId, assistantName, date, startTime, endTime } = useLocalSearchParams<{
    assistantId: string;
    assistantName: string;
    date: string;
    startTime: string;
    endTime: string;
  }>();
  const [hospitalName, setHospitalName] = useState('');
  const [wardOrRoom, setWardOrRoom] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const input = {
      patientId: user?.uid ?? '',
      preferredAssistantId: assistantId ?? '',
      hospitalName: hospitalName.trim(),
      wardOrRoom: wardOrRoom.trim() || null,
      date: date ?? '',
      startTime: startTime ?? '',
      endTime: endTime ?? '',
      serviceDescription: serviceDescription.trim(),
    };
    const validationError = validateBookingRequest(input);
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    router.push(
      `/(patient)/booking-review?assistantId=${encodeURIComponent(input.preferredAssistantId)}&assistantName=${encodeURIComponent(assistantName ?? '')}&hospitalName=${encodeURIComponent(input.hospitalName)}&wardOrRoom=${encodeURIComponent(input.wardOrRoom ?? '')}&date=${encodeURIComponent(input.date)}&startTime=${encodeURIComponent(input.startTime)}&endTime=${encodeURIComponent(input.endTime)}&serviceDescription=${encodeURIComponent(input.serviceDescription)}`,
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Request assistance</Text>
        <Text style={styles.selected}>Preferred assistant: {assistantName}</Text>
        <Text style={styles.selected}>
          Requested period: {date}, {startTime}-{endTime}
        </Text>
        <TextInput label="Service location" onChangeText={setHospitalName} value={hospitalName} />
        <TextInput
          label="Ward or room (optional)"
          onChangeText={setWardOrRoom}
          value={wardOrRoom}
        />
        <TextInput
          label="Support needed"
          multiline
          onChangeText={setServiceDescription}
          value={serviceDescription}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Review request" onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', paddingBottom: 32 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700', marginBottom: 16 },
  selected: { color: '#526775', marginBottom: 8 },
  error: { color: '#B42318', marginBottom: 16 },
});
