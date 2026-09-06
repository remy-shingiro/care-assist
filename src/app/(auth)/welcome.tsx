import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/ui/Screen';

export default function Welcome() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text>Care Assist</Text>
        <Link href="/(auth)/login">Continue to login</Link>
        <Link href="/(auth)/register">Create a patient account</Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
