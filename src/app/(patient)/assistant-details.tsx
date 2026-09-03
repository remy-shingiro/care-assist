import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, Loading } from '../../components/ui/State';
import { Screen } from '../../components/ui/Screen';
import { getAssistant } from '../../features/assistants/assistants.service';
import type { Assistant } from '../../types/assistant';

function typeLabel(type: Assistant['type']): string {
  return type === 'professional' ? 'Professional Assistant' : 'General Helper';
}

export default function PatientAssistantDetails() {
  const router = useRouter();
  const { id, date, startTime, endTime } = useLocalSearchParams<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  }>();
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    void getAssistant(id)
      .then(setAssistant)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (error)
    return (
      <Screen>
        <ErrorState message="Unable to load assistant details." />
      </Screen>
    );
  if (assistant === null)
    return (
      <Screen>
        <EmptyState message="Assistant record could not be found." />
      </Screen>
    );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {assistant.photoUrl ? (
          <Image source={{ uri: assistant.photoUrl }} style={styles.photo} />
        ) : null}
        <Text style={styles.title}>{assistant.fullName}</Text>
        <Text style={styles.type}>{typeLabel(assistant.type)}</Text>
        <Text style={styles.available}>
          Available for {date}, {startTime}-{endTime}
        </Text>
        <Text style={styles.heading}>About</Text>
        <Text>{assistant.bio}</Text>
        <Text style={styles.heading}>Experience</Text>
        <Text>{assistant.experience}</Text>
        <Text style={styles.heading}>Services</Text>
        <Text>{assistant.services.join(', ')}</Text>
        <Button
          label="Request assistance with this assistant"
          onPress={() =>
            router.push(
              `/(patient)/booking-request?assistantId=${encodeURIComponent(assistant.id)}&assistantName=${encodeURIComponent(assistant.fullName)}&date=${encodeURIComponent(date)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
            )
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingBottom: 32 },
  photo: { borderRadius: 8, height: 220, width: '100%' },
  title: { color: '#173042', fontSize: 28, fontWeight: '700' },
  type: { color: '#526775', fontSize: 17 },
  available: { color: '#18794E', fontWeight: '600' },
  heading: { color: '#173042', fontSize: 19, fontWeight: '700', marginTop: 8 },
});
