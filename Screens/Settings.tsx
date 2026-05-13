import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = ({ navigation }: { navigation: any }) => {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(true);

  // Load settings on mount
  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.notifications);
        setMarketing(parsed.marketing);
        setDarkMode(parsed.darkMode);
        setBiometric(parsed.biometric);
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const saveSettings = async (updates: any) => {
    try {
      const current = { notifications, marketing, darkMode, biometric, ...updates };
      await AsyncStorage.setItem('app_settings', JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const toggleNotifications = (val: boolean) => {
    setNotifications(val);
    saveSettings({ notifications: val });
  };

  const toggleMarketing = (val: boolean) => {
    setMarketing(val);
    saveSettings({ marketing: val });
  };

  const toggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    saveSettings({ darkMode: val });
  };

  const toggleBiometric = (val: boolean) => {
    setBiometric(val);
    saveSettings({ biometric: val });
  };

  const SettingItem = ({ icon, label, subLabel, value, onToggle, onPress, type = 'toggle' }: any) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Icon name={icon} size={22} color="#1A535C" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingLabel}>{label}</Text>
          {subLabel && <Text style={styles.settingSubLabel}>{subLabel}</Text>}
        </View>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E2E8F0', true: '#4ECDC4' }}
          thumbColor={value ? '#1A535C' : '#F4F3F4'}
        />
      ) : (
        <Icon name="chevron-right" size={20} color="#CBD5E0" />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF7" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#1A535C" />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Preferences and security</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem 
            icon="bell-outline" 
            label="Push Notifications" 
            subLabel="Alerts about orders and health tips" 
            value={notifications}
            onToggle={toggleNotifications}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="email-outline" 
            label="Marketing Emails" 
            subLabel="New offers and discounts" 
            value={marketing}
            onToggle={toggleMarketing}
          />

          <Text style={styles.sectionTitle}>Security & Privacy</Text>
          <SettingItem 
            icon="fingerprint" 
            label="Biometric Login" 
            subLabel="Use Fingerprint/FaceID to login" 
            value={biometric}
            onToggle={toggleBiometric}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="shield-lock-outline" 
            label="Privacy Settings" 
            type="link"
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon')}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="file-document-outline" 
            label="Terms of Service" 
            type="link"
            onPress={() => Alert.alert('Terms', 'Terms of service coming soon')}
          />

          <Text style={styles.sectionTitle}>App Preferences</Text>
          <SettingItem 
            icon="weather-night" 
            label="Dark Mode" 
            subLabel="Easier on the eyes at night" 
            value={darkMode}
            onToggle={toggleDarkMode}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="translate" 
            label="Language" 
            subLabel="English (US)"
            type="link"
            onPress={() => Alert.alert('Language', 'Language selection coming soon')}
          />

          <View style={styles.footerInfo}>
            <Text style={styles.versionText}>Version 1.0.4 (Build 42)</Text>
            <Text style={styles.copyrightText}>© 2026 Antigravity Pharmacy App</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FFF7',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
    position: 'relative',
    minHeight: 64,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A535C',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A0AEC0',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 32,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  settingSubLabel: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 4,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 40,
  },
  versionText: {
    fontSize: 13,
    color: '#A0AEC0',
    fontWeight: '700',
  },
  copyrightText: {
    fontSize: 12,
    color: '#CBD5E0',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default Settings;
