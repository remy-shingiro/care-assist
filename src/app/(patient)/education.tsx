import { useEffect, useState } from 'react';
import { Image as NativeImage, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState, ErrorState, Loading } from '../../components/ui/State';
import { Screen } from '../../components/ui/Screen';
import { listPublishedEducation } from '../../features/education/education.service';
import type { EducationContent } from '../../types/education';

export default function PatientEducation() {
  const router = useRouter();
  const [content, setContent] = useState<EducationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    void listPublishedEducation()
      .then(setContent)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Education</Text>
        {loading ? <Loading /> : null}
        {error ? <ErrorState message="Education content could not be loaded." /> : null}
        {!loading && !error && content.length === 0 ? (
          <EmptyState message="No education content is available yet." />
        ) : null}
        {content.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => router.push(`/(patient)/education/${item.id}`)}
            style={styles.item}
          >
            {item.imageUrl ? (
              <NativeImage
                accessibilityLabel="Education thumbnail"
                source={{ uri: item.imageUrl }}
                style={styles.thumbnail}
              />
            ) : null}
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text>{item.summary}</Text>
            <View style={styles.type}>
              <Text style={styles.typeText}>{item.type === 'video' ? 'Video' : 'Article'}</Text>
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
  item: { backgroundColor: '#FFFFFF', borderRadius: 8, gap: 8, padding: 14 },
  itemTitle: { color: '#173042', fontSize: 18, fontWeight: '700' },
  type: { alignSelf: 'flex-start', backgroundColor: '#E4F0F3', borderRadius: 4, padding: 6 },
  typeText: { color: '#176B87', fontWeight: '700' },
  thumbnail: { borderRadius: 6, height: 120, width: '100%' },
});
