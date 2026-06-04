import React from 'react';
import { View } from 'react-native';

export default function CelebrityMatchSkeleton() {
  return (
    <View className="bg-white rounded-2xl mr-4 shadow-sm overflow-hidden border border-[#F1F5F9] w-[260px] animate-pulse">
      <View className="h-[140px] w-full flex-row">
        <View className="w-1/2 h-full bg-[#E2E8F0] border-r border-white" />
        <View className="w-1/2 h-full bg-[#E2E8F0]" />
      </View>
      <View className="p-3 bg-white items-center">
        <View className="h-4 w-1/2 bg-[#E2E8F0] rounded" />
      </View>
    </View>
  );
}
