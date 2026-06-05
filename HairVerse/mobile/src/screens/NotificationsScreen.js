import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useNotificationsStore } from '../store/notificationsStore';
import NotificationCard from '../components/NotificationCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NotificationsScreen() {
  const { notifications, isLoading, error, fetchNotifications, markAsRead, deleteNotification } = useNotificationsStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) markAsRead(n.notificationId);
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 hit-slop-10">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text className="text-blue-500 font-semibold">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}

        {!isLoading && error && (
          <View className="bg-red-50 p-6 rounded-2xl items-center justify-center border border-red-100">
            <Text className="text-red-500 font-medium text-center mb-3">
              {error || 'Failed to load notifications.'}
            </Text>
            <TouchableOpacity 
              className="bg-red-500 py-2 px-6 rounded-xl"
              onPress={fetchNotifications}
            >
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <View className="bg-white p-8 rounded-2xl items-center justify-center border border-gray-100 shadow-sm mt-10">
            <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" className="mb-4" />
            <Text className="text-gray-900 font-bold text-lg mt-4">
              No notifications yet
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              When you get updates about analysis, try-ons, or recommendations, they'll show up here.
            </Text>
          </View>
        )}

        {!isLoading && !error && notifications.length > 0 && (
          <View className="pb-10">
            {notifications.map((notification) => (
              <NotificationCard 
                key={notification.notificationId} 
                notification={notification} 
                onPress={(n) => {
                  if (!n.isRead) markAsRead(n.notificationId);
                  if (n.actionUrl) navigation.navigate(n.actionUrl);
                }}
                onDelete={(n) => deleteNotification(n.notificationId)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
