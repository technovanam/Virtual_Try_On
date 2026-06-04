import React from 'react';
import { View } from 'react-native';

export default function TrendingSkeleton() {
  return (
    <View className="bg-white rounded-2xl mr-4 shadow-sm overflow-hidden border border-[#F1F5F9] w-[260px] animate-pulse">
      <View className="h-[160px] w-full bg-[#E2E8F0]" />
      <View className="p-4">
        <View className="h-5 w-3/4 bg-[#E2E8F0] rounded mb-3" />
        <View className="flex-row justify-between items-center">
          <View className="h-4 w-1/3 bg-[#E2E8F0] rounded" />
          <View className="h-4 w-1/4 bg-[#E2E8F0] rounded" />
        </View>
      </View>
    </View>
  );
}
