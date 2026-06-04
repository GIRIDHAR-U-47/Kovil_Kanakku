import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Shadows, Sizes } from '../theme/colors';
import { getCollectionsForDate, CollectionRecord } from '../utils/db';
import { MaterialIcons } from '@expo/vector-icons';

export default function Calendar({ refreshTrigger }: { refreshTrigger?: number }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayCollections, setDayCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return 'st';
      case 2:  return 'nd';
      case 3:  return 'rd';
      default: return 'th';
    }
  };

  useEffect(() => {
    // Default select today if in the current viewed month, else select 1st of that month
    const today = new Date();
    let initialSelect = today;
    if (today.getFullYear() !== currentDate.getFullYear() || today.getMonth() !== currentDate.getMonth()) {
      initialSelect = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }
    const initialSelectStr = `${initialSelect.getFullYear()}-${String(initialSelect.getMonth() + 1).padStart(2, '0')}-${String(initialSelect.getDate()).padStart(2, '0')}`;
    
    handleSelectDate(initialSelectStr);
  }, [currentDate, refreshTrigger]);

  const handleSelectDate = async (dateStr: string) => {
    setSelectedDate(dateStr);

    try {
      setLoading(true);
      const cols = await getCollectionsForDate(dateStr);
      setDayCollections(cols);
    } catch (err) {
      console.error('Failed to load collections for date:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Generate days in the viewed month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Day of week of 1st day (0-6)
    const firstDayIndex = date.getDay();
    
    // Add padding days at start
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ padding: true });
    }
    
    // Number of days in this month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      days.push({
        padding: false,
        dayNum: i,
        dateStr,
      });
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth();
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const totalDayAmount = dayCollections.reduce((sum, r) => sum + r.amount, 0);

  // Hardcoded upcoming special days for quick navigation / info cards
  const getUpcomingDays = () => {
    if (currentDate.getMonth() === 0) { // January 2026
      return [
        { title: 'Pongal', dateText: 'Jan 15, Thai 2', icon: 'celebration', color: Colors.tertiaryFixed },
        { title: 'Amavasai', dateText: 'Jan 18, Thai 5', icon: 'wb-sunny', color: Colors.secondaryFixed }
      ];
    }
    // Default upcoming list
    return [
      { title: 'Pradosham', dateText: 'Next occurrence in 5 days', icon: 'water-drop', color: Colors.tertiaryFixed },
      { title: 'Pournami', dateText: 'Next Full Moon in 12 days', icon: 'brightness-5', color: Colors.secondaryFixed }
    ];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Selector header */}
        <View style={styles.monthHeader}>
          <View>
            <Text style={styles.gregorianMonthLabel}>
              {monthsList[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
          </View>
          <View style={styles.navButtons}>
            <TouchableOpacity style={styles.navButton} onPress={prevMonth}>
              <MaterialIcons name="chevron-left" size={24} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={nextMonth}>
              <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid Container */}
        <View style={styles.calendarCard}>
          {/* Days of Week Header */}
          <View style={styles.weekHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => (
              <Text key={w} style={styles.weekHeaderText}>{w}</Text>
            ))}
          </View>

          {/* Grid list */}
          <View style={styles.grid}>
            {calendarDays.map((item, idx) => {
              if (item.padding) {
                return <View key={`pad-${idx}`} style={styles.paddingCell} />;
              }

              const isSelected = item.dateStr === selectedDate;
              const isToday = item.dateStr === todayStr;

              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && styles.dayCellToday,
                  ]}
                  onPress={() => handleSelectDate(item.dateStr!)}
                >
                  <Text
                    style={[
                      styles.dayNumText,
                      isSelected && styles.dayNumTextSelected,
                      isToday && styles.dayNumTextToday,
                    ]}
                  >
                    {item.dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Collections Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.detailsTitle}>
                Collections for {selectedDate ? `${monthsList[new Date(selectedDate.replace(/-/g, '/')).getMonth()]} ${new Date(selectedDate.replace(/-/g, '/')).getDate()}${getOrdinalSuffix(new Date(selectedDate.replace(/-/g, '/')).getDate())}` : ''}
              </Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 20 }} />
          ) : (
            <View style={styles.detailsBody}>
              <View style={styles.collectionsRow}>
                <View style={styles.colBox}>
                  <Text style={styles.colLabel}>Total Collected</Text>
                  <Text style={styles.colAmount}>{`₹${totalDayAmount.toLocaleString('en-IN')}`}</Text>
                </View>
                <View style={styles.colBox}>
                  <Text style={styles.colLabel}>Entries Count</Text>
                  <Text style={styles.colAmount}>{dayCollections.length}</Text>
                </View>
              </View>
              {dayCollections.length > 0 && (
                <View style={styles.miniList}>
                  {dayCollections.map((col) => (
                    <View key={col.id} style={styles.miniItem}>
                      <Text style={styles.miniItemNotes}>{col.notes || 'General Collection'}</Text>
                      <Text style={styles.miniItemAmount}>{`₹${col.amount}`}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
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
    paddingBottom: 100,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  gregorianMonthLabel: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  navButtons: {
    flexDirection: 'row',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  calendarCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    ...Shadows.umber,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
    paddingBottom: 8,
    marginBottom: 8,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    ...Typography.labelSm,
    color: Colors.outline,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paddingCell: {
    width: '14.28%',
    height: 60,
  },
  dayCell: {
    width: '14.28%',
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
    borderWidth: 1,
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: Colors.primaryFixed,
    borderColor: Colors.primaryContainer,
  },
  dayCellToday: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primaryContainer + '15',
  },
  dayNumText: {
    ...Typography.labelLg,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  dayNumTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dayNumTextToday: {
    color: Colors.primary,
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: Sizes.cardPadding,
    marginBottom: 24,
    ...Shadows.umber,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    paddingBottom: 12,
    marginBottom: 16,
  },
  detailsTitle: {
    ...Typography.labelLg,
    color: Colors.primary,
    fontWeight: '700',
  },
  detailsBody: {
    width: '100%',
  },
  collectionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colBox: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    borderColor: Colors.outlineVariant,
    borderWidth: 1,
  },
  colLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
    marginBottom: 4,
  },
  colAmount: {
    ...Typography.headlineMd,
    fontSize: 20,
    color: Colors.onSurface,
  },
  miniList: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 8,
    borderColor: Colors.outlineVariant,
    borderWidth: 1,
  },
  miniItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  miniItemNotes: {
    ...Typography.bodyMd,
    fontSize: 14,
    color: Colors.onSurface,
  },
  miniItemAmount: {
    ...Typography.labelLg,
    fontSize: 14,
    color: Colors.primary,
  },
});
