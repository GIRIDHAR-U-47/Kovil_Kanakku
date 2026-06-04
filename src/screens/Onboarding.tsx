import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Shadows, Sizes } from '../theme/colors';
import { saveSetting } from '../utils/db';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

interface OnboardingProps {
  onComplete: () => void;
}

const DEITIES = [
  { id: 'Perumal', title: 'Peruma Temple and Related', subtitle: 'Vishnu Temple & Observances', icon: 'temple-hindu' },
  { id: 'Shiva', title: 'Shiva Temple and Related', subtitle: 'Shaivite Tradition & Observances', icon: 'om' },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [priestName, setPriestName] = useState('');
  const [templeName, setTempleName] = useState('');
  const [step, setStep] = useState(1);

  const handleNext = async () => {
    if (step === 1 && selectedDeity) {
      setStep(2);
    } else if (step === 2) {
      if (!priestName.trim() || !templeName.trim()) {
        alert('Please fill in both Priest Name and Temple Name');
        return;
      }
      try {
        await saveSetting('deity_type', selectedDeity || 'Other');
        await saveSetting('priest_name', priestName);
        await saveSetting('temple_name', templeName);
        await saveSetting('onboarding_complete', 'true');
        onComplete();
      } catch (err) {
        console.error('Failed to save onboarding settings:', err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo and Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/Logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>
            Welcome to{'\n'}Thattu Kaasu
          </Text>
          <Text style={styles.tamilTitle}>தட்டு காசு</Text>
          <Text style={styles.subtitle}>
            Securely track your temple pooja collections.
          </Text>
        </View>

        {step === 1 ? (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.sectionTitle}>Select Temple Type</Text>
              <Text style={styles.stepIndicator}>Step 1 of 2</Text>
            </View>

            <View style={styles.grid}>
              {DEITIES.map((deity) => {
                const isSelected = selectedDeity === deity.id;
                return (
                  <TouchableOpacity
                    key={deity.id}
                    style={[
                      styles.card,
                      isSelected && styles.cardSelected,
                    ]}
                    onPress={() => setSelectedDeity(deity.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        isSelected && styles.iconContainerSelected,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={deity.icon as any}
                        size={28}
                        color={isSelected ? Colors.onPrimaryContainer : Colors.primary}
                      />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{deity.title}</Text>
                      <Text style={styles.cardSubtitle}>{deity.subtitle}</Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={isSelected ? Colors.primary : Colors.outline}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.sectionTitle}>Temple Credentials</Text>
              <Text style={styles.stepIndicator}>Step 2 of 2</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Priest / Archakar Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Shri Ramachandran"
                  placeholderTextColor={Colors.outline}
                  value={priestName}
                  onChangeText={setPriestName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Temple Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Arulmigu Sri Vinayagar Temple"
                  placeholderTextColor={Colors.outline}
                  value={templeName}
                  onChangeText={setTempleName}
                />
              </View>
            </View>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              (step === 1 && !selectedDeity) && styles.buttonDisabled,
            ]}
            disabled={step === 1 && !selectedDeity}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>
              {step === 1 ? 'Continue' : 'Get Started'}
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimary} style={styles.buttonIcon} />
          </TouchableOpacity>
          {step === 2 && (
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
              <Text style={styles.backButtonText}>Back to Deity Selection</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.footerNote}>
            By continuing, you agree to secure temple protocol.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Sizes.marginMobile,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    ...Typography.headlineLgMobile,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 34,
  },
  tamilTitle: {
    ...Typography.bodyLg,
    color: Colors.secondary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.labelLg,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    fontWeight: '400',
    maxWidth: 280,
    marginTop: 4,
  },
  stepContainer: {
    width: '100%',
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.labelLg,
    color: Colors.onSurface,
  },
  stepIndicator: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  grid: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Sizes.cardPadding,
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: 'transparent',
    borderWidth: 2,
    borderRadius: 16,
    marginBottom: 12,
    ...Shadows.umber,
  },
  cardSelected: {
    borderColor: Colors.primaryContainer,
    transform: [{ scale: 1.02 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: Colors.primaryContainer,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.labelLg,
    color: Colors.onSurface,
  },
  cardSubtitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  form: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Sizes.cardPadding,
    borderRadius: 16,
    ...Shadows.umber,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...Typography.labelLg,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderColor: Colors.outlineVariant,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceContainerLow,
    color: Colors.onSurface,
    ...Typography.bodyMd,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.umberActive,
  },
  buttonDisabled: {
    backgroundColor: Colors.outline,
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    ...Typography.labelLg,
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },
  footerNote: {
    ...Typography.labelSm,
    color: Colors.outline,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
});
