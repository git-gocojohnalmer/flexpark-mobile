import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

type HeaderProps = {
  name: string;
  onPressSettings: () => void;
};

const Header = ({ name, onPressSettings }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.caption}>Hello</Text>
        <Text style={styles.title}>{name}</Text>
      </View>

      <Pressable
        accessibilityLabel="Open account settings"
        accessibilityRole="button"
        onPress={onPressSettings}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons name="settings-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    borderRadius: 12,
    width: 42,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default Header;