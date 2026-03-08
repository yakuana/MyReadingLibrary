import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen({ navigation }) {
  const { signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSignIn() {
    const success = signIn(password);
    if (success) {
      navigation.goBack();
    } else {
      setError('Incorrect password. Try again.');
      setPassword('');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.heading}>Owner Access</Text>
        <Text style={styles.subheading}>Sign in to edit your library</Text>

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.subtext}
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError('');
          }}
          onSubmitEditing={handleSignIn}
          autoFocus
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  icon: {
    fontSize: 52,
    marginBottom: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: colors.subtext,
    marginBottom: 36,
  },
  input: {
    width: '100%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  error: {
    fontSize: 14,
    color: '#C0392B',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
