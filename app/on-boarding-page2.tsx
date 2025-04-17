import { useRouter } from "expo-router";
import { Text, Image, TouchableOpacity, View, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import images from "@/constants/images";

export default function OnBoarding2() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();

    return (
        <SafeAreaView className="flex-1 bg-bg-medium">
            
            <StatusBar style="light" hidden={false} translucent backgroundColor="transparent" />


            
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingTop: height * 0.4, paddingBottom: height * 0.05 }}
                showsVerticalScrollIndicator={false}
            >
                
                <View className="items-center">
                    
                    <Image 
                        source={images.patterns}
                        style={{
                            width: width * 1.1, 
                            height: width * 2,
                            resizeMode: "contain",
                            marginBottom: height * -0.15, 
                            marginTop: height * -0.58
                        }}
                    />

                   
                    <Text 
                        style={{ fontSize: width * 0.18, lineHeight: width * 0.2, marginLeft: width * -0.09, marginTop: height * -0.06 }}
                        className="text-txt-orange font-LeagueSpartan-Bold tracking-[-0.4px]">
                        Recognize
                    </Text>
                    <Text 
                        style={{ fontSize: width * 0.18, lineHeight: width * 0.2, marginLeft: width * 0.125, marginTop: height * -0.02 }}
                        className="text-txt-orange font-LeagueSpartan-Bold tracking-[-0.4px]">
                        Patterns
                    </Text>
                    <Text 
                        style={{ fontSize: width * 0.056, marginTop: -10 }}
                        className="text-txt-darkblue font-LeagueSpartan text-center">
                        Notice patterns and{"\n"}understand your emotions
                    </Text>

                    
                    <TouchableOpacity 
                        onPress={() => router.push('/on-boarding-page3')} 
                        style={{
                            marginTop: height * 0.045,
                            paddingVertical: height * 0.02,
                            paddingHorizontal: width * 0.08,
                            borderRadius: 45,
                        }}
                        className="bg-[#FF6B35] flex-row justify-center items-center">
                        <Text style={{ fontSize: width * 0.05 }} className="text-txt-light font-LeagueSpartan-Bold text-center">
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
