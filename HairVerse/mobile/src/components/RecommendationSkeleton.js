import React, { useEffect } from 'react';
import { View, Animated } from 'react-native';

export default function RecommendationSkeleton() {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden border border-[#F1F5F9]" style={{ elevation: 3 }}>
      <Animated.View className="h-[180px] w-full bg-[#E2E8F0]" style={{ opacity }} />
      
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Animated.View className="h-5 w-1/2 bg-[#E2E8F0] rounded" style={{ opacity }} />
          <Animated.View className="h-6 w-1/5 bg-[#E2E8F0] rounded-lg" style={{ opacity }} />
        </View>
        
        <View className="flex-row items-center">
          <Animated.View className="h-4 w-2/5 bg-[#E2E8F0] rounded" style={{ opacity }} />
        </View>
      </View>
    </View>
  );
}
