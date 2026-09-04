import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { ErrorState, Loading } from '../../components/ui/State';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../features/auth/AuthProvider';
import {
  BookingServiceError,
  cancelBookingAsPatient,
  completeBooking,
  listPatientBookings,
  startBooking,
} from '../../features/bookings/bookings.service';
import type { Booking } from '../../types/booking';

export default function PatientBookings() {
  return (
    <Screen>
      <PatientBookingList />
    </Screen>
  );
}

function PatientBookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    if (!user) return;
    setLoading(true);
    void listPatientBookings(user.uid)
      .then(setBookings)
      .catch(() => setError('Unable to load your bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const runAction = async (booking: Booking, action: () => Promise<void>) => {
    setSubmitting(booking.id);
    setError('');
    try {
      await action();
      load();
    } catch (actionError) {
      setError(
        actionError instanceof BookingServiceError
          ? actionError.message
          : 'Unable to update this booking.',
      );
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your bookings</Text>
      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && bookings.length === 0 ? <Text>No bookings yet.</Text> : null}
      {bookings.map((booking) => (
        <View key={booking.id} style={styles.item}>
          <Text style={styles.name}>{booking.hospitalName}</Text>
          <Text>
            {booking.date} | {booking.startTime}-{booking.endTime}
          </Text>
          <Text>{booking.serviceDescription}</Text>
          <Text style={styles.status}>{booking.status}</Text>
          {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
            <Button
              disabled={submitting !== null}
              label="Cancel booking"
              onPress={() => void runAction(booking, () => cancelBookingAsPatient(booking.id))}
            />
          ) : null}
          {booking.status === 'CONFIRMED' ? (
            <Button
              disabled={submitting !== null}
              label="Start / Use"
              onPress={() => void runAction(booking, () => startBooking(booking.id))}
            />
          ) : null}
          {booking.status === 'IN_PROGRESS' ? (
            <Button
              disabled={submitting !== null}
              label="Complete booking"
              onPress={() => void runAction(booking, () => completeBooking(booking.id))}
            />
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 32 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700' },
  item: { backgroundColor: '#FFFFFF', borderRadius: 8, gap: 8, padding: 14 },
  name: { color: '#173042', fontSize: 18, fontWeight: '700' },
  status: { color: '#A15C00', fontWeight: '700' },
});
