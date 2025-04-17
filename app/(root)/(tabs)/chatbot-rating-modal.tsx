import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";

interface ChatbotRatingModalProps {
  onSubmit: (rating: number, feedback: string) => void;
  visible: boolean;
}

const ChatbotRatingModal = ({ onSubmit, visible }: ChatbotRatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Please select a rating before submitting.');
      return;
    }
    
    onSubmit(rating, feedback);
    
    // Reset state for next time
    setRating(0);
    setFeedback('');
    setError('');
  };

  if (!visible) return null;

  return (
    <View className="flex-1 justify-center items-center bg-black/70 absolute top-0 left-0 right-0 bottom-0 z-50">
      <View className="bg-white w-4/5 p-6 rounded-xl">
        <Text className="text-2xl font-bold text-center text-[#000746] mb-6">
          Rate Your Conversation
        </Text>
        
        <Text className="text-lg text-[#000746] mb-2">
          How helpful was Moodi today?
        </Text>
        
        <View className="flex-row justify-between mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
              key={star} 
              onPress={() => {
                setRating(star);
                setError('');
              }}
              className="p-2"
            >
              <Ionicons 
                name={rating >= star ? "star" : "star-outline"} 
                size={40} 
                color={rating >= star ? "#FFD700" : "#CCCCCC"} 
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <Text className="text-lg text-[#000746] mb-2">
          Share your feedback (optional):
        </Text>
        
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4 text-[#000746]"
          placeholder="What did you like? How can we improve?"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={feedback}
          onChangeText={setFeedback}
        />
        
        {error ? (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        ) : null}
        
        <TouchableOpacity 
          className="bg-[#FF6B35] py-3 rounded-lg items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-lg">Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatbotRatingModal;