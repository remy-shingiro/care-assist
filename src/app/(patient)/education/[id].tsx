import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ErrorState, Loading } from '../../../components/ui/State';
import { Screen } from '../../../components/ui/Screen';
import { getEducationContent } from '../../../features/education/education.service';
import type { EducationContent } from '../../../types/education';

export default function PatientEducationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [content, setContent] = useState<EducationContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    void getEducationContent(id)
      .then((item) => {
        if (item === null || !item.published) {
          setError('This education item is no longer available.');
          return;
        }
        setContent(item);
      })
      .catch(() => setError('Education content could not be loaded.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }
  if (content === null) {
    return (
      <Screen>
        <ErrorState message={error || 'This education item is no longer available.'} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.summary}>{content.summary}</Text>
        {content.imageUrl ? (
          <Image
            accessibilityLabel="Education"
            source={{ uri: content.imageUrl }}
            style={styles.image}
          />
        ) : null}
        <Text style={styles.body}>{content.body}</Text>
        {content.videoUrl ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void Linking.openURL(content.videoUrl!)}
            style={styles.videoButton}
          >
            <Text style={styles.videoLabel}>Open video</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 32 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700' },
  summary: { color: '#526775', fontSize: 17 },
  body: { color: '#253746', fontSize: 16, lineHeight: 24 },
  image: { borderRadius: 8, height: 220, width: '100%' },
  videoButton: {
    alignItems: 'center',
    backgroundColor: '#176B87',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  videoLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
