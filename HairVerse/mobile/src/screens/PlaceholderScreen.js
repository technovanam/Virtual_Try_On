import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PlaceholderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const title = route.params?.title || 'Coming Soon';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-[28px] font-bold text-textPrimary mb-4 text-center">{title}</Text>
        <Text className="text-base text-textSecondary mb-8 text-center">This feature will be built later.</Text>
        
        <TouchableOpacity className="bg-primary py-3.5 px-8 rounded-xl" onPress={() => navigation.goBack()}>
          <Text className="text-white text-base font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
