import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState, Loading } from '../../../components/ui/State';
import { Screen } from '../../../components/ui/Screen';
import { AssistantForm } from '../../../features/assistants/AssistantForm';
import {
  getAssistant,
  setAssistantActive,
  setUnavailablePeriods,
  updateAssistant,
} from '../../../features/assistants/assistants.service';
import { validateUnavailablePeriod } from '../../../features/assistants/assistants.validation';
import type { Assistant, UnavailablePeriod } from '../../../types/assistant';
import { TextInput } from '../../../components/ui/TextInput';

export default function EditAssistant() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [periodDate, setPeriodDate] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const loadAssistant = async () => {
    if (!id) return;
    try {
      const nextAssistant = await getAssistant(id);
      if (nextAssistant === null) setError('Assistant record could not be found.');
      setAssistant(nextAssistant);
    } catch {
      setError('Unable to load this assistant.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssistant();
  }, [id]);

  const saveAssistant = async (input: Parameters<typeof updateAssistant>[1]) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await updateAssistant(id, input);
      setAssistant(await getAssistant(id));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async () => {
    if (!assistant || !id) return;
    setSubmitting(true);
    try {
      await setAssistantActive(id, !assistant.active);
      setAssistant({ ...assistant, active: !assistant.active });
    } catch {
      setError('Unable to update assistant status.');
    } finally {
      setSubmitting(false);
    }
  };

  const addPeriod = async () => {
    if (!assistant || !id) return;
    const period = {
      date: periodDate.trim(),
      startTime: periodStart.trim(),
      endTime: periodEnd.trim(),
    };
    const validationError = validateUnavailablePeriod(period);
    if (validationError !== null) {
      setError(validationError);
      return;
    }
    const duplicate = assistant.unavailablePeriods.some(
      (item) =>
        item.date === period.date &&
        item.startTime === period.startTime &&
        item.endTime === period.endTime,
    );
    if (duplicate) {
      setError('That unavailable period already exists.');
      return;
    }

    setSubmitting(true);
    setError('');
    const nextPeriod: UnavailablePeriod = { ...period, id: `${Date.now()}` };
    try {
      await setUnavailablePeriods(id, [...assistant.unavailablePeriods, nextPeriod]);
      setAssistant({
        ...assistant,
        unavailablePeriods: [...assistant.unavailablePeriods, nextPeriod],
      });
      setPeriodDate('');
      setPeriodStart('');
      setPeriodEnd('');
    } catch {
      setError('Unable to save unavailable period.');
    } finally {
      setSubmitting(false);
    }
  };

  const removePeriod = async (periodId: string) => {
    if (!assistant || !id) return;
    const nextPeriods = assistant.unavailablePeriods.filter((period) => period.id !== periodId);
    setSubmitting(true);
    try {
      await setUnavailablePeriods(id, nextPeriods);
      setAssistant({ ...assistant, unavailablePeriods: nextPeriods });
    } catch {
      setError('Unable to remove unavailable period.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (error && assistant === null)
    return (
      <Screen>
        <ErrorState message={error} />
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
        <Button label="Back to assistants" onPress={() => router.back()} />
        <AssistantForm
          assistant={assistant}
          key={assistant.updatedAt}
          onSubmit={saveAssistant}
          submitting={submitting}
        />
        <Button
          disabled={submitting}
          label={assistant.active ? 'Deactivate assistant' : 'Activate assistant'}
          onPress={() => void toggleActive()}
        />
        <Text style={styles.sectionTitle}>Unavailable periods</Text>
        <TextInput label="Date (YYYY-MM-DD)" onChangeText={setPeriodDate} value={periodDate} />
        <TextInput label="Start time (HH:mm)" onChangeText={setPeriodStart} value={periodStart} />
        <TextInput label="End time (HH:mm)" onChangeText={setPeriodEnd} value={periodEnd} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          disabled={submitting}
          label="Add unavailable period"
          onPress={() => void addPeriod()}
        />
        {assistant.unavailablePeriods.length === 0 ? (
          <EmptyState message="No unavailable periods." />
        ) : (
          assistant.unavailablePeriods.map((period) => (
            <View key={period.id} style={styles.period}>
              <Text>{period.date}</Text>
              <Text>
                {period.startTime}-{period.endTime}
              </Text>
              <Button
                disabled={submitting}
                label="Remove"
                onPress={() => void removePeriod(period.id)}
              />
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 32 },
  sectionTitle: { color: '#173042', fontSize: 20, fontWeight: '700', marginTop: 8 },
  period: { backgroundColor: '#FFFFFF', borderRadius: 8, gap: 8, padding: 12 },
  error: { color: '#B42318' },
});
