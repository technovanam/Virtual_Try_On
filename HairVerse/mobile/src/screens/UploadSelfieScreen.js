import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { handleOpenCamera, handleOpenGallery } from '../services/imagePickerService';
import { useUploadStore } from '../store/uploadStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function UploadSelfieScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();
  
  const { 
    isUploading, 
    progress, 
    error, 
    success, 
    imageUrl, 
    uploadSelfie, 
    resetUpload 
  } = useUploadStore();

  const pickImage = async () => {
    const uri = await handleOpenGallery();
    if (uri) {
      setSelectedImage(uri);
      resetUpload();
    }
  };

  const takePhoto = async () => {
    const uri = await handleOpenCamera();
    if (uri) {
      setSelectedImage(uri);
      resetUpload();
    }
  };

  const handleUpload = () => {
    if (selectedImage) {
      uploadSelfie(selectedImage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        
        {/* Header */}
        <View className="flex-row items-center mb-8 mt-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full bg-surface">
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-primary ml-4">Upload Selfie</Text>
        </View>

        {/* Content Area */}
        <View className="flex-1 justify-center items-center">
          
          {/* Success State */}
          {success ? (
            <View className="w-full items-center">
              <View className="w-64 h-80 rounded-3xl overflow-hidden mb-6 shadow-xl border-4 border-green-500">
                <Image source={{ uri: imageUrl || selectedImage }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute top-4 right-4 bg-green-500 p-2 rounded-full">
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-primary mb-2 text-center">Ready for analysis</Text>
              <Text className="text-secondary text-center mb-8 px-4">
                Your selfie has been securely uploaded and is ready for AI try-on and analysis.
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('AIAnalysis', { analysisId: 'new_analysis_123' })}
                className="w-full bg-primary py-4 rounded-xl items-center"
              >
                <Text className="text-white font-semibold text-lg">Start AI Analysis</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Image Selection / Preview */}
              <View className="w-64 h-80 bg-surface rounded-3xl overflow-hidden mb-8 shadow-lg border border-border justify-center items-center">
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="items-center p-6">
                    <View className="bg-slate-100 p-6 rounded-full mb-4">
                      <Ionicons name="camera" size={48} color="#94A3B8" />
                    </View>
                    <Text className="text-secondary text-center text-sm">
                      Take a clear selfie with good lighting for the best AI analysis
                    </Text>
                  </View>
                )}

                {/* Upload Progress Overlay */}
                {isUploading && (
                  <View className="absolute inset-0 bg-black/60 justify-center items-center">
                    <ActivityIndicator size="large" color="#FFFFFF" className="mb-4" />
                    <Text className="text-white font-bold text-xl">{progress}%</Text>
                    <Text className="text-slate-200 mt-2">Uploading securely...</Text>
                  </View>
                )}
              </View>

              {/* Error State */}
              {error && (
                <View className="w-full bg-red-50 p-4 rounded-xl mb-6 flex-row items-center">
                  <Ionicons name="alert-circle" size={24} color="#EF4444" />
                  <Text className="text-red-600 ml-3 flex-1">{error}</Text>
                </View>
              )}

              {/* Actions */}
              <View className="w-full space-y-4">
                {!isUploading && !selectedImage && (
                  <View className="flex-row space-x-4">
                    <TouchableOpacity 
                      onPress={takePhoto}
                      className="flex-1 bg-surface py-4 rounded-xl items-center border border-border flex-row justify-center space-x-2"
                    >
                      <Ionicons name="camera-outline" size={20} color="#0F172A" />
                      <Text className="text-primary font-semibold">Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={pickImage}
                      className="flex-1 bg-surface py-4 rounded-xl items-center border border-border flex-row justify-center space-x-2"
                    >
                      <Ionicons name="images-outline" size={20} color="#0F172A" />
                      <Text className="text-primary font-semibold">Gallery</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!isUploading && selectedImage && !error && (
                  <>
                    <TouchableOpacity 
                      onPress={handleUpload}
                      className="w-full bg-primary py-4 rounded-xl items-center shadow-lg shadow-slate-300"
                    >
                      <Text className="text-white font-semibold text-lg">Upload Selfie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setSelectedImage(null)}
                      className="w-full py-4 items-center"
                    >
                      <Text className="text-secondary font-medium">Choose a different photo</Text>
                    </TouchableOpacity>
                  </>
                )}

                {error && (
                  <View className="w-full">
                    <TouchableOpacity 
                      onPress={handleUpload}
                      className="w-full bg-primary py-4 rounded-xl items-center shadow-lg shadow-slate-300 mb-3"
                    >
                      <Text className="text-white font-semibold text-lg">Retry Upload</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setSelectedImage(null)}
                      className="w-full py-4 items-center"
                    >
                      <Text className="text-secondary font-medium">Choose a different photo</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

        </View>
      </View>
    </SafeAreaView>
  );
}
