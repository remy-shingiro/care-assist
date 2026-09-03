import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState, Loading } from '../../../components/ui/State';
import { Screen } from '../../../components/ui/Screen';
import { listAssistants } from '../../../features/assistants/assistants.service';
import { isAssistantAvailable } from '../../../features/assistants/availability';
import {
  confirmBooking,
  getBooking,
  getPatientContact,
  rejectBooking,
} from '../../../features/bookings/bookings.service';
import type { Assistant } from '../../../types/assistant';
import type { Booking } from '../../../types/booking';

export default function ManagerRequestDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [patientContact, setPatientContact] = useState<{ fullName: string; phone: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    void Promise.all([getBooking(id), listAssistants(true)])
      .then(async ([nextBooking, nextAssistants]) => {
        setBooking(nextBooking);
        if (nextBooking !== null) setPatientContact(await getPatientContact(nextBooking.patientId));
        setAssistants(
          nextAssistants.filter((assistant) =>
            nextBooking
              ? isAssistantAvailable(
                  assistant,
                  nextBooking.date,
                  nextBooking.startTime,
                  nextBooking.endTime,
                )
              : false,
          ),
        );
      })
      .catch(() => setError('Unable to load this request.'))
      .finally(() => setLoading(false));
  }, [id]);

  const reject = async () => {
    if (!id || !booking || booking.status !== 'PENDING') return;
    setSubmitting(true);
    setError('');
    try {
      await rejectBooking(id);
      router.replace('/(manager)/requests');
    } catch {
      setError('Unable to reject this request.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirm = async (assistantId: string) => {
    if (!id || !booking || booking.status !== 'PENDING') return;
    setSubmitting(true);
    setError('');
    try {
      await confirmBooking(id, assistantId);
      router.replace('/(manager)/requests');
    } catch (confirmationError) {
      setError(
        confirmationError instanceof Error
          ? confirmationError.message
          : 'Unable to confirm this request.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (booking === null)
    return (
      <Screen>
        <ErrorState message={error || 'Request not found.'} />
      </Screen>
    );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Review request</Text>
        <Text style={styles.status}>{booking.status}</Text>
        <Text style={styles.heading}>Patient contact</Text>
        <Text>{patientContact?.fullName ?? 'Patient'}</Text>
        <Text>Phone: {patientContact?.phone ?? 'Unavailable'}</Text>
        <Text style={styles.heading}>Requested period</Text>
        <Text>
          {booking.date} | {booking.startTime}-{booking.endTime}
        </Text>
        <Text style={styles.heading}>Location</Text>
        <Text>
          {booking.hospitalName}
          {booking.wardOrRoom ? `, ${booking.wardOrRoom}` : ''}
        </Text>
        <Text style={styles.heading}>Support needed</Text>
        <Text>{booking.serviceDescription}</Text>
        <Text style={styles.heading}>Available assistants</Text>
        {assistants.length === 0 ? (
          <EmptyState message="No active assistants are available for this period." />
        ) : (
          assistants.map((assistant) => (
            <View key={assistant.id} style={styles.assistant}>
              <Text style={styles.assistantName}>{assistant.fullName}</Text>
              <Button
                disabled={submitting}
                label="Confirm and assign"
                onPress={() => void confirm(assistant.id)}
              />
            </View>
          ))
        )}
        {error ? <ErrorState message={error} /> : null}
        <Button disabled={submitting} label="Reject request" onPress={() => void reject()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingBottom: 32 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700' },
  status: { color: '#A15C00', fontWeight: '700' },
  heading: { color: '#173042', fontSize: 17, fontWeight: '700', marginTop: 8 },
  assistant: { backgroundColor: '#FFFFFF', borderRadius: 8, gap: 10, padding: 12 },
  assistantName: { color: '#173042', fontSize: 18, fontWeight: '700' },
});
