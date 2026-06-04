import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Colors, Typography, Shadows, Sizes } from '../theme/colors';
import { getCollections, getCollectionsSummary, CollectionsSummary, CollectionRecord, getSetting } from '../utils/db';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export default function Reports({ refreshTrigger }: { refreshTrigger?: number }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CollectionsSummary | null>(null);
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [priestName, setPriestName] = useState('');
  const [templeName, setTempleName] = useState('');
  const [deityType, setDeityType] = useState('Other');
  const [exporting, setExporting] = useState(false);

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
      setSummary(sum);

      const allRecords = await getCollections();
      setRecords(allRecords);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const formatCurrency = (val: number) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const getMonthlyBreakdown = () => {
    const breakdown: { [monthStr: string]: { total: number; entries: number } } = {};
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    records.forEach(r => {
      const dateParts = r.date.split('-');
      const key = `${months[parseInt(dateParts[1]) - 1]} ${dateParts[0]}`;
      if (!breakdown[key]) {
        breakdown[key] = { total: 0, entries: 0 };
      }
      breakdown[key].total += r.amount;
      breakdown[key].entries += 1;
    });

    return Object.keys(breakdown).map(k => ({
      monthLabel: k,
      total: breakdown[k].total,
      entries: breakdown[k].entries,
    })).slice(0, 6); // Past 6 months
  };

  const generatePDFReport = async () => {
    try {
      setExporting(true);
      
      const logoAsset = Asset.fromModule(require('../../assets/Logo.png'));
      await logoAsset.downloadAsync();
      const logoUri = logoAsset.localUri || logoAsset.uri;
      
      let logoBase64 = '';
      try {
        if (logoUri) {
          if (logoUri.startsWith('http')) {
            const filename = logoUri.split('/').pop()?.split('?')[0] || 'logo.png';
            const localDest = `${FileSystem.cacheDirectory}${filename}`;
            const downloadResult = await FileSystem.downloadAsync(logoUri, localDest);
            logoBase64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          } else {
            logoBase64 = await FileSystem.readAsStringAsync(logoUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          }
        }
      } catch (fileErr) {
        console.error('Failed to read logo asset as base64:', fileErr);
      }
      
      const rowsHtml = records.map((r, index) => `
        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f4f3f1'}; border-bottom: 1px solid #e3e2e0;">
          <td style="padding: 10px; font-size: 14px; color: #1a1c1a;">${r.date}</td>
          <td style="padding: 10px; font-size: 14px; color: #1a1c1a;">${r.tamil_month} ${r.tamil_date}</td>
          <td style="padding: 10px; font-size: 14px; color: #1a1c1a;">${r.festival || '-'}</td>
          <td style="padding: 10px; font-size: 14px; color: #554336; font-style: italic;">${r.notes || 'General Collection'}</td>
          <td style="padding: 10px; font-size: 14px; font-weight: bold; color: #8f4e00; text-align: right;">₹${r.amount}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Thattu Kaasu Accounts Ledger</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              background-color: #faf9f6;
              color: #1a1c1a;
              margin: 40px;
              padding: 0;
            }
            .header-table {
              width: 100%;
              border-bottom: 3px double #8f4e00;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-cell {
              width: 80px;
            }
            .logo {
              width: 80px;
              height: 80px;
            }
            .title-cell {
              padding-left: 20px;
            }
            .app-title {
              font-size: 28px;
              font-weight: bold;
              color: #8f4e00;
              margin: 0;
            }
            .app-subtitle {
              font-size: 16px;
              color: #735c00;
              margin: 4px 0 0 0;
            }
            .meta-table {
              width: 100%;
              margin-bottom: 30px;
              background-color: #efeeeb;
              border-radius: 8px;
              padding: 15px;
            }
            .meta-label {
              font-weight: bold;
              color: #554336;
            }
            .summary-container {
              width: 100%;
              margin-bottom: 30px;
            }
            .summary-box {
              background-color: #ffdcc2;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              border: 1px solid #ffb77a;
            }
            .summary-value {
              font-size: 24px;
              font-weight: bold;
              color: #6d3a00;
            }
            .ledger-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            .ledger-table th {
              background-color: #8f4e00;
              color: #ffffff;
              text-align: left;
              padding: 12px;
              font-size: 14px;
              text-transform: uppercase;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #887364;
              border-top: 1px solid #e3e2e0;
              padding-top: 20px;
              margin-top: 50px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td class="logo-cell">
                ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="logo" />` : ''}
              </td>
              <td class="title-cell">
                <h1 class="app-title">THATTU KAASU</h1>
                <p class="app-subtitle">தட்டு காசு • Accounts & Pooja Collections Ledger</p>
              </td>
            </tr>
          </table>

          <table class="meta-table">
            <tr>
              <td style="width: 50%">
                <p><span class="meta-label">Temple:</span> ${templeName}</p>
                <p><span class="meta-label">Priest / Archakar:</span> ${priestName}</p>
              </td>
              <td style="width: 50%; text-align: right;">
                <p><span class="meta-label">Deity Type:</span> ${deityType}</p>
                <p><span class="meta-label">Statement Date:</span> ${new Date().toISOString().split('T')[0]}</p>
              </td>
            </tr>
          </table>

          <div class="summary-container">
            <table style="width: 100%;">
              <tr>
                <td style="width: 33.3%; padding: 5px;">
                  <div class="summary-box">
                    <div style="font-size: 12px; color: #6d3a00; text-transform: uppercase;">Total Collections</div>
                    <div class="summary-value">₹${Math.round(summary?.lifetime || 0)}</div>
                  </div>
                </td>
                <td style="width: 33.3%; padding: 5px;">
                  <div class="summary-box" style="background-color: #fff; border-color: #dbc2b0;">
                    <div style="font-size: 12px; color: #554336; text-transform: uppercase;">Daily Average</div>
                    <div class="summary-value" style="color: #1a1c1a;">₹${Math.round(summary?.averageDaily || 0)}</div>
                  </div>
                </td>
                <td style="width: 33.3%; padding: 5px;">
                  <div class="summary-box" style="background-color: #fff; border-color: #dbc2b0;">
                    <div style="font-size: 12px; color: #554336; text-transform: uppercase;">Total Entries</div>
                    <div class="summary-value" style="color: #1a1c1a;">${records.length}</div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <h3 style="color: #8f4e00; border-bottom: 2px solid #ffb77a; padding-bottom: 8px; margin-bottom: 15px;">Transactions Ledger</h3>
          <table class="ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tamil Date</th>
                <th>Festival / Observance</th>
                <th>Notes / Details</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #887364;">No collection records found.</td></tr>`}
            </tbody>
          </table>

          <div class="footer">
            <p>This is a system-generated statement of accounts for spiritual collections.</p>
            <p style="font-size: 14px; font-weight: bold; color: #8f4e00; margin-top: 10px;">Akshyam</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
      
    } catch (err) {
      console.error('Failed to export PDF:', err);
      Alert.alert('Error', 'Failed to generate and share PDF report.');
    } finally {
      setExporting(false);
    }
  };

  const monthlyBreakdown = getMonthlyBreakdown();
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>Financial Reports</Text>
            <View style={styles.monthBadge}>
              <Text style={styles.monthBadgeText}>{`${currentMonthName.slice(0, 3)} ${currentYear}`}</Text>
            </View>
          </View>
        </View>

        {/* Bento Summary Header */}
        <View style={styles.summaryContainer}>
          <View style={styles.lifetimeTotalBox}>
            <View style={styles.lifetimeBackgroundIcon}>
              <MaterialIcons name="account-balance-wallet" size={120} color={Colors.onPrimaryContainer} />
            </View>
            <Text style={styles.lifetimeLabel}>Total Income</Text>
            <Text style={styles.lifetimeValue}>{formatCurrency(summary?.lifetime || 0)}</Text>
            <View style={styles.growthRow}>
              <MaterialIcons name="trending-up" size={16} color={Colors.onPrimaryContainer} />
              <Text style={styles.growthText}>
                Active updates
              </Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.summaryMiniBox}>
              <Text style={styles.miniBoxLabel}>Daily Average</Text>
              <Text style={styles.miniBoxValue}>{formatCurrency(summary?.averageDaily || 0)}</Text>
            </View>
            <View style={styles.summaryMiniBox}>
              <Text style={styles.miniBoxLabel}>Total Entries</Text>
              <Text style={styles.miniBoxValue}>{records.length}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={generatePDFReport}
            disabled={exporting}
            activeOpacity={0.9}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={Colors.onPrimary} />
            ) : (
              <>
                <MaterialIcons name="picture-as-pdf" size={20} color={Colors.onPrimary} />
                <Text style={styles.primaryActionButtonText}>Export PDF</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryActionButton} onPress={generatePDFReport} activeOpacity={0.9}>
            <MaterialIcons name="share" size={20} color={Colors.secondary} />
            <Text style={styles.secondaryActionButtonText}>Share Report</Text>
          </TouchableOpacity>
        </View>

        {/* Past 6 Months Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownHeaderTitle}>Past 6 Months Breakdown</Text>
          <View style={styles.breakdownList}>
            {monthlyBreakdown.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No monthly totals computed yet.</Text>
              </View>
            ) : (
              monthlyBreakdown.map((item, index) => (
                <View key={index} style={styles.breakdownItem}>
                  <View style={styles.itemLeft}>
                    <View style={styles.itemIconBg}>
                      <MaterialIcons name="calendar-month" size={24} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.itemMonthTitle}>{item.monthLabel}</Text>
                      <Text style={styles.itemEntriesCount}>{item.entries} entries</Text>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemAmount}>{formatCurrency(item.total)}</Text>
                    <MaterialIcons name="chevron-right" size={20} color={Colors.outlineVariant} />
                  </View>
                </View>
              ))
            )}
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
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.headlineLgMobile,
    color: Colors.onSurface,
  },
  monthBadge: {
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  monthBadgeText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '700',
  },
  summaryContainer: {
    marginBottom: 24,
  },
  lifetimeTotalBox: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 16,
    padding: Sizes.cardPadding,
    marginBottom: 16,
    overflow: 'hidden',
    ...Shadows.umber,
  },
  lifetimeBackgroundIcon: {
    position: 'absolute',
    right: -10,
    bottom: -15,
    opacity: 0.08,
  },
  lifetimeLabel: {
    ...Typography.labelLg,
    color: Colors.onPrimaryContainer,
    opacity: 0.9,
  },
  lifetimeValue: {
    ...Typography.headlineLg,
    color: Colors.onPrimaryContainer,
    marginTop: 4,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  growthText: {
    ...Typography.labelSm,
    color: Colors.onPrimaryContainer,
    fontWeight: '600',
    marginLeft: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryMiniBox: {
    width: '48%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.outlineVariant,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    ...Shadows.umber,
  },
  miniBoxLabel: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  miniBoxValue: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  primaryActionButton: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    ...Shadows.umberActive,
  },
  primaryActionButtonText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
    marginLeft: 8,
  },
  secondaryActionButton: {
    flex: 1,
    height: 56,
    borderColor: Colors.secondary,
    borderWidth: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  secondaryActionButtonText: {
    ...Typography.labelLg,
    color: Colors.secondary,
    marginLeft: 8,
  },
  breakdownSection: {
    marginBottom: 24,
  },
  breakdownHeaderTitle: {
    ...Typography.headlineMd,
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: 16,
  },
  breakdownList: {
    width: '100%',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconBg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemMonthTitle: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  itemEntriesCount: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAmount: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    fontWeight: '700',
    marginRight: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.outline,
  },
});
