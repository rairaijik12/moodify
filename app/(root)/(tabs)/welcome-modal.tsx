import React from "react";
import { View, Text, TouchableOpacity, Modal, Image, useWindowDimensions } from "react-native";
import images from "@/constants/images";

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  nickname: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  visible,
  onClose,
  nickname,
}) => {
  const { width, height } = useWindowDimensions();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View
          style={{ width: width * 0.85 }}
          className="bg-bg-dark rounded-3xl p-6 items-center"
        >
          <Image
            source={images.moodiwave}
            style={{
              width: width * 0.3,
              height: width * 0.3,
              resizeMode: "contain"
            }}
          />

          <Text
            className="text-txt-orange font-LeagueSpartan-Bold text-center mb-10"
            style={{ fontSize: width * 0.1 }}
          >
            Hi {nickname}!
          </Text>

          <Text
            className="text-txt-light font-LeagueSpartan text-center mb-5"
            style={{ fontSize: width * 0.045 }}
          >
            Welcome to <Text className="text-txt-orange font-LeagueSpartan-Bold">Moodify</Text>! I'm excited to be your companion on this journey to
            better wellness and self-awareness.
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingVertical: height * 0.015,
              paddingHorizontal: width * 0.1,
              borderRadius: 45,
            }}
            className="bg-bg-orange justify-center items-center mt-2"
          >
            <Text
              className="text-txt-light font-LeagueSpartan-Bold"
              style={{ fontSize: width * 0.045 }}
            >
              Let's Go!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WelcomeModal;