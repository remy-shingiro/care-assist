import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '../../../components/ui/Screen';
import { AssistantForm } from '../../../features/assistants/AssistantForm';
import { createAssistant } from '../../../features/assistants/assistants.service';
import type { AssistantInput } from '../../../features/assistants/assistants.validation';

export default function NewAssistant() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (input: AssistantInput) => {
    setSubmitting(true);
    try {
      await createAssistant(input);
      router.replace('/(manager)/assistants');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Add Assistant</Text>
      <AssistantForm onSubmit={submit} submitting={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#173042', fontSize: 28, fontWeight: '700', marginBottom: 20 },
});
