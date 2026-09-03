import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, Loading } from '../../components/ui/State';
import { Screen } from '../../components/ui/Screen';
import { listAssistants } from '../../features/assistants/assistants.service';
import type { Assistant } from '../../types/assistant';

function typeLabel(type: Assistant['type']): string {
  return type === 'professional' ? 'Professional Assistant' : 'General Helper';
}

export default function ManagerAssistants() {
  const router = useRouter();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    void listAssistants()
      .then(setAssistants)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Assistants</Text>
        <Button label="Add Assistant" onPress={() => router.push('/(manager)/assistant/new')} />
        {loading ? <Loading /> : null}
        {error ? <ErrorState message="Unable to load assistants." /> : null}
        {!loading && !error && assistants.length === 0 ? (
          <EmptyState message="No assistants have been added yet." />
        ) : null}
        {assistants.map((assistant) => (
          <Pressable
            accessibilityRole="button"
            key={assistant.id}
            onPress={() => router.push(`/(manager)/assistant/${assistant.id}`)}
            style={styles.item}
          >
            {assistant.photoUrl ? (
              <Image source={{ uri: assistant.photoUrl }} style={styles.photo} />
            ) : null}
            <View style={styles.itemText}>
              <Text style={styles.name}>{assistant.fullName}</Text>
              <Text>{typeLabel(assistant.type)}</Text>
              <Text style={assistant.active ? styles.active : styles.inactive}>
                {assistant.active ? 'Active' : 'Inactive'}
              </Text>
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
  item: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 12,
  },
  photo: { borderRadius: 32, height: 64, marginRight: 12, width: 64 },
  itemText: { gap: 4 },
  name: { color: '#173042', fontSize: 18, fontWeight: '700' },
  active: { color: '#18794E', fontWeight: '600' },
  inactive: { color: '#A12622', fontWeight: '600' },
});
