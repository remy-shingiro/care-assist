import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { TextInput } from '../../components/ui/TextInput';
import { useAuth } from '../../features/auth/AuthProvider';
import { authenticationErrorMessage } from '../../utils/errors';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (signInError) {
      setError(authenticationErrorMessage(signInError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue to Care Assist.</Text>
        <TextInput label="Email" onChangeText={setEmail} value={email} />
        <TextInput label="Password" onChangeText={setPassword} secureTextEntry value={password} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button disabled={isSubmitting} label="Sign in" onPress={() => void submit()} />
        <Link href="/(auth)/register" style={styles.link}>
          Create a patient account
        </Link>
        <Link href="/(auth)/welcome" style={styles.link}>
          Back
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: { color: '#173042', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#526775', fontSize: 16, marginBottom: 28 },
  error: { color: '#B42318', marginBottom: 16 },
  link: { color: '#176B87', fontSize: 16, marginTop: 20, textAlign: 'center' },
});
