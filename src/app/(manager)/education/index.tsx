import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState, Loading } from '../../../components/ui/State';
import { Screen } from '../../../components/ui/Screen';
import {
  deleteEducationContent,
  listAllEducation,
} from '../../../features/education/education.service';
import type { EducationContent } from '../../../types/education';

export default function ManagerEducation() {
  const router = useRouter();
  const [content, setContent] = useState<EducationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    void listAllEducation()
      .then(setContent)
      .catch(() => setError('Education content could not be loaded.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id: string) => {
    setError('');
    try {
      await deleteEducationContent(id);
      load();
    } catch {
      setError('Education content could not be deleted.');
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Education</Text>
        <Button label="Create education" onPress={() => router.push('/(manager)/education/new')} />
        {loading ? <Loading /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && content.length === 0 ? (
          <EmptyState message="No education content yet." />
        ) : null}
        {content.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text>{item.type === 'video' ? 'Video' : 'Article'}</Text>
            <Text style={item.published ? styles.published : styles.draft}>
              {item.published ? 'Published' : 'Draft'}
            </Text>
            <Button label="Edit" onPress={() => router.push(`/(manager)/education/${item.id}`)} />
            <Button label="Delete" onPress={() => void remove(item.id)} />
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
  itemTitle: { color: '#173042', fontSize: 18, fontWeight: '700' },
  published: { color: '#26734D', fontWeight: '700' },
  draft: { color: '#A15C00', fontWeight: '700' },
});
