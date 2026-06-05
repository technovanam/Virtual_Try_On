import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationCard({ notification, onPress, onDelete }) {
  if (!notification) return null;

  // Format date loosely to "2h ago" or specific date format
  const formattedDate = new Date(notification.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const getIconData = (type) => {
    switch (type) {
      case 'analysis': return { name: 'analytics-outline', color: notification.isRead ? '#6B7280' : '#8B5CF6', bg: notification.isRead ? 'bg-gray-100' : 'bg-purple-100' };
      case 'try-on': return { name: 'camera-outline', color: notification.isRead ? '#6B7280' : '#3B82F6', bg: notification.isRead ? 'bg-gray-100' : 'bg-blue-100' };
      case 'recommendation': return { name: 'sparkles-outline', color: notification.isRead ? '#6B7280' : '#EAB308', bg: notification.isRead ? 'bg-gray-100' : 'bg-yellow-100' };
      case 'system': return { name: 'settings-outline', color: notification.isRead ? '#6B7280' : '#10B981', bg: notification.isRead ? 'bg-gray-100' : 'bg-green-100' };
      default: return { name: 'notifications-outline', color: notification.isRead ? '#6B7280' : '#3B82F6', bg: notification.isRead ? 'bg-gray-100' : 'bg-blue-100' };
    }
  };

  const iconData = getIconData(notification.type);

  return (
    <TouchableOpacity 
      className={`p-4 rounded-2xl border mb-3 flex-row items-start ${
        notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/30 border-blue-100'
      }`}
      onPress={() => onPress && onPress(notification)}
    >
      {/* Icon Area */}
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${iconData.bg}`}>
        <Ionicons name={iconData.name} size={20} color={iconData.color} />
      </View>

      {/* Content Area */}
      <View className="flex-1 pr-6">
        <View className="flex-row justify-between items-start mb-1">
          <Text className={`font-bold flex-1 mr-2 ${
            notification.isRead ? 'text-gray-900' : 'text-gray-900'
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
        >
          {notification.message}
        </Text>

        {notification.actionUrl && (
          <TouchableOpacity className="self-start mt-1">
            <Text className="text-blue-600 font-semibold text-sm">View Details</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread Badge & Delete Button Container */}
      <View className="absolute top-4 right-4 items-center">
        {!notification.isRead && (
          <View className="w-2.5 h-2.5 rounded-full bg-blue-500 mb-2" />
        )}
        <TouchableOpacity 
          onPress={() => onDelete && onDelete(notification)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
