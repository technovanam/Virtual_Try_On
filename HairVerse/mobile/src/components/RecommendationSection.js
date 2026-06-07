import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RecommendationSection({ title, subtitle, data, renderItem }) {
  if (!data || data.length === 0) return null;

  return (
    <View className="mb-8">
      <View className="px-5 mb-4">
        <Text className="text-[#f8fafc] text-[22px] font-bold">{title}</Text>
        {subtitle && <Text className="text-[#94a3b8] text-[14px] mt-1">{subtitle}</Text>}
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-5 gap-4"
      >
        {data.map((item, index) => renderItem(item, index))}
      </ScrollView>
    </View>
  );
}
