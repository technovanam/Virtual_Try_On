import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useNotificationsStore } from '../store/notificationsStore';
import NotificationCard from '../components/NotificationCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NotificationsScreen() {
  const { 
    isLoading, error, fetchNotifications, markAllAsRead, deleteNotification, markAsRead,
    searchQuery, setSearchQuery, activeCategory, setActiveCategory, filter, setFilter, sortBy, setSortBy,
    getFilteredNotifications, unreadCount
  } = useNotificationsStore();
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'recommendation', label: 'Matches' },
    { id: 'hairstyle_trend', label: 'Trends' },
    { id: 'hair_insight', label: 'Insights' },
    { id: 'saved_reminder', label: 'Reminders' },
  ];

  const filteredNotifications = getFilteredNotifications();

  const handleNotificationPress = (notification) => {
    if (!notification.isRead) markAsRead(notification.notificationId);
    
    // Deep Linking Logic
    if (notification.actionType === 'view_recommendation') {
      navigation.navigate('Recommendations');
    } else if (notification.actionType === 'view_insight') {
      navigation.navigate('AIInsights');
    } else if (notification.actionType === 'view_saved') {
      navigation.navigate('Saved');
    } else if (notification.actionType === 'view_tryon' && notification.actionId) {
      navigation.navigate('VirtualTryOn', { sessionId: notification.actionId });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2 bg-white border-b border-gray-100 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 flex-1">Updates</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="w-10 h-10 items-center justify-center">
           <Ionicons name="settings-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Search and Sort Row */}
      <View className="bg-white px-5 py-3 flex-row items-center space-x-3 border-b border-gray-50">
        <View className="flex-1 bg-gray-100 rounded-xl flex-row items-center px-3 py-2">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput 
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search alerts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          className="bg-gray-100 p-2.5 rounded-xl flex-row items-center"
          onPress={() => setFilter(filter === 'all' ? 'unread' : 'all')}
        >
          <Ionicons name="funnel" size={18} color={filter === 'unread' ? '#4F46E5' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>

      {/* Action Bar (Mark all read) */}
      <View className="bg-white px-5 py-2 flex-row justify-between items-center border-b border-gray-100">
         <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider">
           {unreadCount > 0 ? `${unreadCount} Unread` : 'All caught up'}
         </Text>
         {unreadCount > 0 && (
           <TouchableOpacity onPress={markAllAsRead}>
             <Text className="text-indigo-600 font-bold text-sm">Mark all read</Text>
           </TouchableOpacity>
         )}
      </View>

      {/* Category Tabs */}
      <View className="bg-white border-b border-gray-100 pb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-2">
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              className={`px-4 py-2 rounded-full mr-3 border ${activeCategory === tab.id ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
              onPress={() => setActiveCategory(tab.id)}
            >
              <Text className={`font-semibold ${activeCategory === tab.id ? 'text-white' : 'text-gray-600'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        )}

        {!isLoading && error && (
          <View className="bg-red-50 p-6 rounded-2xl items-center justify-center border border-red-100 mb-6">
            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" className="mb-2" />
            <Text className="text-red-500 font-medium text-center mb-4">{error}</Text>
            <TouchableOpacity className="bg-red-500 px-6 py-2 rounded-lg" onPress={fetchNotifications}>
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && filteredNotifications.length === 0 && (
          <View className="bg-white p-10 rounded-3xl items-center justify-center border border-gray-100 shadow-sm mt-10">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="notifications-off-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">No notifications found.</Text>
            <Text className="text-gray-500 text-center text-sm">
              {searchQuery ? `Nothing matches "${searchQuery}" in this category.` : 'You are all caught up! New alerts will appear here.'}
            </Text>
          </View>
        )}

        {!isLoading && !error && filteredNotifications.length > 0 && (
          <View className="pb-10">
            {filteredNotifications.map((notification) => (
              <NotificationCard 
                key={notification.notificationId} 
                notification={notification} 
                onPress={handleNotificationPress}
                onDelete={(n) => deleteNotification(n.notificationId)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
