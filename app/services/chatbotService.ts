import supabase from '@/supabaseConfig';
import { getUserFromLocalStorage } from './userService';

// Define types for chatbot sessions
export interface ChatbotSession {
  chat_session_id?: number;
  user_id: number;
  start_time: string;
  end_time?: string;
}

// Define types for chatbot messages
export interface ChatbotMessage {
  id?: string;
  chat_session_id: number;
  is_user: boolean;
  message: string;
  timestamp?: string;
}

// Define types for chatbot ratings
export interface ChatbotRating {
  id?: string;
  chat_session_id: number;
  user_id: number;
  rating: number;
  feedback_text?: string;
  created_at?: string;
}

/**
 * Start a new chatbot session
 */
export const startChatbotSession = async (): Promise<ChatbotSession | null> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    const session = {
      user_id: user.user_id,
      start_time: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('chat_sessions_tbl')
      .insert([session])
      .select()
      .single();

    if (error) {
      console.error('Error starting chatbot session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in startChatbotSession:', error);
    return null;
  }
};

/**
 * End a chatbot session
 */
export const endChatbotSession = async (chatSessionId: number): Promise<ChatbotSession | null> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    const { data, error } = await supabase
      .from('chat_sessions_tbl')
      .update({
        end_time: new Date().toISOString()
      })
      .eq('chat_session_id', chatSessionId)
      .eq('user_id', user.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error ending chatbot session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in endChatbotSession:', error);
    return null;
  }
};

/**
 * Get all chatbot sessions for the current user
 */
export const getChatbotSessions = async (): Promise<ChatbotSession[]> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return [];
    }

    const { data, error } = await supabase
      .from('chat_sessions_tbl')
      .select('*')
      .eq('user_id', user.user_id)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching chatbot sessions:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getChatbotSessions:', error);
    return [];
  }
};

/**
 * Get a specific chatbot session by ID
 */
export const getChatbotSessionById = async (chatSessionId: number): Promise<ChatbotSession | null> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    const { data, error } = await supabase
      .from('chat_sessions_tbl')
      .select('*')
      .eq('chat_session_id', chatSessionId)
      .eq('user_id', user.user_id)
      .single();

    if (error) {
      console.error('Error fetching chatbot session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getChatbotSessionById:', error);
    return null;
  }
};

/**
 * Add a message to a chatbot session
 */
export const addChatbotMessage = async (
  chatSessionId: number,
  message: string,
  isUser: boolean
): Promise<ChatbotMessage | null> => {
  try {
    const chatMessage = {
      chat_session_id: chatSessionId,
      is_user: isUser,
      message,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert([chatMessage])
      .select()
      .single();

    if (error) {
      console.error('Error adding chatbot message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addChatbotMessage:', error);
    return null;
  }
};

/**
 * Get all messages for a chatbot session
 */
export const getChatbotMessages = async (chatSessionId: number): Promise<ChatbotMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('chat_session_id', chatSessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching chatbot messages:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getChatbotMessages:', error);
    return [];
  }
};

/**
 * Add a rating for a chatbot session
 */
export const addChatbotRating = async (
  chatSessionId: number,
  rating: number,
  feedback?: string
): Promise<ChatbotRating | null> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    const ratingData = {
      chat_session_id: chatSessionId,
      user_id: user.user_id,
      rating,
      feedback_text: feedback
    };

    const { data, error } = await supabase
      .from('feedback_tbl')
      .insert([ratingData])
      .select()
      .single();

    if (error) {
      console.error('Error adding chatbot rating:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addChatbotRating:', error);
    return null;
  }
};

/**
 * Get rating for a chatbot session
 */
export const getChatbotRating = async (chatSessionId: number): Promise<ChatbotRating | null> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    const { data, error } = await supabase
      .from('feedback_tbl')
      .select('*')
      .eq('chat_session_id', chatSessionId)
      .eq('user_id', user.user_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rating found, not an error
        return null;
      }
      console.error('Error fetching chatbot rating:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getChatbotRating:', error);
    return null;
  }
}; 