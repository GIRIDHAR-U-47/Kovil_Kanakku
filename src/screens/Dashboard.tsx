import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Colors, Typography, Shadows, Sizes } from '../theme/colors';
import { getCollections, getCollectionsSummary, CollectionRecord, CollectionsSummary, getSetting } from '../utils/db';
import { getTamilDateDetails } from '../utils/tamilCalendar';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

interface DashboardProps {
  onAddPress: () => void;
  onViewAllRecentPress?: () => void;
  refreshTrigger?: number;
}

export default function Dashboard({ onAddPress, onViewAllRecentPress, refreshTrigger }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CollectionsSummary | null>(null);
  const [recentEntries, setRecentEntries] = useState<CollectionRecord[]>([]);
  const [priestName, setPriestName] = useState('');
  const [templeName, setTempleName] = useState('');
  const [deityType, setDeityType] = useState('Other');
  
  // Tamil Date Details
  const tamilDetails = getTamilDateDetails(new Date(), deityType);

  const today = new Date();
  const englishDateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const name = await getSetting('priest_name') || 'Shri Ramachandran';
      const temple = await getSetting('temple_name') || 'Arulmigu Sri Vinayagar Temple';
      const deity = await getSetting('deity_type') || 'Other';
      setPriestName(name);
      setTempleName(temple);
      setDeityType(deity);

      const sum = await getCollectionsSummary();
      const recent = await getCollections(5);
      setSummary(sum);
      setRecentEntries(recent);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getDeityIcon = () => {
    switch (deityType) {
      case 'Perumal': return 'temple-hindu';
      case 'Shiva': return 'om';
      default: return 'temple-hindu';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* TopAppBar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <Text style={styles.appBarTitle}>Thattu Kaasu</Text>
        </View>
        <View style={styles.appBarRight}>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileGreeting}>Namaste,</Text>
            <Text style={styles.profileName}>{priestName.split(' ')[0]}</Text>
          </View>
          <View style={styles.profileAvatar}>
            <MaterialIcons name="person" size={24} color={Colors.primary} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.templeHeader}>
            <MaterialCommunityIcons name={getDeityIcon() as any} size={24} color={Colors.secondary} />
            <Text style={styles.templeName}>{templeName}</Text>
          </View>
          <Text style={styles.greetingTitle}>Daily Collection Overview</Text>

          {/* English & Tamil Dates banner */}
          <View style={styles.dateBanner}>
            <View style={styles.dateIconBg}>
              <MaterialIcons name="calendar-month" size={24} color={Colors.primary} />
            </View>
            <View style={styles.dateTextContainer}>
              <Text style={styles.englishDateText}>{englishDateStr}</Text>
              <Text style={styles.tamilDateText}>
                {tamilDetails.tamilMonth} Month • Day {tamilDetails.tamilDate}
              </Text>
            </View>
            {tamilDetails.festival ? (
              <View style={styles.observanceBadge}>
                <Text style={styles.observanceText}>{tamilDetails.festival}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Collection Grid */}
        <View style={styles.grid}>
          {/* Today's Earning Card */}
          <View style={styles.statsCardSingle}>
            <View style={styles.statsCardHeader}>
              <Text style={styles.statsCardLabel}>Today's Earning</Text>
              <View style={[styles.statsIconBg, { backgroundColor: Colors.primaryFixed }]}>
                <MaterialIcons name="payments" size={22} color={Colors.primary} />
              </View>
            </View>
            <Text style={styles.statsCardValue}>{formatCurrency(summary?.today || 0)}</Text>
            <Text style={styles.statsCardSubText}>Today's collected cash</Text>
          </View>

          {/* This Month's Total Card */}
          <View style={styles.statsCardSingle}>
            <View style={styles.statsCardHeader}>
              <Text style={styles.statsCardLabel}>This Month's Total</Text>
              <View style={[styles.statsIconBg, { backgroundColor: Colors.secondaryFixed }]}>
                <MaterialIcons name="account-balance" size={22} color={Colors.secondary} />
              </View>
            </View>
            <Text style={styles.statsCardValue}>{formatCurrency(summary?.month || 0)}</Text>
            <Text style={styles.statsCardSubText}>Based on English Month</Text>
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Entries</Text>
            {onViewAllRecentPress && (
              <TouchableOpacity onPress={onViewAllRecentPress}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.entriesList}>
            {recentEntries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No records saved yet.</Text>
              </View>
            ) : (
              recentEntries.map((item) => (
                <View key={item.id} style={[styles.entryItem, styles.entryBorderPrimary]}>
                  <View style={styles.entryLeft}>
                    <View style={styles.entryIconBg}>
                      <MaterialIcons name="card-giftcard" size={24} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.entryTitle}>{item.notes || 'Collection Entry'}</Text>
                      <Text style={styles.entrySub}>{item.date} • {item.tamil_month} {item.tamil_date}</Text>
                    </View>
                  </View>
                  <View style={styles.entryRight}>
                    <Text style={styles.entryAmount}>{formatCurrency(item.amount)}</Text>
                    <Text style={styles.entryStatus}>VERIFIED</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Decorative Motif */}
        <View style={styles.motifContainer}>
          <MaterialIcons name="filter-vintage" size={48} color={Colors.outlineVariant} />
          <Text style={styles.motifText}>Akshyam</Text>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={onAddPress} 
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={32} color={Colors.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.marginMobile,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appBarTitle: {
    ...Typography.headlineMd,
    color: Colors.primary,
    fontWeight: '700',
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTextContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  profileGreeting: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  profileName: {
    ...Typography.labelLg,
    color: Colors.primary,
    fontWeight: '600',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primaryFixedDim,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Sizes.marginMobile,
    paddingTop: 16,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  templeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  templeName: {
    ...Typography.labelLg,
    color: Colors.secondary,
    marginLeft: 8,
    fontWeight: '600',
  },
  greetingTitle: {
    ...Typography.headlineLgMobile,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.outlineVariant,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    ...Shadows.umber,
  },
  dateIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  englishDateText: {
    ...Typography.labelLg,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  tamilDateText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '600',
  },
  observanceBadge: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  observanceText: {
    ...Typography.labelSm,
    color: Colors.onPrimaryContainer,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCardSingle: {
    width: '48%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Shadows.umber,
  },
  statsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsCardLabel: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  statsIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCardValue: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  statsCardSubText: {
    ...Typography.labelSm,
    fontSize: 11,
    color: Colors.outline,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.umberActive,
  },
  recentSection: {
    marginTop: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    ...Typography.headlineMd,
    fontSize: 20,
    color: Colors.onSurface,
  },
  viewAllText: {
    ...Typography.labelLg,
    color: Colors.primary,
  },
  entriesList: {
    width: '100%',
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  entryBorderPrimary: {
    borderLeftColor: Colors.primaryContainer,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  entryTitle: {
    ...Typography.labelLg,
    color: Colors.onSurface,
  },
  entrySub: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  entryRight: {
    alignItems: 'flex-end',
  },
  entryAmount: {
    ...Typography.labelLg,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  entryStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: 'green',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.outline,
  },
  motifContainer: {
    alignItems: 'center',
    marginVertical: 40,
    opacity: 0.25,
  },
  motifText: {
    ...Typography.labelSm,
    color: Colors.onSurface,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
