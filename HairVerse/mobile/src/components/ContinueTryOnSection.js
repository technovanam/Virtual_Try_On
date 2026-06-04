import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTryonStore } from '../store/tryonStore';
import SessionCard from './SessionCard';
import { useNavigation } from '@react-navigation/native';

const SkeletonSessionCard = () => (
  <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex-row items-center">
    <View className="w-16 h-16 rounded-xl bg-gray-200 mr-4" />
    <View className="flex-1">
      <View className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
      <View className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
      <View className="h-1.5 bg-gray-200 rounded-full w-full mb-1" />
      <View className="h-3 bg-gray-200 rounded w-1/4 self-end" />
    </View>
    <View className="ml-4 w-20 h-8 rounded-lg bg-gray-200" />
  </View>
);

export default function ContinueTryOnSection() {
  const { sessions, isLoading, error, fetchSessions } = useTryonStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <View className="mt-6 mb-2">
      <View className="flex-row justify-between items-end mb-4 px-1">
        <Text className="text-xl font-bold text-gray-900">Continue Try-On</Text>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View>
          <SkeletonSessionCard />
          <SkeletonSessionCard />
        </View>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <View className="bg-red-50 p-6 rounded-2xl items-center justify-center border border-red-100 mb-4">
          <Text className="text-red-500 font-medium text-center mb-3">
            {error || 'Failed to load try-on sessions.'}
          </Text>
          <TouchableOpacity 
            className="bg-red-500 py-2 px-6 rounded-xl"
            onPress={fetchSessions}
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !error && sessions.length === 0 && (
        <View className="bg-gray-50 p-8 rounded-2xl items-center justify-center border border-gray-200 border-dashed mb-4">
          <Text className="text-gray-500 font-medium text-center mb-4 text-base">
            No unfinished try-ons.
          </Text>
          <TouchableOpacity 
            className="bg-indigo-600 py-3 px-6 rounded-xl"
            onPress={() => navigation.navigate('Try-On')}
          >
            <Text className="text-white font-bold">Start New Try-On</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success State */}
      {!isLoading && !error && sessions.length > 0 && (
        <View>
          {sessions.map((session) => (
            <SessionCard 
              key={session.sessionId} 
              session={session} 
              onResume={(s) => navigation.navigate('VirtualTryOn', { sessionId: s.sessionId })}
            />
          ))}
        </View>
      )}
    </View>
  );
}
