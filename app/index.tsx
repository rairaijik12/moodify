import { useRouter, Redirect } from "expo-router";
import { Text, Image, TouchableOpacity, View, useWindowDimensions, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import { useEffect, useState } from 'react';
import { checkExistingSession } from './services/userService';
import { COLORS } from './constants/theme';

export default function Index() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { hasSession, hasCompletedOnboarding } = await checkExistingSession();
      setHasSession(hasSession);
      setHasCompletedOnboarding(hasCompletedOnboarding);
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgLight }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // If user has session and completed onboarding, go directly to home
  if (hasSession && hasCompletedOnboarding) {
    return <Redirect href={"/home-page" as any} />;
  }

  return (
    <View className="flex-1 bg-bg-light">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <SafeAreaView className="flex-1">
        <Image 
          source={images.orangecurve} 
          style={{ position: "absolute", top: height * -0.14, right: width * -0.20, width: width * 0.7, height: width * 0.8, resizeMode: "contain" }}
        />
        <Image 
          source={images.leftlightcurve} 
          style={{ position: "absolute", top: height * 0.25, left: width * -0.46, width: width * 0.9, height: width * 0.9 }}
        />
        <Image 
          source={images.rightlightcurve} 
          style={{ position: "absolute", bottom: height * -0.08, right: width * -0.14, width: width * 0.9, height: width * 0.9 }}
        />
        <Image 
          source={images.rightdarkcurve} 
          style={{ position: "absolute", bottom: height * -0.064, right: width * -0.07, width: width * 0.6, height: width * 0.6 }}
        />

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", paddingBottom: height * 0.1 }}
          showsVerticalScrollIndicator={false}
        >
          <Image 
            source={images.moodiface} 
            style={{ width: width * 1.3, height: height * 0.4, marginLeft:width * 0.07, resizeMode: "contain" }}
          />

          <Text 
            style={{ fontSize: width * 0.22, textAlign: "center" }} 
            className="text-txt-orange font-LeagueSpartan-Bold mt-6">
            Moodify
          </Text>

          <Text 
            style={{ fontSize: width * 0.056, textAlign: "center", marginTop: height * 0.02 }} 
            className="text-txt-darkblue font-LeagueSpartan">
            Your Journey to Well-being{"\n"}One Mood at a Time
          </Text>

          <TouchableOpacity 
            onPress={() => router.push('/on-boarding-page1' as any)} 
            style={{
              marginTop: height * 0.05,
              paddingVertical: height * 0.02,
              paddingHorizontal: width * 0.08,
              borderRadius: 45
            }}
            className="bg-bg-dark flex-row justify-center items-center">
            <Text style={{ fontSize: width * 0.05 }} 
              className="text-txt-light font-LeagueSpartan-Bold text-center">
              Get Started
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
