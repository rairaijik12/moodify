import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import icons from '@/constants/icons';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

/**
 * MoodSelectionModal Component
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onSelectMood - Function to call when a mood is selected
 * @param {Date} props.selectedDate - Currently selected date
 * @param {Function} props.setSelectedDate - Function to update the selected date
 * @param {boolean} props.isDatePickerVisible - Whether the date picker is visible
 * @param {Function} props.setDatePickerVisible - Function to toggle date picker visibility
 * @param {boolean} props.isTimePickerVisible - Whether the time picker is visible
 * @param {Function} props.setTimePickerVisible - Function to toggle time picker visibility
 * @param {Object} props.theme - Theme object for styling
 */
const MoodSelectionModal = ({
  visible,
  onClose,
  onSelectMood,
  selectedDate,
  setSelectedDate,
  isDatePickerVisible,
  setDatePickerVisible,
  isTimePickerVisible,
  setTimePickerVisible,
  theme
}) => {
  // Functions to open date/time pickers
  const showDatePicker = () => setDatePickerVisible(true);
  const showTimePicker = () => setTimePickerVisible(true);

  // Functions to handle date/time selection
  const handleDateConfirm = (date) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(date.getFullYear());
    newDate.setMonth(date.getMonth());
    newDate.setDate(date.getDate());
    setSelectedDate(newDate);
    setDatePickerVisible(false);
  };

  const handleTimeConfirm = (date) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(date.getHours());
    newDate.setMinutes(date.getMinutes());
    setSelectedDate(newDate);
    setTimePickerVisible(false);
  };

  // Handle canceling pickers
  const hideDatePicker = () => setDatePickerVisible(false);
  const hideTimePicker = () => setTimePickerVisible(false);

  // Mood options with icons and label
  const moodOptions = [
    { value: 'rad', label: 'Rad', icon: icons.MoodRad, color: theme?.buttonBg || '#FF6B35' },
    { value: 'good', label: 'Good', icon: icons.MoodGood, color: theme?.accent1 || '#1A936F' },
    { value: 'meh', label: 'Meh', icon: icons.MoodMeh, color: theme?.accent2 || '#FFC914' },
    { value: 'bad', label: 'Bad', icon: icons.MoodBad, color: theme?.accent3 || '#4C8577' },
    { value: 'awful', label: 'Awful', icon: icons.MoodAwful, color: theme?.accent4 || '#FF220C' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredView}>
          <LinearGradient
            colors={[theme?.calendarBg || '#FFFFFF', '#f7e9e3']}
            style={styles.modalView}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity onPress={onClose} style={styles.fabCloseButton}>
              {Ionicons ? (
                <Ionicons name="close" size={28} color={theme?.text || '#000'} />
              ) : (
                <Text style={{fontSize: 28, color: theme?.text || '#000', fontWeight: 'bold'}}>✕</Text>
              )}
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme?.text || '#000000' }]}>How are you feeling? <Text style={{fontSize: 24}}>🧠</Text></Text>
            <View style={styles.moodOptionsRow}>
              {moodOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.moodOptionCardSmall}
                  onPress={() => onSelectMood(option.value)}
                  activeOpacity={0.8}
                  disabled={!option.icon}
                >
                  <View style={[styles.moodIconContainerCardSmall, { borderColor: option.color, backgroundColor: option.color + '22' }]}> 
                    {option.icon ? (
                      <Image source={option.icon} style={[styles.moodIconSmall, { tintColor: option.color }]} />
                    ) : (
                      <Text style={{color: option.color}}>?</Text>
                    )}
                  </View>
                  <Text style={[styles.moodTextSmall, { color: option.color }]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Warn if any icon is missing */}
            {moodOptions.some(opt => !opt.icon) && (
              <Text style={{color: 'red', marginTop: 8}}>Some mood icons are missing!</Text>
            )}
            <View style={styles.dateTimeContainer}>
              <Text style={[styles.dateTimeLabel, { color: theme?.dimmedText || '#666666' }]}>When did you feel this way?</Text>
              <View style={styles.dateTimeButtons}>
                <TouchableOpacity
                  style={[styles.dateTimeButtonCard, { backgroundColor: theme?.buttonBg || '#FF6B35' }]}
                  onPress={showDatePicker}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={18} color="#fff" style={{marginRight: 6}} />
                  <Text style={styles.dateTimeButtonText}>{selectedDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateTimeButtonCard, { backgroundColor: theme?.buttonBg || '#FF6B35' }]}
                  onPress={showTimePicker}
                  activeOpacity={0.8}
                >
                  <Ionicons name="time-outline" size={18} color="#fff" style={{marginRight: 6}} />
                  <Text style={styles.dateTimeButtonText}>{selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </SafeAreaView>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        date={selectedDate}
        maximumDate={new Date()}
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
        date={selectedDate}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalView: {
    width: '92%',
    minHeight: 420,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 20,
  },
  fabCloseButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'LeagueSpartan-Bold',
    marginTop: 18,
    marginBottom: 18,
    textAlign: 'center',
  },
  moodOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingVertical: 10,
    flexWrap: 'nowrap',
  },
  moodOptionCardSmall: {
    alignItems: 'center',
    marginHorizontal: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 56,
    maxWidth: 70,
  },
  moodIconContainerCardSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: '#FFF',
  },
  moodIconSmall: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  moodTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'LeagueSpartan-Bold',
    textAlign: 'center',
    marginTop: 1,
  },
  dateTimeContainer: {
    width: '100%',
    marginTop: 30,
    marginBottom: 10,
  },
  dateTimeLabel: {
    fontSize: 18,
    marginBottom: 14,
    textAlign: 'center',
    fontFamily: 'LeagueSpartan-Regular',
  },
  dateTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dateTimeButtonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 18,
    marginHorizontal: 8,
    minWidth: 120,
    backgroundColor: '#FF6B35',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  dateTimeButtonText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'LeagueSpartan-Bold',
  },
});

export default MoodSelectionModal;