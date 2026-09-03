import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/State';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../features/auth/AuthProvider';
import {
  BookingServiceError,
  createPendingBooking,
} from '../../features/bookings/bookings.service';
import { validateBookingRequest } from '../../features/bookings/bookings.validation';

export default function BookingReview() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    assistantId: string;
    assistantName: string;
    hospitalName: string;
    wardOrRoom: string;
    date: string;
    startTime: string;
    endTime: string;
    serviceDescription: string;
  }>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const input = {
      patientId: user?.uid ?? '',
      preferredAssistantId: params.assistantId ?? '',
      hospitalName: params.hospitalName ?? '',
      wardOrRoom: params.wardOrRoom || null,
      date: params.date ?? '',
      startTime: params.startTime ?? '',
      endTime: params.endTime ?? '',
      serviceDescription: params.serviceDescription ?? '',
    };
    const validationError = validateBookingRequest(input);
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const bookingId = await createPendingBooking(input);
      router.replace(`/(patient)/booking-confirmation?id=${encodeURIComponent(bookingId)}`);
    } catch (submissionError) {
      if (
        submissionError instanceof BookingServiceError &&
        submissionError.code === 'active-booking-exists'
      ) {
        setError('You already have an active assistance request.');
      } else {
        setError('Unable to submit the request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Review request</Text>
        <Text style={styles.heading}>Preferred assistant</Text>
        <Text>{params.assistantName}</Text>
        <Text style={styles.heading}>Requested period</Text>
        <Text>
          {params.date}, {params.startTime}-{params.endTime}
        </Text>
        <Text style={styles.heading}>Service location</Text>
        <Text>
          {params.hospitalName}
          {params.wardOrRoom ? `, ${params.wardOrRoom}` : ''}
        </Text>
        <Text style={styles.heading}>Support needed</Text>
        <Text>{params.serviceDescription}</Text>
        {error ? <ErrorState message={error} /> : null}
        <Button
          disabled={submitting}
          label={submitting ? 'Submitting...' : 'Submit request'}
          onPress={() => void submit()}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', paddingBottom: 32 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700', marginBottom: 20 },
  heading: { color: '#173042', fontSize: 17, fontWeight: '700', marginTop: 16 },
});
