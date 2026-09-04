import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ErrorState, Loading } from '../../../components/ui/State';
import { Screen } from '../../../components/ui/Screen';
import { getEducationContent } from '../../../features/education/education.service';
import type { EducationContent } from '../../../types/education';
import { EducationEditor } from './new';

export default function EditManagerEducation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [content, setContent] = useState<EducationContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    void getEducationContent(id)
      .then(setContent)
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
        <ErrorState message={error || 'Education content was not found.'} />
      </Screen>
    );
  }

  return (
    <EducationEditor
      contentId={content.id}
      initial={content}
      onSaved={() => router.replace('/(manager)/education')}
    />
  );
}
