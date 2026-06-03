import React from 'react';
import { View, Text } from 'react-native';

export default function InsightCard({ title, value, colorClass = "bg-blue-50 border-blue-100", textColorClass = "text-blue-800" }) {
  if (!value) return null;

  return (
    <View className={`p-4 rounded-2xl border ${colorClass} mb-3 flex-row items-center justify-between`}>
      <Text className="text-gray-600 font-medium">{title}</Text>
      <Text className={`font-bold text-lg ${textColorClass}`}>{value}</Text>
    </View>
  );
}
