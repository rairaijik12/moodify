import { useRouter } from "expo-router";
import { Text, Image, TouchableOpacity, Modal, View, ScrollView } from "react-native";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import images from "@/constants/images";
import { markOnboardingComplete } from "@/app/services/userService";

export default function OnBoarding4() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const [termsModalVisible, setTermsModalVisible] = useState(false);

    const handleGetStarted = () => {
        setTermsModalVisible(true);
    };

    const handleAcceptTerms = async () => {
        try {
            await markOnboardingComplete(); // Mark onboarding as completed
            setTermsModalVisible(false);
            router.push('/nickname-page');
        } catch (error) {
            console.error('Error marking onboarding as complete:', error);
            // Still proceed to nickname page even if marking completion fails
            setTermsModalVisible(false);
            router.push('/nickname-page');
        }
    };

    const handleDeclineTerms = () => {
        setTermsModalVisible(false);
        // User declined terms - you might want to show a message or take other action
    };

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-bg-orange">
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

            <Text style={{ fontSize: width * 0.2, top: height * 0.13, right: width * 0.1 }} className="text-txt-blue font-LeagueSpartan-Bold absolute tracking-[.-4]">Meet</Text>
            <Text style={{ fontSize: width * 0.2, top: height * 0.205, right: width * 0.1 }} className="text-txt-blue font-LeagueSpartan-Bold absolute tracking-[.-4]">Moodi</Text>
            <Text style={{ fontSize: width * 0.06, top: height * 0.3, right: width * 0.1, textAlign: "right" }} className="text-txt-light font-LeagueSpartan absolute">
                Moodi is always there to chat{"\n"}whenever you need a friend
            </Text>

            <TouchableOpacity 
                onPress={handleGetStarted} 
                style={{
                    position: "absolute",
                    bottom: height * 0.08,
                    paddingVertical: height * 0.02,
                    paddingHorizontal: width * 0.08,
                    borderRadius: 45,
                }}
                className="bg-bg-dark flex-row justify-center items-center">
                <Text style={{ fontSize: width * 0.05 }} className="text-txt-light font-LeagueSpartan-Bold text-center">Next</Text>
            </TouchableOpacity>

            {/* Terms and Conditions Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={termsModalVisible}
                onRequestClose={() => setTermsModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center">
                    <View 
                        style={{ width, height, backgroundColor: "rgba(0, 0, 0, 0.75)" }}
                        className="absolute"
                    />
                    <View 
                        style={{ width: width * 0.9, maxHeight: height * 0.7 }}
                        className="bg-bg-light rounded-3xl p-6"
                    >
                        <Text className="text-txt-orange font-LeagueSpartan-Bold text-center mb-8" style={{ fontSize: width * 0.08 }}>
                            Terms and Conditions
                        </Text>
                        
                        <ScrollView className="mb-4">
                            <Text className="text-txt-darkblue font-LeagueSpartan mb-8" style={{ fontSize: width * 0.05 }}>
                                Welcome to <Text className="text-txt-orange font-LeagueSpartan-Bold">Moodify</Text>! Before you start using our app, please read and accept the following terms and conditions:
                            </Text>
                            
                            <Text className="text-txt-darkblue font-LeagueSpartan-Bold mb-2" style={{ fontSize: width * 0.05 }}>
                                1. Acceptance of Terms
                            </Text>
                            <Text className="text-txt-darkblue font-LeagueSpartan mb-4" style={{ fontSize: width * 0.04 }}>
                                By accessing or using Moodify, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use the app.
                            </Text>
                            
                            <Text className="text-txt-darkblue font-LeagueSpartan-Bold mb-2" style={{ fontSize: width * 0.05 }}>
                                2. User Information
                            </Text>
                            <Text className="text-txt-darkblue font-LeagueSpartan mb-4" style={{ fontSize: width * 0.04 }}>
                                Moodify collects and processes only your <Text className="text-txt-darkblue font-LeagueSpartan-Bold">name</Text> to enhance your experience. This information is managed in accordance with our Privacy Policy.
                            </Text>
                            
                            <Text className="text-txt-darkblue font-LeagueSpartan-Bold mb-2" style={{ fontSize: width * 0.05 }}>
                                3. Data Collection
                            </Text>
                            <Text className="text-txt-darkblue font-LeagueSpartan mb-4" style={{ fontSize: width * 0.04 }}>
                                Moodify stores only <Text className="text-txt-darkblue font-LeagueSpartan-Bold">Chatbot Ratings and XP Progress</Text>. Mood Entries, Journal entries, and chatbot conversations remain private and accessible only to you.
                            </Text>
                            
                            <Text className="text-txt-darkblue font-LeagueSpartan-Bold mb-2" style={{ fontSize: width * 0.05 }}>
                                4. User Responsibilities
                            </Text>
                            <Text className="text-txt-darkblue font-LeagueSpartan mb-4" style={{ fontSize: width * 0.04 }}>
                                By using Moodify, you agree not to engage in illegal activities, harassment, or the distribution of harmful content. You retain ownership of the content you create and share within the app.
                            </Text>
                            
                            <Text className="text-txt-darkblue font-LeagueSpartan-Bold mb-2" style={{ fontSize: width * 0.05 }}>
                                5. Not a Medical Service
                            </Text>
                            <Text className="text-txt-darkblue font-LeagueSpartan mb-4" style={{ fontSize: width * 0.04 }}>
                                Moodify is not a substitute for professional mental health services. If you require medical or psychological support, please consult a qualified professional.
                            </Text>

                            <Text className="text-txt-darkblue font-LeagueSpartan-Bold mb-2" style={{ fontSize: width * 0.05 }}>
                                6. Privacy and Security
                            </Text>
                            <Text className="text-txt-darkblue font-LeagueSpartan mb-4" style={{ fontSize: width * 0.04 }}>
                                Your data is protected and will not be shared without your consent. You may request data deletion at any time.
                            </Text>

                            <Text className="text-txt-darkblue font-LeagueSpartan-Bold mb-2" style={{ fontSize: width * 0.05 }}>
                                7. App Updates and Changes
                            </Text>
                            <Text className="text-txt-darkblue font-LeagueSpartan mb-8" style={{ fontSize: width * 0.04 }}>
                                The app may undergo updates and changes without prior notice. Continued use of Moodify constitutes acceptance of these terms.
                            </Text>
                            
                            <Text className="text-txt-darkblue font-LeagueSpartan mb-4" style={{ fontSize: width * 0.05 }}>
                                By clicking <Text className="text-txt-darkblue font-LeagueSpartan-Bold">"I Accept"</Text> below, you acknowledge that you have read and agree to these Terms and Conditions.
                            </Text>
                        </ScrollView>
                        
                        <View className="flex-row justify-between">
                            <TouchableOpacity 
                                onPress={handleDeclineTerms}
                                style={{
                                    paddingVertical: height * 0.015,
                                    paddingHorizontal: width * 0.06,
                                    borderRadius: 45,
                                    borderWidth: 1,
                                    borderColor: "#003049",
                                }}
                                className="flex-1 mr-2 justify-center items-center"
                            >
                                <Text className="text-txt-darkblue font-LeagueSpartan-Bold" style={{ fontSize: width * 0.04 }}>Decline</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                onPress={handleAcceptTerms}
                                style={{
                                    paddingVertical: height * 0.015,
                                    paddingHorizontal: width * 0.06,
                                    borderRadius: 45,
                                }}
                                className="bg-bg-orange flex-1 ml-2 justify-center items-center"
                            >
                                <Text className="text-txt-light font-LeagueSpartan-Bold" style={{ fontSize: width * 0.04 }}>I Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}