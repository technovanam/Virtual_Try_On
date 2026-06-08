import React, { useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { downloadService } from '../services/downloadService';
import { useShareStore } from '../store/shareStore';

export default function DownloadButton({ imageUrl, resourceType, resourceId, className, style, iconSize = 24, iconColor = "#0F172A", showText = false }) {
  const { isDownloading, error, successMessage, clearStatus } = useShareStore();

  useEffect(() => {
    if (error) {
      Alert.alert('Download Failed', error, [{ text: 'OK', onPress: clearStatus }]);
    }
    if (successMessage) {
      Alert.alert('Success', successMessage, [{ text: 'OK', onPress: clearStatus }]);
    }
  }, [error, successMessage]);

  const handleDownload = () => {
    if (!imageUrl) return;
    downloadService.downloadImage(imageUrl, resourceType, resourceId);
  };

  return (
    <TouchableOpacity 
      className={`flex-row items-center justify-center p-3 rounded-full bg-surface border border-borderLight shadow-sm ${className || ''}`}
      style={style}
      onPress={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          <Ionicons name="download-outline" size={iconSize} color={iconColor} />
          {showText && <Text className="ml-2 font-bold" style={{ color: iconColor }}>Save</Text>}
        </>
      )}
    </TouchableOpacity>
  );
}
