import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ErrorState, Loading } from '../../components/ui/State';
import { Screen } from '../../components/ui/Screen';
import { isAssistantAvailable } from '../../features/assistants/availability';
import { listAssistants } from '../../features/assistants/assistants.service';
import type { Assistant, AssistantType } from '../../types/assistant';

function typeLabel(type: AssistantType): string {
  return type === 'professional' ? 'Professional Assistant' : 'General Helper';
}

export default function AvailableAssistants() {
  const router = useRouter();
  const { date, startTime, endTime } = useLocalSearchParams<{
    date: string;
    startTime: string;
    endTime: string;
  }>();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [filter, setFilter] = useState<AssistantType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    void listAssistants(true)
      .then((items) =>
        setAssistants(
          items.filter((assistant) => isAssistantAvailable(assistant, date, startTime, endTime)),
        ),
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [date, endTime, startTime]);

  const visibleAssistants =
    filter === 'all' ? assistants : assistants.filter((assistant) => assistant.type === filter);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Available assistants</Text>
        <Text style={styles.period}>
          {date} | {startTime}-{endTime}
        </Text>
        <View style={styles.filters}>
          <Pressable
            onPress={() => setFilter('all')}
            style={filter === 'all' ? styles.selected : styles.filter}
          >
            <Text>All</Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('professional')}
            style={filter === 'professional' ? styles.selected : styles.filter}
          >
            <Text>Professional Assistant</Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('general')}
            style={filter === 'general' ? styles.selected : styles.filter}
          >
            <Text>General Helper</Text>
          </Pressable>
        </View>
        {loading ? <Loading /> : null}
        {error ? <ErrorState message="Unable to load available assistants." /> : null}
        {!loading && !error && visibleAssistants.length === 0 ? (
          <EmptyState message="No assistants are available for this period." />
        ) : null}
        {visibleAssistants.map((assistant) => (
          <Pressable
            accessibilityRole="button"
            key={assistant.id}
            onPress={() =>
              router.push(
                `/(patient)/assistant-details?id=${encodeURIComponent(assistant.id)}&date=${encodeURIComponent(date)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
              )
            }
            style={styles.item}
          >
            {assistant.photoUrl ? (
              <Image source={{ uri: assistant.photoUrl }} style={styles.photo} />
            ) : null}
            <View>
              <Text style={styles.name}>{assistant.fullName}</Text>
              <Text>{typeLabel(assistant.type)}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 32 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700' },
  period: { color: '#526775' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { borderColor: '#B6C6D1', borderRadius: 8, borderWidth: 1, padding: 10 },
  selected: {
    backgroundColor: '#D8EEF2',
    borderColor: '#176B87',
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  item: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 12,
  },
  photo: { borderRadius: 32, height: 64, marginRight: 12, width: 64 },
  name: { color: '#173042', fontSize: 18, fontWeight: '700' },
});
