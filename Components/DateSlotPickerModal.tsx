import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import appointmentService from '../Services/appointmentService';

interface DateSlotPickerModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  accentColor: string;
  icon: string;
  mode: 'doctor' | 'homecare';
  entityId: string;
  onConfirm: (date: string, timeSlot: string) => void;
  confirmLoading?: boolean;
}

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

const formatDisplayTime = (slot: string) => slot;

const getNext14Days = () => {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isTimeSlotPassed = (slot: string) => {
  const [time, period] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  const now = new Date();
  const slotDate = new Date();
  slotDate.setHours(hours, minutes, 0, 0);
  
  return slotDate < now;
};

const DateSlotPickerModal: React.FC<DateSlotPickerModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  accentColor,
  icon,
  mode,
  entityId,
  onConfirm,
  confirmLoading = false,
}) => {
  const days = getNext14Days();
  const [selectedDate, setSelectedDate] = useState<Date>(days[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchSlots = useCallback(async (date: Date) => {
    if (mode !== 'doctor') return; // HomeCare has no slot-check endpoint
    setLoadingSlots(true);
    setUnavailableSlots([]);
    try {
      const result = await appointmentService.getUnavailableSlots(
        entityId,
        formatDateKey(date)
      );
      setUnavailableSlots(result.unavailableSlots || []);
    } catch (err) {
      // silently fail — treat all slots as available
    } finally {
      setLoadingSlots(false);
    }
  }, [entityId, mode]);

  useEffect(() => {
    if (visible) {
      setSelectedDate(days[0]);
      setSelectedSlot(null);
      fetchSlots(days[0]);
    }
  }, [visible]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchSlots(date);
  };

  const isUnavailable = (slot: string) => {
    // 1. Check if the slot is full (from backend)
    if (unavailableSlots.includes(slot)) return true;
    
    // 2. Check if the time has passed already (only for today)
    const isToday = formatDateKey(selectedDate) === formatDateKey(new Date());
    if (isToday && isTimeSlotPassed(slot)) return true;
    
    return false;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: `${accentColor}18` }]}>
              <Icon name={icon} size={28} color={accentColor} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={22} color="#718096" />
            </TouchableOpacity>
          </View>

          {/* Section: Select Date */}
          <Text style={styles.sectionLabel}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStrip}
          >
            {days.map((day, idx) => {
              const isSelected = formatDateKey(day) === formatDateKey(selectedDate);
              const isToday = idx === 0;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCard,
                    isSelected && { backgroundColor: accentColor, borderColor: accentColor },
                  ]}
                  onPress={() => handleDateSelect(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                    {isToday ? 'Today' : DAY_NAMES[day.getDay()]}
                  </Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                    {day.getDate()}
                  </Text>
                  <Text style={[styles.dayMonth, isSelected && styles.dayMonthSelected]}>
                    {MONTH_NAMES[day.getMonth()]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Section: Select Time */}
          <Text style={styles.sectionLabel}>
            Select Time
            {loadingSlots && (
              <Text style={styles.checkingText}>  Checking availability...</Text>
            )}
          </Text>

          {loadingSlots ? (
            <View style={styles.slotsLoadingContainer}>
              <ActivityIndicator size="small" color={accentColor} />
              <Text style={[styles.slotsLoadingText, { color: accentColor }]}>
                Fetching available slots...
              </Text>
            </View>
          ) : (
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.map((slot) => {
                const unavailable = isUnavailable(slot);
                const selected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    disabled={unavailable}
                    onPress={() => setSelectedSlot(slot)}
                    style={[
                      styles.slotChip,
                      selected && { backgroundColor: accentColor, borderColor: accentColor },
                      unavailable && styles.slotChipUnavailable,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.slotText,
                      selected && styles.slotTextSelected,
                      unavailable && styles.slotTextUnavailable,
                    ]}>
                      {formatDisplayTime(slot)}
                    </Text>
                    {unavailable && (
                      <Text style={styles.slotFullLabel}>
                        {unavailableSlots.includes(slot) ? 'Full' : 'Passed'}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              { backgroundColor: accentColor },
              (!selectedSlot || loadingSlots) && styles.confirmBtnDisabled,
            ]}
            disabled={!selectedSlot || loadingSlots || confirmLoading}
            onPress={() => {
              if (selectedSlot) {
                onConfirm(formatDateKey(selectedDate), selectedSlot);
              }
            }}
          >
            {confirmLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="calendar-check" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.confirmBtnText}>
                  {selectedSlot
                    ? `Book for ${formatDisplayTime(selectedSlot)}`
                    : 'Select a Time Slot'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4A5568',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  checkingText: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '500',
    textTransform: 'none',
    letterSpacing: 0,
  },
  dateStrip: {
    paddingBottom: 16,
    paddingRight: 8,
  },
  dayCard: {
    width: 60,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#F7FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0AEC0',
    marginBottom: 4,
  },
  dayNameSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  dayNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2D3748',
    marginBottom: 2,
  },
  dayNumSelected: {
    color: 'white',
  },
  dayMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  dayMonthSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  slotsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  slotsLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  slotChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    minWidth: 88,
  },
  slotChipUnavailable: {
    backgroundColor: '#F7FAFC',
    borderColor: '#EDF2F7',
    opacity: 0.45,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
  },
  slotTextSelected: {
    color: 'white',
  },
  slotTextUnavailable: {
    color: '#A0AEC0',
  },
  slotFullLabel: {
    fontSize: 10,
    color: '#E53E3E',
    fontWeight: '700',
    marginTop: 2,
  },
  confirmBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  confirmBtnDisabled: {
    opacity: 0.45,
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default DateSlotPickerModal;
