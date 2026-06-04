import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Shadows, Sizes } from '../theme/colors';
import { getCollections, getCollectionsSummary, CollectionsSummary, CollectionRecord, getSetting } from '../utils/db';
import { getTamilDateDetails } from '../utils/tamilCalendar';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Rect, Path, Circle, Text as SvgText, G } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Sizes.marginMobile * 2 - 40;

export default function Analytics({ refreshTrigger }: { refreshTrigger?: number }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CollectionsSummary | null>(null);
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [deityType, setDeityType] = useState('Other');
  
  // Custom Dynamic Insights state
  const [insights, setInsights] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const deity = await getSetting('deity_type') || 'Other';
      setDeityType(deity);

      const sum = await getCollectionsSummary();
      setSummary(sum);

      const allRecords = await getCollections();
      setRecords(allRecords);
      
      generateSpiritualInsights(allRecords, deity);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const generateSpiritualInsights = (data: CollectionRecord[], deity: string) => {
    const list: string[] = [];
    if (data.length < 3) {
      // Baseline defaults when database is empty / low data
      if (deity === 'Perumal') {
        list.push('Collections are expected to be 30% to 45% higher on Ekadasi days.');
        list.push('Purattasi Saturdays generally contribute up to 20% of annual temple income.');
      } else if (deity === 'Shiva') {
        list.push('Evening Aradhanai on Pradosham days historically generates higher donations.');
        list.push('Upcoming Maha Shivaratri may generate up to 50% higher collections.');
      } else if (deity === 'Amman') {
        list.push('Aadi Fridays generate the highest devotee gatherings and collections.');
        list.push('Navaratri festival represents a peak earning window for Shakti temples.');
      } else {
        list.push('Saturdays and Sundays typically generate the highest average collections.');
        list.push('Special Pooja festival days see a noticeable growth compared to weekdays.');
      }
      setInsights(list);
      return;
    }

    // 1. Calculate Average Special vs Normal Days
    const specialDays = data.filter(r => r.festival && r.festival !== '');
    const normalDays = data.filter(r => !r.festival || r.festival === '');
    
    if (specialDays.length > 0 && normalDays.length > 0) {
      const avgSpecial = specialDays.reduce((acc, r) => acc + r.amount, 0) / specialDays.length;
      const avgNormal = normalDays.reduce((acc, r) => acc + r.amount, 0) / normalDays.length;
      
      if (avgSpecial > avgNormal) {
        const percent = Math.round(((avgSpecial - avgNormal) / avgNormal) * 100);
        list.push(`Collections were ${percent}% higher on special observance days compared to regular days.`);
      }
    }

    // 2. Day of Week Analysis
    const weekdaySum: { [key: number]: { total: number; count: number } } = {};
    for (let i = 0; i < 7; i++) weekdaySum[i] = { total: 0, count: 0 };

    data.forEach(r => {
      const d = new Date(r.date);
      const day = d.getDay();
      weekdaySum[day].total += r.amount;
      weekdaySum[day].count += 1;
    });

    let bestDay = -1;
    let highestAvg = 0;
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    Object.keys(weekdaySum).forEach(dayKey => {
      const k = parseInt(dayKey);
      if (weekdaySum[k].count > 0) {
        const avg = weekdaySum[k].total / weekdaySum[k].count;
        if (avg > highestAvg) {
          highestAvg = avg;
          bestDay = k;
        }
      }
    });

    if (bestDay !== -1) {
      list.push(`${weekdays[bestDay]}s generated the highest average collection of ₹${Math.round(highestAvg)}.`);
    }

    // 3. Month over Month Growth
    if (summary && summary.monthlyGrowthPercent !== 0) {
      const trendStr = summary.monthlyGrowthPercent > 0 ? 'increased' : 'decreased';
      list.push(`Collections ${trendStr} by ${Math.abs(Math.round(summary.monthlyGrowthPercent))}% compared to last month.`);
    }

    // Fallback if list is short
    if (list.length < 2) {
      list.push('Consistently record daily entries to generate more precise divine insights.');
    }

    setInsights(list);
  };

  const formatCurrency = (val: number) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  // Compile monthly data for chart (Last 6 months)
  const getMonthlyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const chartData = [];
    
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      const targetMonthStr = String(mIdx + 1).padStart(2, '0');
      // Sum up amounts for this month
      const monthSum = records
        .filter(r => r.date.split('-')[1] === targetMonthStr)
        .reduce((sum, r) => sum + r.amount, 0);
      
      chartData.push({
        label: months[mIdx],
        amount: monthSum,
      });
    }
    return chartData;
  };

  // Compile weekly flow data (last 7 recorded entries or last 7 days)
  const getWeeklyChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    
    // Fallback Mock line points if no data
    if (records.length === 0) {
      return [
        { label: 'Mon', val: 100 },
        { label: 'Wed', val: 80 },
        { label: 'Fri', val: 150 },
        { label: 'Sun', val: 240 }
      ];
    }

    const last7 = [...records].reverse().slice(-7);
    return last7.map(r => {
      const d = new Date(r.date);
      return {
        label: days[d.getDay()],
        val: r.amount,
      };
    });
  };

  const monthlyChartData = getMonthlyChartData();
  const weeklyChartData = getWeeklyChartData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Calculate SVG bar heights
  const maxMonthVal = Math.max(...monthlyChartData.map(d => d.amount), 1000);
  const maxWeekVal = Math.max(...weeklyChartData.map(d => d.val), 500);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Spiritual Analytics</Text>
          <Text style={styles.subtitle}>Collections analysis & insights for {deityType} Temple</Text>
        </View>

        {/* Bento Grid: Charts */}
        <View style={styles.chartsContainer}>
          {/* Chart 1: Monthly Collections */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Monthly Collections</Text>
              <Text style={styles.chartSub}>Last 6 Months</Text>
            </View>
            
            <View style={styles.svgContainer}>
              <Svg width={CHART_WIDTH} height={200}>
                {monthlyChartData.map((d, index) => {
                  const barHeight = maxMonthVal > 0 ? (d.amount / maxMonthVal) * 140 : 0;
                  const x = index * (CHART_WIDTH / 6) + 10;
                  const y = 160 - barHeight;
                  const isCurrent = index === 5;
                  
                  return (
                    <G key={d.label}>
                      {/* Bar Background */}
                      <Rect
                        x={x}
                        y={20}
                        width={24}
                        height={140}
                        rx={6}
                        fill={Colors.surfaceContainer}
                      />
                      {/* Bar Fill */}
                      <Rect
                        x={x}
                        y={y}
                        width={24}
                        height={barHeight}
                        rx={6}
                        fill={isCurrent ? Colors.primary : Colors.primaryFixedDim}
                      />
                      {/* X Axis Label */}
                      <SvgText
                        x={x + 12}
                        y={185}
                        fontSize="12"
                        fill={isCurrent ? Colors.primary : Colors.onSurfaceVariant}
                        fontWeight={isCurrent ? 'bold' : 'normal'}
                        textAnchor="middle"
                      >
                        {d.label}
                      </SvgText>
                      {/* Value inside bar on hover/top */}
                      {d.amount > 0 && (
                        <SvgText
                          x={x + 12}
                          y={y - 5}
                          fontSize="9"
                          fill={Colors.onSurface}
                          textAnchor="middle"
                        >
                          {d.amount >= 1000 ? `${(d.amount/1000).toFixed(1)}k` : d.amount}
                        </SvgText>
                      )}
                    </G>
                  );
                })}
              </Svg>
            </View>
          </View>

          {/* Chart 2: Weekly Flow Line Graph */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weekly Flow</Text>
              <View style={styles.avgLegend}>
                <View style={styles.legendDot} />
                <Text style={styles.chartSub}>Daily Average</Text>
              </View>
            </View>

            <View style={styles.svgContainer}>
              <Svg width={CHART_WIDTH} height={200}>
                {/* Generate Path line */}
                {(() => {
                  if (weeklyChartData.length === 0) return null;
                  const points = weeklyChartData.map((d, index) => {
                    const x = index * (CHART_WIDTH / (weeklyChartData.length - 1 || 1)) + 15;
                    const y = 150 - (d.val / maxWeekVal) * 110;
                    return { x, y };
                  });

                  let pathData = `M ${points[0].x} ${points[0].y}`;
                  for (let i = 1; i < points.length; i++) {
                    pathData += ` L ${points[i].x} ${points[i].y}`;
                  }

                  return (
                    <G>
                      {/* Line Path */}
                      <Path
                        d={pathData}
                        fill="none"
                        stroke={Colors.secondary}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      {/* Circles for points */}
                      {points.map((p, index) => (
                        <Circle
                          key={index}
                          cx={p.x}
                          cy={p.y}
                          r={6}
                          fill={index === points.length - 1 ? Colors.primary : Colors.secondary}
                          stroke={Colors.surfaceContainerLowest}
                          strokeWidth={2}
                        />
                      ))}
                      {/* Labels */}
                      {weeklyChartData.map((d, index) => (
                        <SvgText
                          key={d.label + index}
                          x={points[index].x}
                          y={175}
                          fontSize="12"
                          fill={Colors.onSurfaceVariant}
                          textAnchor="middle"
                        >
                          {d.label}
                        </SvgText>
                      ))}
                    </G>
                  );
                })()}
              </Svg>
            </View>
          </View>
        </View>

        {/* AI Divine Insights Card */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <MaterialIcons name="auto-awesome" size={24} color={Colors.primary} />
            <Text style={styles.insightsTitle}>Divine Insights</Text>
          </View>
          <View style={styles.insightsList}>
            {insights.map((insight, idx) => (
              <View key={idx} style={styles.insightItem}>
                <MaterialIcons name="trending-up" size={20} color={Colors.secondary} style={styles.insightIcon} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Table */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Stat Summary</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Highest Collection Day</Text>
            <Text style={styles.statsValue}>
              {summary?.highestDay ? `${formatCurrency(summary.highestDay.amount)} (${summary.highestDay.date})` : 'N/A'}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Lowest Collection Day</Text>
            <Text style={styles.statsValue}>
              {summary?.lowestDay ? `${formatCurrency(summary.lowestDay.amount)} (${summary.lowestDay.date})` : 'N/A'}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Average Daily Collection</Text>
            <Text style={styles.statsValue}>{formatCurrency(summary?.averageDaily || 0)}</Text>
          </View>
          <View style={[styles.statsRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.statsLabel}>Monthly Growth Percentage</Text>
            <Text style={[styles.statsValue, { color: (summary?.monthlyGrowthPercent || 0) >= 0 ? 'green' : 'red' }]}>
              {summary?.monthlyGrowthPercent !== undefined ? `${summary.monthlyGrowthPercent.toFixed(1)}%` : '0%'}
            </Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Sizes.marginMobile,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...Typography.headlineLgMobile,
    color: Colors.onSurface,
  },
  subtitle: {
    ...Typography.labelLg,
    color: Colors.onSurfaceVariant,
    fontWeight: '400',
  },
  chartsContainer: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderRadius: 16,
    padding: Sizes.cardPadding,
    marginBottom: 16,
    ...Shadows.umber,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    ...Typography.labelLg,
    color: Colors.primary,
    fontWeight: '700',
  },
  chartSub: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  avgLegend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
    marginRight: 6,
  },
  svgContainer: {
    alignItems: 'center',
  },
  insightsCard: {
    backgroundColor: 'rgba(255, 153, 51, 0.05)',
    borderColor: 'rgba(255, 153, 51, 0.15)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    ...Typography.labelLg,
    color: Colors.onPrimaryContainer,
    fontWeight: '700',
    marginLeft: 8,
  },
  insightsList: {
    width: '100%',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Shadows.umber,
  },
  insightIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  insightText: {
    ...Typography.bodyMd,
    fontSize: 16,
    color: Colors.onSurface,
    flex: 1,
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderRadius: 16,
    padding: Sizes.cardPadding,
    ...Shadows.umber,
  },
  statsTitle: {
    ...Typography.headlineMd,
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  statsLabel: {
    ...Typography.labelLg,
    color: Colors.onSurfaceVariant,
    fontWeight: '400',
  },
  statsValue: {
    ...Typography.labelLg,
    color: Colors.onSurface,
    fontWeight: '700',
  },
});
