import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import type { Assistant, AssistantType } from '../../types/assistant';
import { parseServices, validateAssistantInput } from './assistants.validation';

interface AssistantFormProps {
  readonly assistant?: Assistant;
  readonly submitting: boolean;
  readonly onSubmit: (input: {
    readonly fullName: string;
    readonly type: AssistantType;
    readonly photoUrl: string | null;
    readonly phone: string;
    readonly bio: string;
    readonly experience: string;
    readonly services: readonly string[];
  }) => Promise<void>;
}

export function AssistantForm({ assistant, submitting, onSubmit }: AssistantFormProps) {
  const [fullName, setFullName] = useState(assistant?.fullName ?? '');
  const [type, setType] = useState<AssistantType>(assistant?.type ?? 'general');
  const [photoUrl, setPhotoUrl] = useState(assistant?.photoUrl ?? '');
  const [phone, setPhone] = useState(assistant?.phone ?? '');
  const [bio, setBio] = useState(assistant?.bio ?? '');
  const [experience, setExperience] = useState(assistant?.experience ?? '');
  const [services, setServices] = useState(assistant?.services.join(', ') ?? '');
  const [error, setError] = useState('');

  const submit = async () => {
    const input = {
      fullName,
      type,
      photoUrl: photoUrl.trim() ? photoUrl.trim() : null,
      phone,
      bio,
      experience,
      services: parseServices(services),
    };
    const validationError = validateAssistantInput(input);
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    setError('');
    try {
      await onSubmit(input);
    } catch {
      setError(assistant ? 'Unable to update this assistant.' : 'Unable to create this assistant.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput label="Full name" onChangeText={setFullName} value={fullName} />
      <Text style={styles.label}>Assistant type</Text>
      <View style={styles.typeRow}>
        <Button
          disabled={submitting}
          label="Professional Assistant"
          onPress={() => setType('professional')}
        />
        <Button disabled={submitting} label="General Helper" onPress={() => setType('general')} />
      </View>
      <Text style={styles.selectedType}>
        Selected: {type === 'professional' ? 'Professional Assistant' : 'General Helper'}
      </Text>
      <TextInput label="Phone" onChangeText={setPhone} value={phone} />
      <TextInput label="Bio" multiline onChangeText={setBio} value={bio} />
      <TextInput label="Experience" multiline onChangeText={setExperience} value={experience} />
      <TextInput
        label="Services"
        onChangeText={setServices}
        placeholder="Companionship, errands, transport support"
        value={services}
      />
      <TextInput
        label="Photo URL (optional)"
        autoCapitalize="none"
        onChangeText={setPhotoUrl}
        placeholder="https://..."
        value={photoUrl}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        disabled={submitting}
        label={submitting ? 'Saving...' : assistant ? 'Save changes' : 'Add assistant'}
        onPress={() => void submit()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  label: { color: '#253746', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  typeRow: { gap: 8, marginBottom: 8 },
  selectedType: { color: '#526775', marginBottom: 16 },
  error: { color: '#B42318', marginBottom: 16 },
});
