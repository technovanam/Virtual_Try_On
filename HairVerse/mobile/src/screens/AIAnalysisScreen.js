import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAnalysisStore } from '../store/analysisStore';

const AIAnalysisScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { analysisId } = route.params || {};

  const { status, progress, error, pollStatus, reset, setAnalysisId, analysisId: storeAnalysisId } = useAnalysisStore();
  const activeAnalysisId = analysisId || storeAnalysisId;

  useEffect(() => {
    if (analysisId) {
      setAnalysisId(analysisId);
    }
  }, [analysisId, setAnalysisId]);

  useEffect(() => {
    if (status === 'completed' && activeAnalysisId) {
      navigation.replace('AIAnalysisResult', { analysisId: activeAnalysisId });
    }
  }, [status, activeAnalysisId, navigation]);

  const handleRetry = () => {
    reset();
    navigation.goBack();
  };

  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0F172A" />
            <Text className="mt-6 text-xl font-semibold text-textPrimary">Preparing Analysis</Text>
            <Text className="mt-2 text-textSecondary text-center px-6">
              Setting up the AI engines for your personal profile.
            </Text>
          </View>
        );
      
      case 'processing':
        return (
          <View className="flex-1 justify-center items-center w-full px-8">
            <ActivityIndicator size="large" color="#0F172A" />
            <Text className="mt-6 text-xl font-semibold text-textPrimary">Analyzing your hair profile</Text>
            
            {/* Progress UI */}
            <View className="w-full h-2 bg-gray-200 rounded-full mt-8 overflow-hidden">
              <View 
                className="h-full bg-primary" 
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} 
              />
            </View>
            <Text className="mt-2 text-sm text-textSecondary font-medium">{progress}% Complete</Text>
          </View>
        );

      case 'completed':
        return (
          <View className="flex-1 justify-center items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-6">
              <Text className="text-green-600 text-3xl">✓</Text>
            </View>
            <Text className="text-2xl font-bold text-textPrimary">Analysis Ready</Text>
            <Text className="mt-2 text-textSecondary">Redirecting to your recommendations...</Text>
          </View>
        );

      case 'failed':
        return (
          <View className="flex-1 justify-center items-center px-8">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-6">
              <Text className="text-red-600 text-3xl">!</Text>
            </View>
            <Text className="text-2xl font-bold text-textPrimary mb-2">Analysis Failed</Text>
            <Text className="text-textSecondary text-center mb-8">
              {error || 'We encountered an error while analyzing your profile. Please try again.'}
            </Text>
            
            <TouchableOpacity 
              className="bg-primary px-8 py-4 rounded-full w-full"
              onPress={handleRetry}
            >
              <Text className="text-white text-center font-semibold text-lg">Retry Analysis</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-textSecondary">Waiting for analysis to start...</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

export default AIAnalysisScreen;
