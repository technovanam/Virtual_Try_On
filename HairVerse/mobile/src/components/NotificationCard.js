import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from '../utils/dateUtils';

const categoryConfig = {
  recommendation: { icon: 'bulb', color: '#F59E0B', bg: '#FEF3C7', label: 'Recommendation' },
  hairstyle_trend: { icon: 'trending-up', color: '#EC4899', bg: '#FCE7F3', label: 'Trend Alert' },
  hair_insight: { icon: 'medical', color: '#10B981', bg: '#D1FAE5', label: 'Hair Insight' },
  saved_reminder: { icon: 'bookmark', color: '#3B82F6', bg: '#DBEAFE', label: 'Reminder' },
  system_update: { icon: 'information-circle', color: '#6B7280', bg: '#F3F4F6', label: 'Update' }
};

export default function NotificationCard({ notification, onPress, onDelete }) {
  const config = categoryConfig[notification.category] || categoryConfig.system_update;
  const isUnread = !notification.isRead;
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <TouchableOpacity 
      className={`bg-white rounded-2xl p-4 mb-3 border ${isUnread ? 'border-purple-200 shadow-sm' : 'border-gray-100'} flex-row`}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View className="w-12 h-12 rounded-full items-center justify-center mr-4 mt-1" style={{ backgroundColor: config.bg }}>
        <Ionicons name={config.icon} size={24} color={config.color} />
        {isUnread && (
          <View className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-600 border-2 border-white rounded-full" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{config.label}</Text>
          <Text className="text-xs text-gray-400 font-medium">{timeAgo}</Text>
        </View>
        <Text className={`text-base mb-1 ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
          {notification.title}
        </Text>
        <Text className={`text-sm ${isUnread ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
          {notification.message}
        </Text>
      </View>

      {/* Delete Action */}
      <TouchableOpacity className="ml-2 mt-1 p-1" onPress={() => onDelete(notification)}>
        <Ionicons name="close" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
