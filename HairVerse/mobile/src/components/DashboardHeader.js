import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/authStore';
import Svg, { Path, Circle } from 'react-native-svg';

const NotificationIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const SearchIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.3-4.3" />
  </Svg>
);

export default function DashboardHeader() {
  const { user } = useAuthStore();
  
  const displayName = user?.displayName || 'User';
  const profileImage = user?.photoURL || user?.profileImage; 
  
  const unreadNotifications = 0; 

  return (
    <View className="px-5 pt-4 pb-5 bg-white">
      {/* Top Row: Profile & Notifications */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center flex-1 mr-4">
          {profileImage ? (
            <Image source={{ uri: profileImage }} className="w-12 h-12 rounded-full bg-[#f4f5f7]" />
          ) : (
            <View className="w-12 h-12 rounded-full bg-[#1E1E1E] justify-center items-center shadow-sm" style={{ elevation: 2 }}>
              <Text className="text-white text-xl font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-3.5 flex-1">
            <Text className="text-sm text-[#8e8e93] mb-0.5">Hello,</Text>
            <Text className="text-xl font-extrabold text-[#1a1a1a] tracking-[-0.5px]" numberOfLines={1}>{displayName}</Text>
          </View>
        </View>

        <TouchableOpacity className="relative w-11 h-11 rounded-full bg-[#f8f9fa] justify-center items-center border border-[#f0f0f0]">
          <NotificationIcon size={22} color="#1a1a1a" />
          {unreadNotifications > 0 && (
            <View className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#FF3B30] justify-center items-center border-[1.5px] border-white px-1">
              <Text className="text-white text-[10px] font-bold">{unreadNotifications > 99 ? '99+' : unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Search Bar */}
      <View className="flex-row items-center bg-[#f4f5f7] rounded-2xl px-4 h-[52px]">
        <SearchIcon size={20} color="#8e8e93" />
        <TextInput
          className="flex-1 text-base text-[#1a1a1a] ml-2.5 h-full"
          placeholder="Search hairstyles..."
          placeholderTextColor="#8e8e93"
          editable={false} 
        />
      </View>
    </View>
  );
}
