import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const SignInScreen = ({ navigation }: Props) => {
  const { register, isLoading, error, clearError } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fullName = useMemo(
    () =>
      [firstName.trim(), middleName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(' '),
    [firstName, middleName, lastName]
  );

  const isDisabled = useMemo(() => {
    const hasRequiredFields =
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      password.length >= 6;

    const passwordsMatch = password === confirmPassword;

    return !hasRequiredFields || !passwordsMatch;
  }, [email, firstName, lastName, password, confirmPassword]);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      return;
    }

    clearError();
    await register({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.brandRow}>
              <Image source={require('../../../assets/icon.png')} style={styles.brandLogo} />
              <Text style={styles.brand}>ADPark</Text>
            </View>
            <Text style={styles.title}>Create an account</Text>
            <Text style={styles.subtitle}>
              Set up your profile to manage parking access and availability.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Create account</Text>
              <Text style={styles.formSubtitle}>
                Set up your profile to start parking smarter.
              </Text>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <AppInput
                  label="First Name"
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.nameField}>
                <AppInput
                  label="Last Name"
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <AppInput
              label="Middle Name"
              placeholder="Optional"
              value={middleName}
              onChangeText={setMiddleName}
            />

            <AppInput
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AppInput
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <AppInput
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={
                confirmPassword && password !== confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
            />

            <View style={styles.identityCard}>
              <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.identityText}>
                {fullName
                  ? `Creating account for ${fullName}`
                  : 'Your name will appear on your ADPark profile.'}
              </Text>
            </View>

            <AppButton
              title={isLoading ? 'Creating ADPark account...' : 'Create ADPark account'}
              onPress={handleRegister}
              disabled={isDisabled || isLoading}
              style={styles.primaryButton}
            />

            {isLoading ? (
              <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Setting up your account...</Text>
              </View>
            ) : null}

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <AppButton
                title="Log in"
                onPress={() => navigation.navigate('Login')}
                variant="ghost"
                style={styles.ghostButton}
                disabled={isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  heroSection: {
    overflow: 'hidden',
    backgroundColor: colors.dark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandLogo: {
    borderRadius: 8,
    marginRight: spacing.sm,
    height: 34,
    width: 34,
  },
  brand: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  formHeader: {
    marginBottom: spacing.md,
  },
  formTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  formSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  nameField: {
    flex: 1,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orangeSoft,
    borderColor: '#FED7AA',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  identityText: {
    flex: 1,
    color: colors.slate,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: spacing.lg,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  ghostButton: {
    paddingVertical: spacing.sm,
  },
});

export default SignInScreen;