import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
  Modal,
  AppState,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Shadows } from './src/theme/colors';
import { initDB, getSetting } from './src/utils/db';
import Onboarding from './src/screens/Onboarding';
import Dashboard from './src/screens/Dashboard';
import AddCollection from './src/screens/AddCollection';
import Analytics from './src/screens/Analytics';
import Calendar from './src/screens/Calendar';
import Reports from './src/screens/Reports';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'analytics', 'calendar', 'reports'
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Local authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthenticating = useRef(false);

  const authenticate = async () => {
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

      // If the device does not support biometrics/PIN or has nothing enrolled, bypass
      if (!hasHardware || (!isEnrolled && securityLevel === LocalAuthentication.SecurityLevel.NONE)) {
        setIsAuthenticated(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Thattu Kaasu',
        fallbackLabel: 'Use PIN/Pattern/Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      // Fallback: don't lock user out if API errors out
      setIsAuthenticated(true);
    } finally {
      setTimeout(() => {
        isAuthenticating.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    async function setupApp() {
      try {
        await initDB();
        const onboardingStatus = await getSetting('onboarding_complete');
        if (onboardingStatus === 'true') {
          setIsOnboarded(true);
        }
      } catch (err) {
        console.error('Database initialization failed:', err);
      } finally {
        setDbInitialized(true);
      }
    }
    setupApp();
    authenticate();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (isAuthenticating.current) return;

      if (nextAppState === 'active') {
        authenticate();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Initializing Sacred Accounts...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.lockContainer}>
        <View style={styles.lockContent}>
          <View style={styles.lockIconBg}>
            <MaterialIcons name="lock" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.lockTitle}>Thattu Kaasu</Text>
          <Text style={styles.lockSubtitle}>Locked for Security</Text>
          <Text style={styles.lockDescription}>
            Please authenticate using your device's fingerprint, pattern, or PIN to unlock the app.
          </Text>
          
          <TouchableOpacity style={styles.unlockButton} onPress={authenticate}>
            <MaterialIcons name="fingerprint" size={24} color={Colors.onPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.unlockButtonText}>Unlock Now</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="dark" backgroundColor={Colors.background} />
      </View>
    );
  }

  if (!isOnboarded) {
    return (
      <>
        <Onboarding onComplete={() => setIsOnboarded(true)} />
        <StatusBar style="dark" backgroundColor={Colors.background} />
      </>
    );
  }

  // Render current tab content
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            onAddPress={() => setAddModalVisible(true)} 
            onViewAllRecentPress={() => setCurrentTab('reports')}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'analytics':
        return <Analytics refreshTrigger={refreshTrigger} />;
      case 'calendar':
        return <Calendar refreshTrigger={refreshTrigger} />;
      case 'reports':
        return <Reports refreshTrigger={refreshTrigger} />;
      default:
        return (
          <Dashboard 
            onAddPress={() => setAddModalVisible(true)} 
            onViewAllRecentPress={() => setCurrentTab('reports')}
            refreshTrigger={refreshTrigger}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        {/* Dashboard Tab */}
        <TouchableOpacity
          style={[styles.navItem, currentTab === 'dashboard' && styles.navItemActive]}
          onPress={() => setCurrentTab('dashboard')}
        >
          <MaterialIcons 
            name="dashboard" 
            size={24} 
            color={currentTab === 'dashboard' ? Colors.onPrimaryContainer : Colors.onSurfaceVariant} 
          />
          <Text style={[styles.navLabel, currentTab === 'dashboard' && styles.navLabelActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>



        {/* Analytics Tab */}
        <TouchableOpacity
          style={[styles.navItem, currentTab === 'analytics' && styles.navItemActive]}
          onPress={() => setCurrentTab('analytics')}
        >
          <MaterialIcons 
            name="insights" 
            size={24} 
            color={currentTab === 'analytics' ? Colors.onPrimaryContainer : Colors.onSurfaceVariant} 
          />
          <Text style={[styles.navLabel, currentTab === 'analytics' && styles.navLabelActive]}>
            Analytics
          </Text>
        </TouchableOpacity>

        {/* Calendar Tab */}
        <TouchableOpacity
          style={[styles.navItem, currentTab === 'calendar' && styles.navItemActive]}
          onPress={() => setCurrentTab('calendar')}
        >
          <MaterialIcons 
            name="calendar-today" 
            size={24} 
            color={currentTab === 'calendar' ? Colors.onPrimaryContainer : Colors.onSurfaceVariant} 
          />
          <Text style={[styles.navLabel, currentTab === 'calendar' && styles.navLabelActive]}>
            Calendar
          </Text>
        </TouchableOpacity>

        {/* Reports Tab */}
        <TouchableOpacity
          style={[styles.navItem, currentTab === 'reports' && styles.navItemActive]}
          onPress={() => setCurrentTab('reports')}
        >
          <MaterialIcons 
            name="description" 
            size={24} 
            color={currentTab === 'reports' ? Colors.onPrimaryContainer : Colors.onSurfaceVariant} 
          />
          <Text style={[styles.navLabel, currentTab === 'reports' && styles.navLabelActive]}>
            Reports
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Collection Form Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <AddCollection 
          onSaveSuccess={() => {
            setAddModalVisible(false);
            setRefreshTrigger(prev => prev + 1);
          }}
          onCancel={() => setAddModalVisible(false)}
        />
      </Modal>

      <StatusBar style="dark" backgroundColor={Colors.background} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    ...Typography.labelLg,
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 12 : 20,
    ...Shadows.umber,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: Colors.primaryContainer,
  },
  navLabel: {
    ...Typography.labelSm,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  navLabelActive: {
    color: Colors.onPrimaryContainer,
    fontWeight: '700',
  },
  lockContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockContent: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 320,
  },
  lockIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryFixed,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Shadows.saffronGlow,
  },
  lockTitle: {
    ...Typography.headlineLg,
    color: Colors.primary,
    fontWeight: '800',
    marginBottom: 8,
  },
  lockSubtitle: {
    ...Typography.headlineMd,
    fontSize: 20,
    color: Colors.onSurface,
    fontWeight: '600',
    marginBottom: 16,
  },
  lockDescription: {
    ...Typography.bodyMd,
    textAlign: 'center',
    color: Colors.outline,
    lineHeight: 24,
    marginBottom: 40,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    ...Shadows.umberActive,
  },
  unlockButtonText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
    fontWeight: '700',
  },
});
