import { View, Text, Image, TouchableOpacity, Dimensions, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useWindowDimensions } from "react-native";
import images from "@/constants/images";
import ChatbotPageScreen from "./chatbot-page";

const { height } = Dimensions.get("window");

type ChatbotStackParamList = {
  ChatbotPage: undefined;
};

export default function StartConversationModal() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<ChatbotStackParamList>>();

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-bg-dark">
      <Image
        source={images.moodiwave}
        style={{
          width: width * 2.4,
          marginBottom: height * -0.24,
          height: width * 2,
          marginLeft: height * 0.22,
          resizeMode: "contain",
        }}
      />
      
      <View className="absolute w-90 bg-black p-6 rounded-lg">
        <Text className="text-txt-orange font-LeagueSpartan-Bold text-3xl mb-4 text-left">Start a Conversation</Text>
        <Text className="text-txt-light font-LeagueSpartan text-xl mb-6 text-center">Would you like to talk to Moodi?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ChatbotPage")}>
          <Text className="text-[#FF6B35] font-LeagueSpartan-Bold text-lg text-right">START</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
