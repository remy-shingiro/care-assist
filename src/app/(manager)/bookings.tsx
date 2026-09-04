import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { ErrorState, Loading } from '../../components/ui/State';
import { Screen } from '../../components/ui/Screen';
import {
  BookingServiceError,
  cancelBookingAsManager,
  listBookings,
} from '../../features/bookings/bookings.service';
import type { Booking } from '../../types/booking';

export default function ManagerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    void listBookings()
      .then(setBookings)
      .catch(() => setError('Unable to load bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const cancel = async (booking: Booking) => {
    setSubmitting(booking.id);
    setError('');
    try {
      await cancelBookingAsManager(booking.id);
      load();
    } catch (cancelError) {
      setError(
        cancelError instanceof BookingServiceError
          ? cancelError.message
          : 'Unable to cancel this booking.',
      );
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Bookings</Text>
        {loading ? <Loading /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && bookings.length === 0 ? <Text>No bookings yet.</Text> : null}
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.item}>
            <Text style={styles.name}>{booking.hospitalName}</Text>
            <Text>Patient: {booking.patientId}</Text>
            <Text>
              {booking.date} | {booking.startTime}-{booking.endTime}
            </Text>
            <Text>{booking.serviceDescription}</Text>
            <Text style={styles.status}>{booking.status}</Text>
            {booking.status === 'CONFIRMED' ? (
              <Button
                disabled={submitting !== null}
                label="Cancel booking"
                onPress={() => void cancel(booking)}
              />
            ) : null}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 32 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700' },
  item: { backgroundColor: '#FFFFFF', borderRadius: 8, gap: 8, padding: 14 },
  name: { color: '#173042', fontSize: 18, fontWeight: '700' },
  status: { color: '#A15C00', fontWeight: '700' },
});
