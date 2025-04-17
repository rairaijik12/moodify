import { useRouter } from "expo-router";
import { Text, Image, TouchableOpacity, View, useWindowDimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import images from "@/constants/images";

export default function OnBoarding1() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();

    return (
        <SafeAreaView className="flex-1 bg-bg-dark">
            
            <StatusBar style="light" hidden={false} translucent backgroundColor="transparent" />

            <ScrollView 
                contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingTop: height * 0.08 }}
                showsVerticalScrollIndicator={false}
            >
                
                <View className="items-center">
                    <Text 
                        style={{ fontSize: width * 0.22, lineHeight: width * 0.2, marginLeft: -width * 0.15 }}
                        className="text-txt-orange font-LeagueSpartan-Bold tracking-[-0.4px]">
                        Track
                    </Text>
                    <Text 
                        style={{ fontSize: width * 0.22, lineHeight: width * 0.2, marginRight: -width * 0.15 }}
                        className="text-txt-orange font-LeagueSpartan-Bold text-center tracking-[-0.4px]">
                        Moods
                    </Text>
                    <Text 
                        style={{ fontSize: width * 0.056, marginTop: -5 }}
                        className="text-txt-light font-LeagueSpartan">
                        log how you feel each day
                    </Text>
                </View>

                
                <Image 
                    source={images.moods} 
                    style={{
                        width: width * 5, 
                        height: width * 2,
                        resizeMode: "contain",
                        marginTop: height * -0.32,
                    }}
                />

                
                <TouchableOpacity 
                    onPress={() => router.push('/on-boarding-page2')} 
                    style={{
                        marginTop: height * -0.13,
                        paddingVertical: height * 0.02,
                        paddingHorizontal: width * 0.08,
                        borderRadius: 45,
                    }}
                    className="bg-[#FF6B35] flex-row justify-center items-center">
                    <Text style={{ fontSize: width * 0.05 }}
                        className="text-txt-light font-LeagueSpartan-Bold text-center">
                        Next
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
