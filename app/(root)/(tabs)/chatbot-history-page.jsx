import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, ActivityIndicator, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWindowDimensions } from "react-native";

const { height, width } = Dimensions.get("window");

/**
 * @typedef {Object} LocalChatbotMessage
 * @property {string} text - The message text
 * @property {'user' | 'bot'} sender - Who sent the message
 * @property {string} [timestamp] - Optional timestamp of when the message was sent
 */

/**
 * @typedef {Object} LocalChatbotSession
 * @property {string} sessionId - Unique identifier for the session
 * @property {string} startTime - When the session started
 * @property {string} [endTime] - Optional time when the session ended
 * @property {LocalChatbotMessage[]} messages - Array of messages in the session
 */

/**
 * Get all chat sessions from local storage
 * @returns {Promise<LocalChatbotSession[]>} Array of chat sessions
 */
async function getLocalChatSessions() {
  const sessions = await AsyncStorage.getItem('chatbot_sessions');
  return sessions ? JSON.parse(sessions) : [];
}

/**
 * Delete a chat session from local storage
 * @param {string} sessionId - ID of the session to delete
 */
async function deleteLocalChatSession(sessionId) {
  const sessions = await getLocalChatSessions();
  const filtered = sessions.filter(s => s.sessionId !== sessionId);
  await AsyncStorage.setItem('chatbot_sessions', JSON.stringify(filtered));
}

/**
 * Component to view a single chat session
 * @param {Object} props
 * @param {LocalChatbotSession} props.session - The session to display
 * @param {Function} props.onBack - Function to call when going back
 */
function ChatSessionViewer({ session, onBack }) {
  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <StatusBar style="light" />
      <View className="flex-row items-center p-4 border-b border-[#2A2A2A]">
        <TouchableOpacity onPress={onBack} className="mr-4 p-2">
          <Ionicons name="arrow-back" size={24} color="#FF6B35" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">
          {format(new Date(session.startTime), "MMM d, yyyy")}
        </Text>
      </View>
      <ScrollView 
        className="flex-1 px-4" 
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {session.messages.length === 0 ? (
          <View className="items-center justify-center h-40">
            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#444" />
            <Text className="text-[#888] text-center mt-4 text-base">No messages in this session</Text>
          </View>
        ) : (
          session.messages.map((msg, idx) => (
            <View key={idx} className={`mb-4 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <View 
                className={`rounded-2xl p-4 max-w-[85%] shadow-sm`} 
                style={{ 
                  backgroundColor: msg.sender === 'user' ? '#FF6B35' : '#2A2A2A',
                  marginLeft: msg.sender === 'user' ? 'auto' : 0,
                  marginRight: msg.sender === 'bot' ? 'auto' : 0,
                }}
              >
                <Text 
                  className={`text-[16px] leading-[22px] ${msg.sender === 'user' ? "text-white" : "text-[#F0F0F0]"}`}
                  style={{ fontWeight: '400' }}
                >
                  {msg.text}
                </Text>
              </View>
              <Text 
                className="text-xs mt-1 text-[#888]"
                style={{ 
                  marginLeft: msg.sender === 'user' ? 'auto' : 4,
                  marginRight: msg.sender === 'bot' ? 'auto' : 4
                }}
              >
                {msg.timestamp ? format(new Date(msg.timestamp), "h:mm a") : ''}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * ChatbotHistoryPage Component
 * Displays a list of past chat sessions and allows viewing/deleting them
 */
export default function ChatbotHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const sess = await getLocalChatSessions();
      setSessions(sess);
      setLoading(false);
    };
    fetchSessions();
  }, []);

  // Sort sessions based on sortOrder
  const sortedSessions = [...sessions].sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
  });

  /**
   * Handle deleting a chat session
   * @param {string} sessionId - ID of the session to delete
   */
  const handleDeleteSession = (sessionId) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this chat session? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            await deleteLocalChatSession(sessionId);
            const updated = await getLocalChatSessions();
            setSessions(updated);
          }
        }
      ]
    );
  };

  if (selectedSession) {
    return <ChatSessionViewer session={selectedSession} onBack={() => setSelectedSession(null)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <StatusBar style="light" />
      <View className="items-center w-full pt-6 px-4 pb-2 border-b border-[#2A2A2A]">
        <Text className="text-2xl font-bold text-white mb-6">Chat History</Text>
        {/* Sorting Controls */}
        <View className="flex-row justify-center w-full mb-4">
          <TouchableOpacity
            onPress={() => setSortOrder('newest')}
            className={`py-2 px-4 rounded-full mr-2 ${sortOrder === 'newest' ? "bg-[#FF6B35]" : "bg-[#2A2A2A]"}`}
          >
            <Text className={`font-medium ${sortOrder === 'newest' ? "text-white" : "text-[#FF6B35]"}`}>Newest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortOrder('oldest')}
            className={`py-2 px-4 rounded-full ${sortOrder === 'oldest' ? "bg-[#FF6B35]" : "bg-[#2A2A2A]"}`}
          >
            <Text className={`font-medium ${sortOrder === 'oldest' ? "text-white" : "text-[#FF6B35]"}`}>Oldest</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4 pt-4" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {sortedSessions.length === 0 ? (
            <View className="items-center justify-center h-60">
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#444" />
              <Text className="text-[#888] text-center mt-4 text-base">No chat history found</Text>
            </View>
          ) : (
            sortedSessions.map((session) => (
              <View
                key={session.sessionId}
                className="mb-3 overflow-hidden rounded-xl bg-[#1E1E1E] shadow-sm"
              >
                <TouchableOpacity
                  className="flex-1 p-4 border-b border-[#2A2A2A]"
                  onPress={() => setSelectedSession(session)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="chatbubble-ellipses" size={20} color="#FF6B35" />
                      <Text className="text-white text-lg font-semibold ml-2">
                        {format(new Date(session.startTime), "MMM d, yyyy")}
                      </Text>
                    </View>
                    <Text className="text-[#999] text-sm">
                      {format(new Date(session.startTime), "h:mm a")}
                    </Text>
                  </View>
                  
                  <View className="mt-2">
                    <Text className="text-[#BBB] text-sm" numberOfLines={1}>
                      {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <View className="bg-[#1A1A1A] py-2 px-4 flex-row justify-end">
                  <TouchableOpacity
                    onPress={() => handleDeleteSession(session.sessionId)}
                    className="p-2"
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3535" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
} 