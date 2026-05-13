import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const OrderTracking = ({ navigation, route }: { navigation: any; route: any }) => {
  const { order } = route.params || {};

  // Derived data from backend order object
  const orderNumber = order?.id ? `ORD-${order.id.slice(0, 8).toUpperCase()}` : '—';
  const totalAmount = order?.totalAmount ? `₹${order.totalAmount}` : '—';
  const formattedDate = order?.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '—';

  // Process items summary
  const itemsCount = order?.OrderItems?.length || 0;
  const firstItem = order?.OrderItems?.[0];
  const itemsSummary = itemsCount > 0 
    ? (itemsCount > 1 
        ? `${firstItem?.Product?.name} + ${itemsCount - 1} more`
        : `${firstItem?.Product?.name} x ${firstItem?.quantity}`)
    : 'No items';

  // Determine icon and color from first product type
  const getProductDesign = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'medicine': return { icon: 'pill', color: '#FF6B6B' };
      case 'vitamin': return { icon: 'bottle-tonic-plus', color: '#FFD93D' };
      case 'surgical': return { icon: 'hospital-box', color: '#4ECDC4' };
      case 'labtest': return { icon: 'test-tube', color: '#45B7D1' };
      default: return { icon: 'package-variant-closed', color: '#1A535C' };
    }
  };
  const design = getProductDesign(firstItem?.Product?.type || '');

  let currentStep = 0;
  const status = order?.status?.toLowerCase();
  if (status === 'shipped') currentStep = 1;
  else if (status === 'out for delivery') currentStep = 2;
  else if (status === 'delivered') currentStep = 3;

  const steps = [
    {
      title: 'Order Placed',
      subtitle: 'We received your order and it is being processed.',
      icon: 'clipboard-check-outline',
    },
    {
      title: 'Order Shipped',
      subtitle: 'Your package is on its way to the delivery hub.',
      icon: 'truck-fast-outline',
    },
    {
      title: 'Out for Delivery',
      subtitle: 'Our delivery partner is heading to your address.',
      icon: 'bike',
    },
    {
      title: 'Delivered',
      subtitle: 'Your order has been delivered successfully.',
      icon: 'home-check',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return '#48BB78';
      case 'Shipped': return '#4299E1';
      case 'Pending': return '#ECC94B';
      default: return '#A0AEC0';
    }
  };

  const statusColor = getStatusColor(order?.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A535C" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
      {/* ── Hero Header ── */}
      <View style={styles.hero}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="white" />
        </Pressable>

        <View style={styles.heroCenter}>
          <View style={[styles.heroIconRing, { borderColor: `${design.color}60` }]}>
            <View style={[styles.heroIconInner, { backgroundColor: `${design.color}25` }]}>
              <Icon name={design.icon} size={36} color={design.color} />
            </View>
          </View>
          <Text style={styles.heroOrderNum}>{orderNumber}</Text>
          <Text style={styles.heroItems} numberOfLines={1}>{itemsSummary}</Text>

          <View style={[styles.statusPill, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}50` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusPillText, { color: statusColor }]}>{order?.status || 'Pending'}</Text>
          </View>
        </View>

        {/* Decorative circles */}
        <View style={styles.heroBubble1} />
        <View style={styles.heroBubble2} />
      </View>

      <View style={styles.body}>
        {/* ── Timeline ── */}
        <Text style={styles.sectionLabel}>DELIVERY PROGRESS</Text>

        <View style={styles.timeline}>
          {steps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <View key={index} style={styles.stepRow}>
                {/* Left: icon + line */}
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepCircle,
                    isCompleted
                      ? { backgroundColor: '#1A535C', borderColor: '#1A535C' }
                      : { backgroundColor: 'white', borderColor: '#E2E8F0' },
                    isCurrent && styles.stepCircleCurrent,
                  ]}>
                    {isCompleted ? (
                      <Icon name={step.icon} size={18} color="white" />
                    ) : (
                      <Icon name={step.icon} size={18} color="#CBD5E0" />
                    )}
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.stepLine,
                      isCompleted ? styles.stepLineActive : styles.stepLineInactive,
                    ]} />
                  )}
                </View>

                {/* Right: content */}
                <View style={[styles.stepContent, isLast && { paddingBottom: 0 }]}>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>CURRENT</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.stepTitle,
                    isCompleted ? styles.stepTitleActive : styles.stepTitleInactive,
                  ]}>
                    {step.title}
                  </Text>
                  <Text style={[
                    styles.stepSubtitle,
                    isCompleted ? styles.stepSubtitleActive : styles.stepSubtitleInactive,
                  ]}>
                    {step.subtitle}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Order Meta ── */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar-outline" size={20} color="#718096" />
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Icon name="currency-inr" size={20} color="#718096" />
            <Text style={styles.metaLabel}>Total Paid</Text>
            <Text style={styles.metaValue}>{totalAmount}</Text>
          </View>
        </View>

        {/* ── Support Banner ── */}
        <Pressable style={styles.supportBanner} onPress={() => {}}>
          <View style={styles.supportLeft}>
            <View style={styles.supportIconBox}>
              <Icon name="headset" size={22} color="#1A535C" />
            </View>
            <View>
              <Text style={styles.supportTitle}>Need help?</Text>
              <Text style={styles.supportSub}>Contact 24/7 support</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={22} color="#1A535C" />
        </Pressable>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },

  // Hero
  hero: {
    backgroundColor: '#1A535C',
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  heroCenter: {
    alignItems: 'center',
  },
  heroIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOrderNum: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroItems: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    marginBottom: 16,
    maxWidth: width - 80,
    textAlign: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroBubble1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -60,
    right: -60,
  },
  heroBubble2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -40,
    left: -30,
  },

  // Body
  body: {
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#F0F4F8',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A0AEC0',
    letterSpacing: 1.5,
    marginBottom: 20,
  },

  // Timeline
  timeline: {
    marginBottom: 28,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepLeft: {
    alignItems: 'center',
    width: 44,
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircleCurrent: {
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginVertical: 4,
  },
  stepLineActive: {
    backgroundColor: '#1A535C',
  },
  stepLineInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepContent: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 28,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#C6F6D5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#276749',
    letterSpacing: 0.8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  stepTitleActive: {
    color: '#1A202C',
  },
  stepTitleInactive: {
    color: '#CBD5E0',
  },
  stepSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  stepSubtitleActive: {
    color: '#718096',
  },
  stepSubtitleInactive: {
    color: '#E2E8F0',
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaDivider: {
    width: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
  },

  // Support
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6FFFA',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A535C',
    marginBottom: 2,
  },
  supportSub: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '500',
  },
});

export default OrderTracking;
