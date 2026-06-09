import React from 'react';
import { Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AITryOnHero() {
  const navigation = useNavigation();

  const navigateToPlaceholder = (title) => {
    navigation.navigate('Placeholder', { title });
  };

  return (
    <View className="py-4 w-full">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-[24px] p-6 shadow-xl w-full"
        style={{ elevation: 10 }}
      >
        <View className="bg-white/10 self-start px-3 py-[6px] rounded-[20px] mb-4 border border-white/20">
          <Text className="text-[#00d2ff] text-xs font-extrabold tracking-[1.5px]">HAIRVERSE AI</Text>
        </View>

        <Text className="text-[28px] font-black text-white mb-3 leading-[34px]">Find Your Perfect Hairstyle</Text>
        <Text className="text-[15px] text-white/80 mb-7 leading-[22px]">
          Upload a selfie or use the live camera to discover hairstyles tailored for you.
        </Text>



        <TouchableOpacity 
          className="items-center py-2"
          onPress={() => navigateToPlaceholder('Try Trending Styles')}
          activeOpacity={0.7}
        >
          <Text className="text-[#00d2ff] text-sm font-semibold tracking-[0.5px]">Try Trending Styles →</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
