import { StyleSheet, Text, TextInput as NativeTextInput } from 'react-native';

interface TextInputProps {
  readonly label: string;
  readonly value?: string;
  readonly onChangeText?: (value: string) => void;
  readonly placeholder?: string;
}

export function TextInput({ label, value, onChangeText, placeholder }: TextInputProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <NativeTextInput
        accessibilityLabel={label}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        value={value}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { color: '#253746', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#B6C6D1',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
});
