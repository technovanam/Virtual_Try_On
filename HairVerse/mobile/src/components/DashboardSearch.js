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
        className="flex-row items-center bg-[#F8FAFC] rounded-2xl px-4 h-[50px] border border-[#F1F5F9]"
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Search')}
      >
        <SearchIcon size={18} color="#94A3B8" />
        <View className="flex-1 ml-3">
          <Text className="text-sm text-[#94A3B8]" style={{ fontFamily: 'Poppins_500Medium' }}>
            Search hairstyles, categories...
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
