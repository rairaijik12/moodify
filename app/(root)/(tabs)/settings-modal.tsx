import React, { useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  useWindowDimensions, 
  Modal, 
  Animated,
  StyleSheet,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  nickname: string;
  theme?: any; // Add theme prop
}

export default function SettingsModal({ visible, onClose, nickname, theme }: SettingsModalProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Animation value for fade-in effect
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Animation effect when modal opens
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);
  
  // Apply theme colors or use defaults
  const backgroundColor = theme?.background || "#000000";
  const textColor = theme?.text || "#EEEED0";
  const accentColor = theme?.buttonBg || "#FF6B35";
  const cardColor = theme?.calendarBg || "#202020";
  const dimmedTextColor = theme?.dimmedText || "#777777";
  const borderColor = "rgba(100, 100, 100, 0.2)";
  
  // Handle link to privacy policy
  const openPrivacyPolicy = () => {
    // Replace with actual URL
    Linking.openURL("https://www.your-moodify-app.com/privacy-policy");
  };
  
  // Handle link to about page
  const openAboutPage = () => {
    // Replace with actual URL
    Linking.openURL("https://www.your-moodify-app.com/about");
  };
  
  // Handle contact us
  const openContactUs = () => {
    // Replace with actual URL or email
    Linking.openURL("mailto:moodify2025@gmail.com");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back-outline" size={28} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: accentColor }]}>Settings</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Welcome message */}
          <View style={[styles.welcomeSection, { borderBottomColor: borderColor }]}>
            <Text 
              style={[
                styles.welcomeTitle,
                { color: textColor, fontSize: width < 350 ? 20 : 24 }
              ]}
            >
              Hello, {nickname}
            </Text>
            <Text 
              style={[
                styles.welcomeSubtitle, 
                { color: dimmedTextColor, fontSize: width < 350 ? 14 : 16 }
              ]}
            >
              Customize your Moodify experience
            </Text>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section Title */}
            <Text style={[styles.sectionTitle, { color: dimmedTextColor }]}>
              ACCOUNT
            </Text>
            
            {/* Change Nickname */}
            <TouchableOpacity 
              style={[styles.settingCard, { backgroundColor: cardColor }]}
              activeOpacity={0.7}
            >
              <View style={styles.settingRow}>
                <Ionicons name="person-outline" size={22} color={accentColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Change Nickname</Text>
                <Ionicons name="chevron-forward" size={20} color={dimmedTextColor} />
              </View>
            </TouchableOpacity>
            
            {/* Section Title */}
            <Text style={[styles.sectionTitle, { color: dimmedTextColor, marginTop: 24 }]}>
              SUPPORT
            </Text>
            
            {/* Contact Us */}
            <TouchableOpacity 
              style={[styles.settingCard, { backgroundColor: cardColor }]}
              activeOpacity={0.7}
              onPress={openContactUs}
            >
              <View style={styles.settingRow}>
                <Ionicons name="mail-outline" size={22} color={accentColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Contact Us</Text>
                <Ionicons name="chevron-forward" size={20} color={dimmedTextColor} />
              </View>
            </TouchableOpacity>
            
            {/* Section Title */}
            <Text style={[styles.sectionTitle, { color: dimmedTextColor, marginTop: 24 }]}>
              ABOUT
            </Text>
            
            {/* Privacy Policy */}
            <TouchableOpacity 
              style={[styles.settingCard, { backgroundColor: cardColor }]}
              activeOpacity={0.7}
              onPress={openPrivacyPolicy}
            >
              <View style={styles.settingRow}>
                <Ionicons name="shield-checkmark-outline" size={22} color={accentColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color={dimmedTextColor} />
              </View>
            </TouchableOpacity>
            
            {/* About Moodify */}
            <TouchableOpacity 
              style={[styles.settingCard, { backgroundColor: cardColor }]}
              activeOpacity={0.7}
              onPress={openAboutPage}
            >
              <View style={styles.settingRow}>
                <Ionicons name="information-circle-outline" size={22} color={accentColor} />
                <Text style={[styles.settingText, { color: textColor }]}>About Moodify</Text>
                <Ionicons name="chevron-forward" size={20} color={dimmedTextColor} />
              </View>
            </TouchableOpacity>
            
            {/* Version */}
            <View style={[styles.versionContainer, { marginBottom: insets.bottom + 20 }]}>
              <Text style={[styles.versionText, { color: dimmedTextColor }]}>
                Version 1.0.0
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerRight: {
    width: 36,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  welcomeTitle: {
    fontFamily: "LeagueSpartan-Bold",
  },
  welcomeSubtitle: {
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  versionText: {
    fontSize: 13,
  },
});