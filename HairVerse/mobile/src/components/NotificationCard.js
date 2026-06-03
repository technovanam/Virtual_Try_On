import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function NotificationCard({ notification, onPress }) {
  if (!notification) return null;

  // Format date loosely to "2h ago" or specific date format
  const formattedDate = new Date(notification.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <TouchableOpacity 
      className={`p-4 rounded-2xl border mb-3 flex-row items-start ${
        notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'
      }`}
      onPress={() => onPress && onPress(notification)}
    >
      {/* Icon Area */}
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
        notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
      }`}>
        {/* Placeholder for an actual icon */}
        <Text className={notification.isRead ? 'text-gray-500' : 'text-blue-600'}>!</Text>
      </View>

      {/* Content Area */}
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className={`font-bold flex-1 mr-2 ${
            notification.isRead ? 'text-gray-900' : 'text-blue-900'
          }`}>
            {notification.title}
          </Text>
          
          <Text className="text-gray-400 text-xs">
            {formattedDate}
          </Text>
        </View>

        <Text className={`text-sm mb-2 ${
            notification.isRead ? 'text-gray-500' : 'text-gray-700'
          }`}
          numberOfLines={2}
        >
          {notification.message}
        </Text>

        {notification.actionUrl && (
          <TouchableOpacity className="self-start mt-1">
            <Text className="text-blue-600 font-semibold text-sm">View Details</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread Badge indicator dot */}
      {!notification.isRead && (
        <View className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute top-4 right-4" />
      )}
    </TouchableOpacity>
  );
}
