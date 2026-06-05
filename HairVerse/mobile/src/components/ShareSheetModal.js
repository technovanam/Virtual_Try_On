import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shareService } from '../services/shareService';

export default function ShareSheetModal({ visible, onClose, imageUrl, resourceType, resourceId, title = 'Check out my HairVerse result!' }) {
  
  const handlePlatformShare = async (platform) => {
    let url = '';
    const message = encodeURIComponent(`${title} ${imageUrl}`);
    
    switch(platform) {
      case 'whatsapp':
        url = `whatsapp://send?text=${message}`;
        break;
      case 'x':
        url = `twitter://post?message=${message}`;
        break;
      case 'telegram':
        url = `tg://msg?text=${message}`;
        break;
      case 'facebook':
        // FB usually just takes URLs
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
        break;
      case 'native':
      default:
        await shareService.shareImage(imageUrl, resourceType, resourceId, platform);
        onClose();
        return;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        await shareService.trackShare(resourceType, resourceId, platform);
      } else {
        // Fallback to native share
        await shareService.shareImage(imageUrl, resourceType, resourceId, platform);
      }
    } catch (e) {
      await shareService.shareImage(imageUrl, resourceType, resourceId, platform);
    }
    onClose();
  };

  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
    { id: 'x', name: 'X (Twitter)', icon: 'logo-twitter', color: '#1DA1F2' },
    { id: 'telegram', name: 'Telegram', icon: 'paper-plane-outline', color: '#0088cc' },
    { id: 'native', name: 'More Options', icon: 'ellipsis-horizontal', color: '#64748B' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-textPrimary">Share Result</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-surface rounded-full">
              <Ionicons name="close" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {platforms.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                className="items-center w-1/3 mb-6"
                onPress={() => handlePlatformShare(platform.id)}
              >
                <View 
                  className="w-14 h-14 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: `${platform.color}15` }}
                >
                  <Ionicons name={platform.icon} size={28} color={platform.color} />
                </View>
                <Text className="text-xs font-medium text-textSecondary text-center">
                  {platform.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
