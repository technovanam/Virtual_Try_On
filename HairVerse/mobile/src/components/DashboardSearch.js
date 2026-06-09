import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const SearchIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.3-4.3" />
  </Svg>
);

export default function DashboardSearch() {
  const navigation = useNavigation();

  return (
    <View className="px-5 mb-4 bg-white">
      <TouchableOpacity 
        className="flex-row items-center bg-[#f4f5f7] rounded-2xl px-4 h-[52px]"
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Search')}
      >
        <SearchIcon size={20} color="#8e8e93" />
        <View className="flex-1 ml-2.5">
          <Text className="text-base text-[#8e8e93]">Search hairstyles...</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
