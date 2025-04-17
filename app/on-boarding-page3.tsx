import { useRouter } from "expo-router";
import { Text, Image, TouchableOpacity } from "react-native";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";

export default function OnBoarding3() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();

    return (
        <SafeAreaView className="flex-1 items-center bg-bg-light">
            
            <Image 
                source={images.journal} 
                style={{
                    position: "absolute",
                    bottom: height * -0.11,
                    width: width * 2.59, 
                    height: height * 0.69,
                    resizeMode: "contain",
                }}
            />

           
            <Text style={{ fontSize: width * 0.2, top: height * 0.13, left: width * 0.04}} className="text-txt-orange font-LeagueSpartan-Bold absolute tracking-[.-4]">Journaling</Text>
            <Text style={{ fontSize: width * 0.2, top: height * 0.205, left: width * 0.07}} className="text-txt-orange font-LeagueSpartan-Bold absolute tracking-[.-4]">Made</Text>
            <Text style={{ fontSize: width * 0.2, top: height * 0.205, left: width * 0.57}} className="text-txt-orange font-LeagueSpartan-Bold absolute tracking-[.-4]">Easy</Text>
            <Text style={{ fontSize: width * 0.056, top: height * 0.3, right: width * 0.05, textAlign: "right" }} className="text-txt-darkblue font-LeagueSpartan absolute">
                A safe place to jot down{"\n"}thoughts anytime
            </Text>

            
            <TouchableOpacity 
                onPress={() => router.push('/on-boarding-page4')} 
                style={{
                    position: "absolute",
                    bottom: height * 0.08,
                    paddingVertical: height * 0.02,
                    paddingHorizontal: width * 0.08,
                    borderRadius: 45,
                }}
                className="bg-[#FF6B35] flex-row justify-center items-center">
                <Text style={{ fontSize: width * 0.05 }} className="text-txt-light font-LeagueSpartan-Bold text-center">Next</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}