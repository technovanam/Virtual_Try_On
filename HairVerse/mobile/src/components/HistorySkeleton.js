import React, { useEffect } from 'react';
import { View, Animated } from 'react-native';

export default function HistorySkeleton() {
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
    <View className="bg-white rounded-2xl mb-4 shadow-sm flex-row overflow-hidden border border-[#F1F5F9] p-3" style={{ elevation: 2 }}>
      <Animated.View className="h-[80px] w-[80px] bg-[#E2E8F0] rounded-xl" style={{ opacity }} />
      
      <View className="flex-1 ml-4 justify-center">
        <Animated.View className="h-5 w-3/4 bg-[#E2E8F0] rounded mb-2" style={{ opacity }} />
        <Animated.View className="h-4 w-1/2 bg-[#E2E8F0] rounded" style={{ opacity }} />
      </View>
    </View>
  );
}
