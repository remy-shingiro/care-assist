import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/State';
import { Screen } from '../../../components/ui/Screen';
import { TextInput } from '../../../components/ui/TextInput';
import {
  createEducationContent,
  updateEducationContent,
} from '../../../features/education/education.service';
import type { EducationContentType } from '../../../types/education';
import { validateEducationContent } from '../../../features/education/education.validation';

export default function NewManagerEducation() {
  const router = useRouter();
  return <EducationEditor onSaved={() => router.replace('/(manager)/education')} />;
}

export function EducationEditor({
  contentId,
  initial,
  onSaved,
}: {
  readonly contentId?: string;
  readonly initial?: {
    readonly title: string;
    readonly summary: string;
    readonly body: string;
    readonly type: EducationContentType;
    readonly imageUrl: string | null;
    readonly videoUrl: string | null;
    readonly published: boolean;
  };
  readonly onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [type, setType] = useState<EducationContentType>(initial?.type ?? 'article');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? '');
  const [published, setPublished] = useState(initial?.published ?? false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    const input = {
      title,
      summary,
      body,
      type,
      imageUrl: imageUrl.trim() || null,
      videoUrl: videoUrl.trim() || null,
      published,
    };
    const validationError = validateEducationContent(input);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (contentId) {
        await updateEducationContent(contentId, input);
      } else {
        await createEducationContent(input);
      }
      onSaved();
    } catch {
      setError('Education content could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>New education</Text>
        <TextInput label="Title" value={title} onChangeText={setTitle} />
        <TextInput label="Summary" value={summary} onChangeText={setSummary} multiline />
        <TextInput label="Body" value={body} onChangeText={setBody} multiline />
        <Text style={styles.label}>Content type</Text>
        <Button
          label={type === 'article' ? 'Article (selected)' : 'Use article'}
          onPress={() => setType('article')}
        />
        <Button
          label={type === 'video' ? 'Video (selected)' : 'Use video'}
          onPress={() => setType('video')}
        />
        <TextInput
          label="Image URL (optional)"
          value={imageUrl}
          onChangeText={setImageUrl}
          autoCapitalize="none"
        />
        <TextInput
          label="Video URL"
          value={videoUrl}
          onChangeText={setVideoUrl}
          autoCapitalize="none"
        />
        <Button
          label={published ? 'Unpublish' : 'Publish'}
          onPress={() => setPublished(!published)}
        />
        {error ? <ErrorState message={error} /> : null}
        <Button
          disabled={submitting}
          label={submitting ? 'Saving...' : 'Save education'}
          onPress={() => void save()}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingBottom: 32 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  label: { color: '#253746', fontSize: 15, fontWeight: '600', marginTop: 8 },
});
