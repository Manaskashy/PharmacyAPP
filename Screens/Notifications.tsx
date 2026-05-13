import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNotifications, Notification } from '../Context/NotificationContext';

const Notifications = ({ navigation }: { navigation: any }) => {
  const { notifications, markAsRead, markAllAsRead, clearAll, loading, refreshNotifications } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return 'package-variant-closed';
      case 'promo': return 'tag-outline';
      case 'health': return 'heart-pulse';
      case 'reminder': return 'calendar-clock';
      default: return 'bell-outline';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'order': return '#4ECDC4';
      case 'promo': return '#FF6B6B';
      case 'health': return '#45B7D1';
      case 'reminder': return '#FC913A';
      default: return '#1A535C';
    }
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearAll }
      ]
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Pressable 
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getColor(item.type)}15` }]}>
        <Icon name={getIcon(item.type)} size={24} color={getColor(item.type)} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
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
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>{notifications.length} updates available</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={markAllAsRead} style={styles.headerBtn} disabled={notifications.length === 0}>
              <Icon name="check-all" size={22} color={notifications.length > 0 ? "#4ECDC4" : "#CBD5E0"} />
            </Pressable>
            <Pressable onPress={handleClearAll} style={styles.headerBtn} disabled={notifications.length === 0}>
              <Icon name="delete-outline" size={22} color={notifications.length > 0 ? "#FF6B6B" : "#CBD5E0"} />
            </Pressable>
          </View>
        </View>

        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refreshNotifications}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="bell-off-outline" size={64} color="#E2E8F0" />
              <Text style={styles.emptyTitle}>
                {loading ? 'Fetching updates...' : 'All caught up!'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {loading 
                  ? 'Please wait while we sync your notifications.' 
                  : "You don't have any new notifications at the moment."}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FFF7' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
    minHeight: 64,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  headerTextContainer: { flex: 1, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#1A535C' },
  subtitle: { fontSize: 13, color: '#718096', fontWeight: '500' },
  headerRight: { flexDirection: 'row' },
  headerBtn: { width: 40, height: 44, justifyContent: 'center', alignItems: 'flex-end' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  unreadCard: { elevation: 4, shadowOpacity: 0.08, borderColor: '#E6FFFA', borderWidth: 1 },
  iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748', flex: 1 },
  notifTime: { fontSize: 11, color: '#A0AEC0', fontWeight: '600' },
  notifMessage: { fontSize: 13, color: '#718096', lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ECDC4', position: 'absolute', top: 16, right: 16 },
  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', lineHeight: 20 },
});

export default Notifications;
