// @ts-ignore: React import issue
import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, Image, useWindowDimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import images from "@/constants/images";
import ConfettiCannon from 'react-native-confetti-cannon';
import { getUserFromLocalStorage, updateUserXP, ensureXpRowExists, STORAGE_KEYS } from "@/app/services/userService";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * @typedef {'mood_entry' | 'chatbot_rating' | null} XpSource
 */

/**
 * XP and Streak Popup Component
 * Displays a modal with XP rewards and streak information
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {number} props.totalXp - Total XP accumulated by the user
 * @param {number} props.streak - Current streak count
 * @param {number} [props.xpAmount] - Optional custom XP amount to display
 * @param {XpSource} [props.xpSource] - Source of the XP reward
 * @param {boolean} [props.isPastDay=false] - Whether this is for a past day entry
 */
const XpStreakPopup = ({ 
  visible, 
  onClose, 
  totalXp, 
  streak, 
  xpAmount, 
  xpSource, 
  isPastDay = false 
}) => {
  const { width, height } = useWindowDimensions();
  const [confettiActive, setConfettiActive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const modalWidth = width * 0.9;
  
  useEffect(() => {
    if (visible) {
      setConfettiActive(true);
    }
  }, [visible]);
  
  // Skip showing XP popup for past-day entries
  if (isPastDay) {
    return null;
  }
  
  // Calculate XP amount based on source (never default to 10)
  let displayXpAmount = 5;
  if (xpSource === 'chatbot_rating') displayXpAmount = 20;
  if (typeof xpAmount === 'number') displayXpAmount = xpAmount;
  
  // Determine message based on XP source
  const getMessage = () => {
    if (xpSource === 'mood_entry') {
      return "Good job on logging your mood today!";
    } else if (xpSource === 'chatbot_rating') {
      return "Thanks for your feedback on the Moodi!";
    } else {
      return "Good job on logging your mood today!";
    }
  };

  // Handle XP claim - save to Supabase and AsyncStorage
  const handleClaimXP = async () => {
    setIsUpdating(true);
    try {
      const user = await getUserFromLocalStorage();
      const nickname = await AsyncStorage.getItem(STORAGE_KEYS.NICKNAME);
      
      if (!user || !nickname) {
        console.error("No user or nickname found when trying to update XP");
        Alert.alert("Error", "Could not update XP. Please try again later.");
        setIsUpdating(false);
        onClose();
        return;
      }

      // Get the XP increment amount based on source
      const xpIncrement = xpSource === 'chatbot_rating' ? 20 : 5;

      await ensureXpRowExists(user.user_id);
      const result = await updateUserXP(user.user_id, xpIncrement, nickname);
      
      if (result.success) {
        console.log(`XP claimed successfully`);
      } else if (result.alreadyClaimed) {
        // Silently close without error message for daily limit
        onClose();
        return;
      } else {
        // Only show error for actual errors, not daily limits
        Alert.alert("Error", "Could not update XP. Please try again later.");
      }
    } catch (error) {
      console.error("Error in XP update process:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}>
          <View style={{
            backgroundColor: '#003049',
            borderRadius: 24,
            padding: 24,
            alignItems: 'center',
            borderWidth: 1,
            width: modalWidth
          }}> 
            {confettiActive && (
              <ConfettiCannon 
                count={300} 
                origin={{ x: 200, y: 150 }} 
                fadeOut={true} 
                autoStart={true}
                onAnimationEnd={() => setConfettiActive(false)}
              />
            )}

            <Image
              source={images.moodiwave}
              style={{
                width: 250,
                height: 180
              }}
              resizeMode="contain"
            />

            <Text style={{
              fontFamily: 'LeagueSpartan-Bold',
              color: '#FF6B35',
              marginBottom: 10,
              textAlign: 'center',
              fontSize: 35
            }}>I'm here for you</Text>
            
            <Text style={{
              fontFamily: 'LeagueSpartan-Regular',
              color: '#EEEED0',
              marginBottom: 25,
              textAlign: 'center',
              fontSize: 20
            }}>{getMessage()}</Text>
            
            <View style={{
              flexDirection: 'row',
              backgroundColor: '#F6C49E',
              borderRadius: 10,
              padding: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 25,
            }}>
              <Text style={{
                fontFamily: 'LeagueSpartan-Bold',
                color: '#004E89',
                textAlign: 'center',
                fontSize: 28
              }}>+{displayXpAmount} XP</Text>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: 24,
              paddingHorizontal: 10,
            }}>
              
              {/* Total XP */}
              <View style={{
                backgroundColor: '#004E89',
                borderRadius: 20,
                padding: 15,
                alignItems: 'center',
                flex: 1,
                marginHorizontal: 8
              }}>
                <Text style={{
                  color: '#F6C49E',
                  fontSize: 20,
                  fontFamily: 'LeagueSpartan-Bold'
                }}>TOTAL XP</Text>
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: '#F6C49E',
                  padding: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  marginTop: 8
                }}>
                  <Ionicons name="flash" size={24} color="#004E89" />
                  <Text style={{
                    fontSize: 20,
                    fontFamily: 'LeagueSpartan-Regular',
                    color: '#004E89',
                    marginRight: 5,
                  }}>{totalXp}</Text>
                </View>
              </View>

              {/* Streak */}
              <View style={{
                backgroundColor: '#F6C49E',
                borderRadius: 20,
                padding: 15,
                alignItems: 'center',
                flex: 1,
                marginHorizontal: 8
              }}>
                <Text style={{
                  color: '#FF6B35',
                  fontFamily: 'LeagueSpartan-Bold',
                  fontSize: 20,
                }}>STREAK</Text>
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: '#FF6B35',
                  padding: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  marginTop: 8
                }}>
                  <Ionicons name="flame" size={24} color="#F6C49E" />
                  <Text style={{
                    fontSize: 20,
                    fontFamily: 'LeagueSpartan-Regular',
                    color: '#EEEED0',
                    marginRight: 5,
                  }}>{streak}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={{
                backgroundColor: '#FF6B35',
                borderRadius: 30,
                paddingVertical: 15,
                paddingHorizontal: 30,
                alignItems: 'center',
                marginTop: 20,
                opacity: isUpdating ? 0.7 : 1,
              }}
              disabled={isUpdating}
              onPress={handleClaimXP}
            >
              <Text style={{
                fontFamily: 'LeagueSpartan-Bold',
                color: '#EEEED0',
                fontSize: 25
              }}>{isUpdating ? "Claiming..." : "Claim XP"}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default XpStreakPopup;