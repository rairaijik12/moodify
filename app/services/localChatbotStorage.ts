import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAT_HISTORY_KEY = 'chatbot_history';

export interface ChatMessage {
  role?: 'system' | 'user' | 'assistant';
  text: string;
  sender: 'user' | 'bot';
}

export const getLocalChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const json = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error getting chat history:', e);
    return [];
  }
};

export const saveLocalChatHistory = async (history: ChatMessage[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
};

export const clearLocalChatHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (e) {
    console.error('Error clearing chat history:', e);
  }
}; 