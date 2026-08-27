import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function Loading() {
  return <ActivityIndicator accessibilityLabel="Loading" size="large" />;
}

export function EmptyState({ message = 'Nothing to show yet.' }: { readonly message?: string }) {
  return <Text style={styles.message}>{message}</Text>;
}

export function ErrorState({ message = 'Something went wrong.' }: { readonly message?: string }) {
  return (
    <Text accessibilityRole="alert" style={styles.error}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  message: { color: '#425466', fontSize: 16, textAlign: 'center' },
  error: { color: '#A12622', fontSize: 16, textAlign: 'center' },
});
