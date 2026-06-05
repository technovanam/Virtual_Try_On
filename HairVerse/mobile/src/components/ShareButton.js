import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ShareSheetModal from './ShareSheetModal';
import { useShareStore } from '../store/shareStore';

export default function ShareButton({ imageUrl, resourceType, resourceId, title, className, iconSize = 24, iconColor = "#0F172A", showText = false }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isSharing } = useShareStore();

  const handlePress = () => {
    if (!imageUrl) return;
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity 
        className={`flex-row items-center justify-center p-3 rounded-full bg-surface border border-borderLight shadow-sm ${className || ''}`}
        onPress={handlePress}
        disabled={isSharing}
      >
        {isSharing ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <>
            <Ionicons name="share-social-outline" size={iconSize} color={iconColor} />
            {showText && <Text className="ml-2 font-bold" style={{ color: iconColor }}>Share</Text>}
          </>
        )}
      </TouchableOpacity>

      <ShareSheetModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        imageUrl={imageUrl}
        resourceType={resourceType}
        resourceId={resourceId}
        title={title}
      />
    </>
  );
}
