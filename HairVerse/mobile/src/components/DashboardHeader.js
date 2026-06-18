import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/authStore';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useNotificationsStore } from '../store/notificationsStore';

const NotificationIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

export default function DashboardHeader() {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const { unreadCount } = useNotificationsStore();
  
  const displayName = user?.displayName || 'User';
  const profileImage = user?.photoURL || user?.profileImage; 

  return (
    <View className="px-5 pt-4 pb-4 bg-white flex-row justify-between items-center">
      <TouchableOpacity 
        className="flex-row items-center flex-1 mr-4"
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Profile')}
      >
        {profileImage ? (
          <Image source={{ uri: profileImage }} className="w-11 h-11 rounded-full bg-[#f4f5f7] border-2 border-indigo-100" />
        ) : (
          <View className="w-11 h-11 rounded-full bg-indigo-600 justify-center items-center shadow-sm">
            <Text className="text-white text-lg font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="text-[11px] text-[#94A3B8] font-medium" style={{ fontFamily: 'Poppins_500Medium' }}>Hello,</Text>
          <Text className="text-lg text-[#1e293b] font-bold" style={{ fontFamily: 'Poppins_700Bold', marginTop: -2 }} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        className="relative w-10 h-10 rounded-full bg-white justify-center items-center border border-[#F1F5F9]"
        onPress={() => navigation.navigate('Notifications')}
        activeOpacity={0.7}
      >
        <NotificationIcon size={20} color="#475569" />
        {unreadCount > 0 && (
          <View className="absolute top-1 right-1 min-w-[16px] h-[16px] rounded-full bg-[#EF4444] justify-center items-center border border-white px-0.5">
            <Text className="text-white text-[9px] font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>
              {unreadCount > 99 ? '99' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
