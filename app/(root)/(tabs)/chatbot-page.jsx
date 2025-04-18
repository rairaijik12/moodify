import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Image, Keyboard, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format, subMonths, addMonths } from "date-fns";
import images from "@/constants/images";
import { useWindowDimensions } from "react-native";
import ChatbotRatingModal from "./chatbot-rating-modal";
import { 
  startChatbotSession, 
  endChatbotSession, 
  addChatbotRating
} from "@/app/services/chatbotService";
import { getUserFromLocalStorage, updateUserXP, fetchUserXP, awardUserXP, ensureXpRowExists } from "@/app/services/userService";
import { getLocalChatHistory, saveLocalChatHistory, clearLocalChatHistory } from "@/app/services/localChatbotStorage";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from '@/supabaseConfig';
import ConfettiCannon from 'react-native-confetti-cannon';
import ChatbotStartScreen from "./chatbot-start";

const { height, width} = Dimensions.get("window");

async function saveLocalChatSession(session) {
  const sessions = await AsyncStorage.getItem('chatbot_sessions');
  const sessionsArr = sessions ? JSON.parse(sessions) : [];
  sessionsArr.push(session);
  await AsyncStorage.setItem('chatbot_sessions', JSON.stringify(sessionsArr));
}

function getChatbotXpDateKey(user) {
  if (!user || !user.user_id) return null;
  return `lastChatbotXpClaimDate_${user.user_id}`;
}

function ChatbotPage() {
  const [messages, setMessages] = useState([
    { text: "Hey there! I'm Moodi, your AI friend! Just checking in—how's your day?", sender: "bot", role: "assistant", timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { width, height } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const navigation = useNavigation();
  const [sessionStartTime, setSessionStartTime] = useState(new Date().toISOString());
  const [showClaimXP, setShowClaimXP] = useState(false);
  const [pendingXP, setPendingXP] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load user and start session
  useEffect(() => {
    const init = async () => {
      // Load local chat history
      let localMessages = await getLocalChatHistory();
      if (localMessages && localMessages.length > 0) {
        // Ensure all messages have a timestamp and role
        const normalizedMessages = localMessages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp || new Date().toISOString(),
          role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
        }));
        setMessages(normalizedMessages);
      }
      // Get user from local storage
      const user = await getUserFromLocalStorage();
      console.log('Loaded user:', user);
      if (user && user.user_id) {
        setUserId(user.user_id.toString());
        // Start a new chatbot session
        const session = await startChatbotSession();
        console.log('Started chatbot session:', session);
        if (session && session.chat_session_id) {
          setCurrentSession(session);
        } else {
          // Session creation failed
          alert('Failed to start chatbot session. Please try again later.');
        }
      } else {
        alert('User not found. Please log in again.');
      }
      setSessionStartTime(new Date().toISOString());
      setInitializing(false);
    };
    init();
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { 
      text: input, 
      sender: "user", 
      role: "user", 
      timestamp: new Date().toISOString() 
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setInput("");
    await saveLocalChatHistory(updatedMessages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp || new Date().toISOString(),
      role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
    })));

    // Simulate bot response
    setTimeout(async () => {
      const botResponse = {
        text: getDefaultResponse(input),
        sender: "bot",
        role: "assistant",
        timestamp: new Date().toISOString()
      };
      const newMessages = [...updatedMessages, botResponse];
      setMessages(newMessages);
      await saveLocalChatHistory(newMessages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString(),
        role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
      })));
      setIsLoading(false);
    }, 1500);
  };

  // Function to get a default response based on user input
  const getDefaultResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
      return "Hello there! It's great to chat with you. How are you feeling today?";
    } else if (lowerInput.includes("how are you")) {
      return "I'm doing well, thanks for asking! I'm here to chat with you and help you track your moods.";
    } else if (lowerInput.includes("bad") || lowerInput.includes("sad") || lowerInput.includes("unhappy")) {
      return "I'm sorry to hear you're not feeling great. Remember that it's okay to have off days. Would you like to talk more about what's bothering you?";
    } else if (lowerInput.includes("good") || lowerInput.includes("great") || lowerInput.includes("happy")) {
      return "That's wonderful to hear! It's always nice to celebrate the good moments. What's been making you feel good today?";
    } else if (lowerInput.includes("thank")) {
      return "You're welcome! I'm always here if you need someone to talk to.";
    } else if (lowerInput.includes("help")) {
      return "I'm here to help! You can talk to me about how you're feeling, or I can help you track your moods. What would you like to chat about?";
    } else {
      return "Thanks for sharing that. How has the rest of your day been going?";
    }
  };

  // Functions to change month
  const goToPreviousMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const goToNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));
  
  // Function to handle END button press
  const handleEndChat = async () => {
    // Save the current session to local storage
    const session = {
      sessionId: sessionStartTime,
      startTime: sessionStartTime,
      endTime: new Date().toISOString(),
      messages: messages.map((msg) => ({ ...msg, timestamp: new Date().toISOString() })),
    };
    await saveLocalChatSession(session);
    setSessionStartTime(new Date().toISOString()); // Start a new session
    setRatingModalVisible(true);
  };

  // Function to handle rating submission
  const handleRatingSubmit = async (rating, feedback) => {
    try {
      if (currentSession?.chat_session_id) {
        // End the session
        await endChatbotSession(currentSession.chat_session_id);
        // Save the rating
        await addChatbotRating(currentSession.chat_session_id, rating, feedback);
        console.log("Chat session ended and rated:", rating, feedback);
      }
      // Instead of awarding XP here, show the Claim XP modal only if not already claimed today (per user)
      const user = await getUserFromLocalStorage();
      const todayDateString = format(new Date(), "yyyy-MM-dd");
      const userKey = getChatbotXpDateKey(user);
      if (!userKey) {
        console.warn('No valid userKey for chatbot XP claim.');
        return;
      }
      const lastChatbotXpClaimDate = await AsyncStorage.getItem(userKey);
      if (lastChatbotXpClaimDate !== todayDateString) {
        setPendingXP(20);
        setShowClaimXP(true);
      } else {
        setPendingXP(0);
        setShowClaimXP(false);
      }
    } catch (error) {
      console.error("Error ending chat session:", error);
    } finally {
      setRatingModalVisible(false);
      // Reset for a new session
      setCurrentSession(null);
      setMessages([
        { text: "Hey there! I'm Moodi, your AI friend! Just checking in—how's your day?", sender: "bot", role: "assistant", timestamp: new Date().toISOString() }
      ]);
      await saveLocalChatHistory([
        { text: "Hey there! I'm Moodi, your AI friend! Just checking in—how's your day?", sender: "bot", role: "assistant", timestamp: new Date().toISOString() }
      ]);
      // Start a new session
      if (userId) {
        const session = await startChatbotSession();
        if (session && session.chat_session_id) {
          setCurrentSession(session);
          console.log("Started new chatbot session:", session.chat_session_id);
        }
      }
    }
  };

  // If still initializing, show loading
  if (initializing) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <StatusBar style="light" hidden={false} translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className="text-white mt-4">Loading chat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} translucent backgroundColor="transparent" />

      {/* Restore original background image */}
      <Image
        source={images.chatbotbg}
        style={{
          position: "absolute",
          bottom: (height * -0.06) - 10,
          width: width,
          height: height * 1,
          resizeMode: "contain",
        }}
      />

      {/* Top Bar with Date, Navigation, and End Chat */}
      <View className="w-full" style={{ paddingTop: 11, paddingHorizontal: 16 }}>
        <View className="flex-row justify-between items-center w-full mb-2">
          {/* Date and navigation */}
          <View className="flex-row items-center">
            <TouchableOpacity onPress={goToPreviousMonth}>
              <Ionicons name="chevron-back-outline" size={24} color="#FF6B35" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B35', marginHorizontal: 8 }}>
              {format(selectedMonth, "EEE, MMMM yyyy")}
            </Text>
            <TouchableOpacity onPress={goToNextMonth}>
              <Ionicons name="chevron-forward-outline" size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          {/* End Chat button */}
          <TouchableOpacity
            style={{ backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 16 }}
            onPress={handleEndChat}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>End Chat</Text>
          </TouchableOpacity>
        </View>
        {/* History Button below End Chat */}
        <View style={{ alignItems: 'flex-end', width: '100%', marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChatbotHistoryPage')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFF6F0',
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 16,
              marginRight: 0,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Ionicons name="time-outline" size={22} color="#FF6B35" style={{ marginRight: 6 }} />
            <Text style={{ color: '#FF6B35', fontWeight: 'bold', fontSize: 16 }}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mascot image (optional, if you want to add it) */}
      {/* <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Image source={images.moodiMascot} style={{ width: 80, height: 80 }} />
      </View> */}

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4 py-2"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            return (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    backgroundColor: isUser ? '#222' : '#FFF',
                    borderRadius: 18,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    maxWidth: '80%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Text style={{ color: isUser ? '#FFF' : '#000746', fontSize: 18 }}>{msg.text}</Text>
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 6, textAlign: isUser ? 'right' : 'left' }}>
                    {format(new Date(msg.timestamp), "hh:mm a - dd MMM yyyy")}
                  </Text>
                </View>
              </View>
            );
          })}
          {isLoading && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 12 }}>
              <View style={{ backgroundColor: '#FFF', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16, maxWidth: '80%' }}>
                <Text style={{ color: '#000746', fontSize: 18 }}>Typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Field */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24, backgroundColor: 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 32, paddingHorizontal: 16, paddingVertical: 8 }}>
            <TextInput
              style={{ flex: 1, color: '#FFF', fontSize: 18, paddingVertical: 8 }}
              placeholder="Talk with Moodi..."
              placeholderTextColor="#AAA"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity 
              style={{ marginLeft: 8, padding: 10 }}
              onPress={sendMessage}
              disabled={isLoading}
            >
              <Ionicons name="send" size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {/* Prevent closing by back button */}}
      >
        <ChatbotRatingModal 
          onSubmit={handleRatingSubmit} 
          visible={ratingModalVisible}
          // Modal can only be closed via the submit function
        />
      </Modal>

      {/* Claim XP Modal */}
      <Modal
        visible={showClaimXP}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowClaimXP(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <View style={{ backgroundColor: '#003049', borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, width: width * 0.9, position: 'relative' }}>
            {/* Confetti only when claimed */}
            {showConfetti && (
              <ConfettiCannon 
                count={250} 
                origin={{ x: width / 2, y: 0 }} 
                fadeOut={true} 
                autoStart={true}
                onAnimationEnd={() => {
                  setShowConfetti(false);
                  setShowClaimXP(false);
                  setPendingXP(0);
                }}
              />
            )}
            {/* Optional mascot image */}
            {images.moodiwave && (
              <Image
                source={images.moodiwave}
                style={{ width: 200, height: 120, marginBottom: 10 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ fontFamily: 'LeagueSpartan-Bold', color: '#FF6B35', marginBottom: 10, textAlign: 'center', fontSize: 32 }}>Chat Complete!</Text>
            <Text style={{ fontFamily: 'LeagueSpartan-Regular', color: '#EEEED0', marginBottom: 25, textAlign: 'center', fontSize: 20 }}>Claim your {pendingXP} XP reward for chatting with Moodi!</Text>
            <View style={{ flexDirection: 'row', backgroundColor: '#F6C49E', borderRadius: 10, padding: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 25 }}>
              <Text style={{ fontFamily: 'LeagueSpartan-Bold', color: '#004E89', textAlign: 'center', fontSize: 28 }}>+{pendingXP} XP</Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: '#FF6B35', borderRadius: 30, paddingVertical: 15, paddingHorizontal: 40, alignItems: 'center', marginTop: 10 }}
              onPress={async () => {
                const todayDateString = format(new Date(), "yyyy-MM-dd");
                const user = await getUserFromLocalStorage();
                const userKey = getChatbotXpDateKey(user);
                if (!userKey) {
                  console.warn('No valid userKey for chatbot XP claim in claim button.');
                  setShowClaimXP(false);
                  setPendingXP(0);
                  return;
                }
                const lastChatbotXpClaimDate = await AsyncStorage.getItem(userKey);
                if (lastChatbotXpClaimDate === todayDateString) {
                  setShowClaimXP(false);
                  setPendingXP(0);
                  return;
                }
                if (user) {
                  await ensureXpRowExists(user.user_id);
                  await awardUserXP(user.user_id, pendingXP);
                  await AsyncStorage.setItem(userKey, todayDateString);
                }
                setShowConfetti(true);
              }}
            >
              <Text style={{ fontFamily: 'LeagueSpartan-Bold', color: '#EEEED0', fontSize: 25 }}>Claim XP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default ChatbotPage;