import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState, ErrorState, Loading } from '../../components/ui/State';
import { Screen } from '../../components/ui/Screen';
import { listBookings } from '../../features/bookings/bookings.service';
import type { Booking } from '../../types/booking';

export default function ManagerRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    void listBookings('PENDING')
      .then(setRequests)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pending requests</Text>
        {loading ? <Loading /> : null}
        {error ? <ErrorState message="Unable to load pending requests." /> : null}
        {!loading && !error && requests.length === 0 ? (
          <EmptyState message="No pending requests." />
        ) : null}
        {requests.map((request) => (
          <Pressable
            accessibilityRole="button"
            key={request.id}
            onPress={() => router.push(`/(manager)/request/${request.id}`)}
            style={styles.item}
          >
            <Text style={styles.name}>{request.hospitalName}</Text>
            <Text>
              {request.date} | {request.startTime}-{request.endTime}
            </Text>
            <Text>{request.serviceDescription}</Text>
            <Text style={styles.status}>PENDING</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 32 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700' },
  item: { backgroundColor: '#FFFFFF', borderRadius: 8, gap: 6, padding: 14 },
  name: { color: '#173042', fontSize: 18, fontWeight: '700' },
  status: { color: '#A15C00', fontWeight: '700' },
});
