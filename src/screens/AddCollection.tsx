import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { Colors, Typography, Shadows, Sizes } from '../theme/colors';
import { addCollection, getSetting } from '../utils/db';
import { getTamilDateDetails } from '../utils/tamilCalendar';
import { MaterialIcons } from '@expo/vector-icons';

interface AddCollectionProps {
  onSaveSuccess: () => void;
  onCancel?: () => void;
}

export default function AddCollection({ onSaveSuccess, onCancel }: AddCollectionProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [deityType, setDeityType] = useState('Other');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default date to today in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    setDate(today);

    // Get active deity
    getSetting('deity_type').then((val) => {
      setDeityType(val || 'Other');
    });
  }, []);

  const handleQuickSuggestion = (val: number) => {
    setAmount(String(val));
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid collection amount.');
      return;
    }

    if (!date) {
      Alert.alert('Invalid Date', 'Please select a date.');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate Tamil Month, Tamil Date and Festival for the selected date
      const selectedDate = new Date(date);
      const tamilDetails = getTamilDateDetails(selectedDate, deityType);

      await addCollection(
        numAmount,
        date,
        notes.trim(),
        tamilDetails.tamilMonth,
        tamilDetails.tamilDate,
        tamilDetails.festival
      );

      Alert.alert('Success', 'Collection entry saved successfully!');
      
      // Reset fields
      setAmount('');
      setNotes('');
      onSaveSuccess();
    } catch (err) {
      console.error('Failed to save collection:', err);
      Alert.alert('Error', 'Failed to save collection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>New Collection</Text>
          <Text style={styles.subtitle}>Enter details for the temple registry</Text>
        </View>
        {onCancel && (
          <TouchableOpacity style={styles.closeButton} onPress={onCancel} activeOpacity={0.8}>
            <MaterialIcons name="close" size={24} color={Colors.outline} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Large Centered Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.largeLabel}>Collection Amount</Text>
          <View style={styles.largeAmountContainer}>
            <Text style={styles.largeCurrencySymbol}>₹</Text>
            <TextInput
              style={styles.largeAmountInput}
              placeholder="0"
              placeholderTextColor={Colors.outlineVariant}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus={true}
            />
          </View>

          {/* Quick Suggestions underneath */}
          <View style={styles.chipsRow}>
            {[100, 500, 1000, 2000].map((val) => (
              <TouchableOpacity
                key={val}
                style={styles.chip}
                onPress={() => handleQuickSuggestion(val)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipText}>₹{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Details Form Card */}
        <View style={styles.formCard}>
          {/* Date Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Date</Text>
            <View style={styles.dateInputContainer}>
              <MaterialIcons name="calendar-today" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.outline}
                value={date}
                onChangeText={setDate}
              />
            </View>
            <Text style={styles.helperText}>Format: YYYY-MM-DD (e.g., 2026-06-03)</Text>
          </View>

          {/* Notes Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Notes / Purpose</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Devotee name, Pooja type, Ubhayam, or Donation reason..."
              placeholderTextColor={Colors.outline}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.9}
          >
            <MaterialIcons name="verified" size={20} color={Colors.onPrimary} />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving Entry...' : 'Confirm & Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Decorative spiritual emblem */}
        <View style={styles.motifContainer}>
          <MaterialIcons name="filter-vintage" size={40} color={Colors.outlineVariant} style={{ opacity: 0.2 }} />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Sizes.marginMobile,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
    backgroundColor: Colors.background,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.headlineLgMobile,
    fontSize: 22,
    color: Colors.onSurface,
  },
  subtitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    fontWeight: '400',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Sizes.marginMobile,
    paddingTop: 24,
    paddingBottom: 80,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  largeLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  largeAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  largeCurrencySymbol: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 6,
  },
  largeAmountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.onSurface,
    minWidth: 120,
    textAlign: 'center',
    padding: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 6,
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.outlineVariant,
    borderWidth: 1,
    borderRadius: 20,
  },
  chipText: {
    ...Typography.labelSm,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderRadius: 20,
    padding: Sizes.cardPadding,
    ...Shadows.umber,
  },
  inputGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    fontWeight: '700',
    marginBottom: 8,
  },
  dateInputContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.outlineVariant,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    ...Typography.bodyMd,
    fontSize: 16,
    color: Colors.onSurface,
  },
  helperText: {
    ...Typography.labelSm,
    fontSize: 11,
    color: Colors.outline,
    marginTop: 4,
    paddingLeft: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.outlineVariant,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  saveButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Shadows.umberActive,
  },
  saveButtonText: {
    ...Typography.labelLg,
    fontSize: 16,
    color: Colors.onPrimary,
    marginLeft: 8,
    fontWeight: '700',
  },
  motifContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
});
