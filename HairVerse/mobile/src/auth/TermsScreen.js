import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-1 -ml-1"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-[#1F2937] text-lg font-Poppins-Bold text-center flex-1 mr-7">
          Terms & Conditions
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <Text className="text-[#9CA3AF] text-xs font-Poppins mb-6">Last Updated: June 17, 2026</Text>

        <Text className="text-[#6D28D9] text-[18px] font-Poppins-Bold mb-3">1. Agreement to Terms</Text>
        <Text className="text-[#4B5563] text-[14px] font-Poppins leading-[22px] mb-6">
          By accessing or using HairVerse, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.
        </Text>

        <Text className="text-[#6D28D9] text-[18px] font-Poppins-Bold mb-3">2. Face Data & Privacy</Text>
        <Text className="text-[#4B5563] text-[14px] font-Poppins leading-[22px] mb-6">
          Our application utilizes advanced AI algorithms to analyze physical photos of your face for hairstyle try-on purposes. We prioritize your privacy:
          {'\n\n'}
          • Photos are processed locally or via secured cloud endpoints and are NOT sold to third parties.
          {'\n'}
          • We do not store biometric identifiers that could link back to your offline identity.
        </Text>

        <Text className="text-[#6D28D9] text-[18px] font-Poppins-Bold mb-3">3. Intellectual Property</Text>
        <Text className="text-[#4B5563] text-[14px] font-Poppins leading-[22px] mb-6">
          All materials, virtual hairstyles, assets, app designs, graphics, and code are owned by HairVerse. You may not copy, reverse-engineer, or redistribute any assets without explicit written consent.
        </Text>

        <Text className="text-[#6D28D9] text-[18px] font-Poppins-Bold mb-3">4. Limitation of Liability</Text>
        <Text className="text-[#4B5563] text-[14px] font-Poppins leading-[22px] mb-6">
          The Virtual Try-On output is an AI-generated simulation. HairVerse is not responsible for physical results matching virtual representations perfectly. Consult a professional hairstylist for real-life changes.
        </Text>

        <Text className="text-[#6D28D9] text-[18px] font-Poppins-Bold mb-3">5. User Accounts</Text>
        <Text className="text-[#4B5563] text-[14px] font-Poppins leading-[22px] mb-6">
          You are responsible for maintaining the confidentiality of your account credentials and password. Any actions taken under your account are your responsibility.
        </Text>

        <Text className="text-[#6D28D9] text-[18px] font-Poppins-Bold mb-3">6. Changes to Terms</Text>
        <Text className="text-[#4B5563] text-[14px] font-Poppins leading-[22px] mb-[40px]">
          We reserve the right to modify or replace these terms at any time. Your continued use of the application constitutes acceptance of the updated terms.
        </Text>
      </ScrollView>

      {/* Accept / Done button */}
      <View className="px-6 py-4 border-t border-[#F3F4F6]">
        <TouchableOpacity 
          className="bg-[#6D28D9] rounded-full h-[54px] justify-center items-center shadow-sm"
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text className="text-white text-[15px] font-Poppins-SemiBold">I Understand</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
