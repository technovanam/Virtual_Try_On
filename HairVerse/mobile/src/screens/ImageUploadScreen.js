import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  FlatList,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useSelfieStore } from '../store/selfieStore';
import { Ionicons } from '@expo/vector-icons';

export default function ImageUploadScreen() {
  const { 
    selfies, 
    isLoading, 
    isUploading,
    isFetchingMore,
    hasMore,
    error, 
    fetchSelfies,
    fetchMoreSelfies,
    uploadSelfie, 
    setActiveSelfie, 
    deleteSelfie,
    clearError
  } = useSelfieStore();

  useEffect(() => {
    fetchSelfies();
  }, []);

  const validateAndUpload = async (uri, source) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      // Validate size (10MB)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (fileInfo.size > MAX_SIZE) {
        Alert.alert("File Too Large", "Please select an image smaller than 10MB.");
        return;
      }

      await uploadSelfie(uri, source);
    } catch (err) {
      Alert.alert("Upload Failed", err.message || "Something went wrong.");
    }
  };

  const handlePickGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      validateAndUpload(result.assets[0].uri, 'gallery');
    }
  };

  const handleCaptureCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      validateAndUpload(result.assets[0].uri, 'camera');
    }
  };

  const handleSetActive = async (imageId) => {
    try {
      await setActiveSelfie(imageId);
    } catch (err) {
      Alert.alert("Action Failed", err.message || "Could not set active selfie.");
    }
  };

  const handleDelete = (imageId) => {
    Alert.alert(
      "Delete Selfie",
      "Are you sure you want to delete this selfie? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteSelfie(imageId);
            } catch (err) {
              Alert.alert("Delete Failed", err.message || "Could not delete selfie.");
            }
          } 
        }
      ]
    );
  };

  const renderHeader = () => (
    <View className="mb-6 mt-4">
      <Text className="text-3xl font-bold text-white mb-2">My Selfies</Text>
      <Text className="text-slate-400 mb-6">
        Upload or capture selfies for virtual try-on and AI analysis.
      </Text>
      
      {/* Error Banner */}
      {error && (
        <View className="bg-red-500/20 p-4 rounded-xl border border-red-500/50 mb-6 flex-row justify-between items-center">
          <Text className="text-red-200 flex-1 mr-4">{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name="close" size={20} color="#fca5a5" />
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Buttons */}
      <View className="flex-row justify-between space-x-4 mb-2">
        <TouchableOpacity 
          onPress={handleCaptureCamera}
          disabled={isUploading}
          className={`flex-1 bg-indigo-600 flex-row justify-center items-center py-4 rounded-2xl ${isUploading ? 'opacity-50' : ''}`}
        >
          <Ionicons name="camera" size={24} color="white" className="mr-2" />
          <Text className="text-white font-semibold text-base ml-2">Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handlePickGallery}
          disabled={isUploading}
          className={`flex-1 bg-slate-800 border border-slate-700 flex-row justify-center items-center py-4 rounded-2xl ${isUploading ? 'opacity-50' : ''}`}
        >
          <Ionicons name="images" size={24} color="white" className="mr-2" />
          <Text className="text-white font-semibold text-base ml-2">Gallery</Text>
        </TouchableOpacity>
      </View>

      {isUploading && (
        <View className="bg-slate-800 rounded-2xl p-6 mt-6 flex-row items-center justify-center border border-indigo-500/30">
          <ActivityIndicator color="#818cf8" size="small" className="mr-3" />
          <Text className="text-indigo-200 font-medium">Uploading your image...</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyComponent = () => {
    if (isLoading && !isUploading) {
      return (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator color="#818cf8" size="large" />
        </View>
      );
    }
    if (!isUploading && selfies.length === 0) {
      return (
        <View className="py-12 items-center justify-center">
          <Ionicons name="image-outline" size={64} color="#475569" className="mb-4" />
          <Text className="text-slate-400 text-center font-medium">No selfies uploaded yet</Text>
        </View>
      );
    }
    return null;
  };

  const renderFooter = () => {
    if (isFetchingMore) {
      return (
        <View className="py-6 items-center justify-center">
          <ActivityIndicator color="#818cf8" size="small" />
        </View>
      );
    }
    return <View className="h-10" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <FlatList
        className="flex-1 px-6"
        data={selfies}
        keyExtractor={(item) => item.imageId}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (hasMore && !isFetchingMore && !isLoading) {
            fetchMoreSelfies();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading && !isFetchingMore && selfies.length > 0} 
            onRefresh={fetchSelfies} 
            tintColor="#818cf8"
          />
        }
        renderItem={({ item: selfie }) => (
          <View 
            className={`w-[48%] mb-6 rounded-2xl overflow-hidden border-2 ${
              selfie.isActive ? 'border-indigo-500' : 'border-slate-800'
            }`}
          >
            <Image 
              source={{ uri: selfie.imageUrl }} 
              className="w-full h-48 bg-slate-800"
              resizeMode="cover"
            />
            
            {selfie.isActive && (
              <View className="absolute top-2 right-2 bg-indigo-500 px-2 py-1 rounded-md flex-row items-center">
                <Ionicons name="checkmark-circle" size={14} color="white" />
                <Text className="text-white text-xs font-bold ml-1">Active</Text>
              </View>
            )}
            
            <View className="bg-slate-800 p-3 flex-row justify-between items-center">
              {!selfie.isActive ? (
                <TouchableOpacity 
                  onPress={() => handleSetActive(selfie.imageId)}
                  className="bg-indigo-600/20 px-3 py-1.5 rounded flex-1 mr-2"
                >
                  <Text className="text-indigo-400 text-xs font-semibold text-center">Set Active</Text>
                </TouchableOpacity>
              ) : (
                <View className="px-3 py-1.5 flex-1 mr-2">
                  <Text className="text-slate-400 text-xs text-center">Active</Text>
                </View>
              )}
              
              <TouchableOpacity onPress={() => handleDelete(selfie.imageId)} className="p-1">
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
