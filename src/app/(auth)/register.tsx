import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { TextInput } from '../../components/ui/TextInput';
import { useAuth } from '../../features/auth/AuthProvider';
import { authenticationErrorMessage } from '../../utils/errors';

export default function Register() {
  const { registerPatient, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Complete all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Choose a password with at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    try {
      await registerPatient({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
      });
    } catch (registrationError) {
      setError(authenticationErrorMessage(registrationError));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your patient account</Text>
        <Text style={styles.subtitle}>Request and manage support in one place.</Text>
        <TextInput label="Full name" onChangeText={setFullName} value={fullName} />
        <TextInput label="Phone" onChangeText={setPhone} value={phone} />
        <TextInput label="Email" onChangeText={setEmail} value={email} />
        <TextInput label="Password" onChangeText={setPassword} secureTextEntry value={password} />
        <TextInput
          label="Confirm password"
          onChangeText={setConfirmPassword}
          secureTextEntry
          value={confirmPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button disabled={loading} label="Create account" onPress={() => void submit()} />
        <Link href="/(auth)/login" style={styles.link}>
          Back to login
        </Link>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
  title: { color: '#173042', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#526775', fontSize: 16, marginBottom: 28 },
  error: { color: '#B42318', marginBottom: 16 },
  link: { color: '#176B87', fontSize: 16, marginTop: 20, textAlign: 'center' },
});
