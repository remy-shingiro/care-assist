import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '../features/auth/AuthProvider';
import { Screen } from '../components/ui/Screen';

function RouteGate() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const target =
    user === null
      ? '/(auth)/welcome'
      : profile?.role === 'manager'
        ? '/(manager)/dashboard'
        : '/(patient)/home';

  useEffect(() => {
    if (loading || (user !== null && profile === null)) return;

    const currentGroup = segments[0];
    const targetGroup = target.split('/')[1];
    if (currentGroup === undefined) return;
    if (currentGroup !== targetGroup) router.replace(target);
  }, [loading, profile, router, segments, target, user]);

  if (loading || (user !== null && profile === null)) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color="#176B87" size="large" />
        </View>
      </Screen>
    );
  }

  if (segments[0] !== undefined && segments[0] !== target.split('/')[1]) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color="#176B87" size="large" />
        </View>
      </Screen>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
