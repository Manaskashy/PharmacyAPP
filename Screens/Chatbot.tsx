import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import * as DocumentPicker from '@react-native-documents/picker';

// ── Config ─────────────────────────────────────────────────────────────────
// Update this to your machine's current IP address (same as your main API)
const CHATBOT_URL = 'http://172.22.156.160:8000';

// ── Types ──────────────────────────────────────────────────────────────────
type RootStackParamList = { Chatbot: undefined; Home: undefined };
type ChatbotNavProp = StackNavigationProp<RootStackParamList, 'Chatbot'>;

interface Props {
  navigation: ChatbotNavProp;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  username?: string;
}

// ── Typing Indicator Component ─────────────────────────────────────────────
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
          Animated.delay(600),
        ])
      ).start();

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingBubble}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
};

// ── Message Bubble Component ────────────────────────────────────────────────
const MessageBubble = React.memo(({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 30 : -30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowBot,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={styles.botAvatar}>
          <Icon name="robot-excited" size={16} color="#fff" />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampBot]}>
          {timeStr}
        </Text>
      </View>
    </Animated.View>
  );
});

// ── Main Chatbot Screen ─────────────────────────────────────────────────────
const Chatbot = ({ navigation }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Hello! I\'m **MedBot**, your AI health assistant.\n\nDescribe your symptoms and I\'ll help identify possible conditions and suggest medicines based on your health profile.\n\n⚠️ *This is for informational purposes only. Always consult a doctor for medical decisions.*',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load user profile from AsyncStorage on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const raw = await AsyncStorage.getItem('userData');
        if (raw) {
          const userData = JSON.parse(raw);
          // Extract age/weight/height if stored in profile
          const profile: UserProfile = {
            username: userData.username || userData.name,
            age: userData.age ? Number(userData.age) : undefined,
            weight: userData.weight ? Number(userData.weight) : undefined,
            height: userData.height ? Number(userData.height) : undefined,
          };
          setUserProfile(profile);
        }
      } catch (e) {
        console.error('Failed to load user profile for chatbot:', e);
      } finally {
        setProfileLoaded(true);
      }
    };
    loadProfile();
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    Keyboard.dismiss();
    setInput('');

    // Add user message
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    scrollToBottom();

    try {
      // Build history (exclude welcome message)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const body = {
        message: trimmed,
        age: userProfile.age ?? null,
        weight: userProfile.weight ?? null,
        height: userProfile.height ?? null,
        history,
      };

      const response = await fetch(`${CHATBOT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `❌ Could not connect to MedBot. Please ensure the chatbot server is running.\n\nError: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [input, isLoading, messages, userProfile, scrollToBottom]);

  const pickPrescription = useCallback(async () => {
    if (isAnalyzing || isLoading) return;
    
    try {
      const [result] = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        mode: 'open',
      });

      if (!result) return;

      setIsAnalyzing(true);
      setIsLoading(true);
      
      // Add a system message about analyzing
      const systemMsg: Message = {
        id: `sys_${Date.now()}`,
        role: 'assistant',
        content: `📤 **Uploading prescription...**\nFile: ${result.name || 'prescription.jpg'}\n\nI'm analyzing the handwriting and extracting medicines. Please wait...`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMsg]);
      scrollToBottom();

      const formData = new FormData();
      formData.append('file', {
        uri: result.uri,
        name: result.name || 'prescription.jpg',
        type: result.type || 'image/jpeg',
      } as any);

      const response = await fetch(`${CHATBOT_URL}/analyze-prescription`, {
        method: 'POST',
        body: formData,
        // Do not set Content-Type manually, fetch will do it with the correct boundary
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Analysis result:', data);

      if (!data.analysis) {
        throw new Error('Analysis result was empty.');
      }
      
      const botMsg: Message = {
        id: `bot_ana_${Date.now()}`,
        role: 'assistant',
        content: data.analysis,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error('Prescription picker error:', err);
        const errMsg: Message = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `❌ Failed to analyze prescription. ${err.message}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errMsg]);
      }
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
      scrollToBottom();
    }
  }, [isAnalyzing, isLoading, scrollToBottom]);

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_new',
        role: 'assistant',
        content: '🔄 Chat cleared. How can I help you today? Describe your symptoms.',
        timestamp: new Date(),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1B2D" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarBg}>
            <Icon name="robot-excited-outline" size={20} color="#4ECDC4" />
          </View>
          <View>
            <Text style={styles.headerTitle}>MedBot</Text>
            <Text style={styles.headerSubtitle}>
              {profileLoaded && (userProfile.age || userProfile.weight)
                ? `Profile loaded · AI Health Assistant`
                : 'AI Health Assistant'}
            </Text>
          </View>
        </View>
        <Pressable style={styles.clearBtn} onPress={clearChat}>
          <Icon name="delete-sweep-outline" size={20} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </View>

      {/* ── Profile Chip ── */}
      {profileLoaded && (userProfile.age || userProfile.weight || userProfile.height) && (
        <View style={styles.profileChipRow}>
          <View style={styles.profileChip}>
            <Icon name="account-check" size={13} color="#4ECDC4" />
            <Text style={styles.profileChipText}>
              {[
                userProfile.age ? `Age: ${userProfile.age}y` : null,
                userProfile.weight ? `${userProfile.weight}kg` : null,
                userProfile.height ? `${userProfile.height}cm` : null,
              ]
                .filter(Boolean)
                .join('  ·  ')}
            </Text>
          </View>
        </View>
      )}

      {/* ── Chat Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing Indicator */}
        {isLoading && (
          <View style={styles.typingRow}>
            <View style={styles.botAvatar}>
              <Icon name="robot-excited" size={16} color="#fff" />
            </View>
            <TypingIndicator />
          </View>
        )}

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <Pressable
            style={[styles.attachBtn, (isAnalyzing || isLoading) && styles.disabledBtn]}
            onPress={pickPrescription}
            disabled={isAnalyzing || isLoading}
          >
            <Icon name="paperclip" size={24} color="#4ECDC4" />
          </Pressable>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Describe symptoms or upload Rx…"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
            />
          </View>
          <Pressable
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1B2D',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F1B2D',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(78,205,196,0.15)',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 10,
  },
  headerAvatarBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(78,205,196,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(78,205,196,0.3)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 1,
  },
  clearBtn: {
    padding: 8,
    borderRadius: 12,
  },

  // Profile chip
  profileChipRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0F1B2D',
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(78,205,196,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.2)',
  },
  profileChipText: {
    color: '#4ECDC4',
    fontSize: 11,
    fontWeight: '600',
  },

  // Chat list
  chatList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },

  // Message rows
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },

  // Bot avatar
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },

  // Bubbles
  bubble: {
    maxWidth: '78%',
    padding: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#4ECDC4',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#1A2D45',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.12)',
  },
  bubbleText: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: '#fff',
    fontWeight: '500',
  },
  bubbleTextBot: {
    color: '#E2E8F0',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  timestampBot: {
    color: 'rgba(226,232,240,0.4)',
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#1A2D45',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.12)',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4ECDC4',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F1B2D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(78,205,196,0.1)',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#1A2D45',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.2)',
    minHeight: 46,
    maxHeight: 120,
    justifyContent: 'center',
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(78,205,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.2)',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  textInput: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(78,205,196,0.3)',
    elevation: 0,
  },
});

export default Chatbot;
