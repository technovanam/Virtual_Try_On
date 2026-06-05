import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNotificationsStore } from '../store/notificationsStore';
import NotificationCard from './NotificationCard';
import { useNavigation } from '@react-navigation/native';

const SkeletonNotificationCard = () => (
  <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3 flex-row items-start">
    <View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
    <View className="flex-1">
      <View className="flex-row justify-between mb-2">
        <View className="h-4 bg-gray-200 rounded w-1/2" />
        <View className="h-3 bg-gray-200 rounded w-1/4" />
      </View>
      <View className="h-3 bg-gray-200 rounded w-full mb-1" />
      <View className="h-3 bg-gray-200 rounded w-2/3" />
    </View>
  </View>
);

export default function NotificationsSection() {
  const { notifications, unreadCount, isLoading, error, fetchNotifications, markAsRead, deleteNotification } = useNotificationsStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) {
        markAsRead(n.notificationId);
      }
    });
  };

  return (
    <View className="mt-6 mb-2">
      <View className="flex-row justify-between items-center mb-4 px-1">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-gray-900 mr-2">Notifications</Text>
          {!isLoading && !error && unreadCount > 0 && (
            <View className="bg-red-500 px-2 py-0.5 rounded-full">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
        {(!isLoading && !error && unreadCount > 0) && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text className="text-blue-500 font-semibold">Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading State */}
      {isLoading && (
        <View>
          <SkeletonNotificationCard />
          <SkeletonNotificationCard />
          <SkeletonNotificationCard />
        </View>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <View className="bg-red-50 p-6 rounded-2xl items-center justify-center border border-red-100 mb-4">
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

      {/* Empty State */}
      {!isLoading && !error && notifications.length === 0 && (
        <View className="bg-gray-50 p-8 rounded-2xl items-center justify-center border border-gray-200 border-dashed mb-4">
          <Text className="text-gray-500 font-medium text-center text-base">
            No notifications yet.
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            We'll let you know when there's an update.
          </Text>
        </View>
      )}

      {/* Success State */}
      {!isLoading && !error && notifications.length > 0 && (
        <View>
          {notifications.slice(0, 3).map((notification) => (
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
          
          {notifications.length > 3 && (
            <TouchableOpacity className="py-2 items-center mt-1" onPress={() => navigation.navigate('Notifications')}>
              <Text className="text-gray-500 font-semibold text-sm">View All Notifications</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
