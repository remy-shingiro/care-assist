import { Pressable, StyleSheet, Text } from 'react-native';

interface ButtonProps {
  readonly label: string;
  readonly onPress?: () => void;
  readonly disabled?: boolean;
}

export function Button({ label, onPress, disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={styles.button}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#176B87',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
