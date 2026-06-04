import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useCameraStore } from '../store/useCameraStore';

export default function LiveCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  
  const { 
    capturedImage, 
    setCapturedImage, 
    clearImage, 
    uploadImage, 
    uploading, 
    error 
  } = useCameraStore();

  useEffect(() => {
    // Clean up state on unmount
    return () => clearImage();
  }, []);

  if (!permission) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#00d2ff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-[#1a1a2e] justify-center items-center px-6">
        <Text className="text-white text-xl font-bold text-center mb-4">
          Camera Access Required
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          We need your permission to use the camera for capturing your photo.
        </Text>
        <TouchableOpacity 
          className="bg-[#00d2ff] py-4 px-8 rounded-full w-full"
          onPress={requestPermission}
        >
          <Text className="text-[#1a1a2e] text-center font-bold text-lg">Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="mt-4 py-4 px-8 w-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-400 text-center font-semibold text-lg">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        // On web, photo.base64 or photo.uri might already contain the 'data:image...' prefix.
        let imageUri = photo.uri;
        if (photo.base64) {
          imageUri = photo.base64.startsWith('data:') 
            ? photo.base64 
            : `data:image/jpeg;base64,${photo.base64}`;
        }
        setCapturedImage(imageUri);
      } catch (err) {
        console.error("Failed to take picture:", err);
      }
    }
  };

  const handleUsePhoto = async () => {
    if (!capturedImage) return;
    try {
      await uploadImage(capturedImage);
      // Navigation would typically go to a processing or preview screen here
      navigation.replace('Placeholder', { title: 'Analysis Pending' });
    } catch (err) {
      // Error is handled in the store and displayed below
    }
  };

  const renderPreview = () => (
    <View style={StyleSheet.absoluteFillObject} className="z-50 bg-black">
      <Image 
        source={{ uri: capturedImage }} 
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      
      {uploading && (
        <View className="absolute inset-0 bg-black/60 justify-center items-center z-50">
          <ActivityIndicator size="large" color="#00d2ff" />
          <Text className="text-white font-bold mt-4 text-lg">Uploading Photo...</Text>
        </View>
      )}

      {error && !uploading && (
        <View className="absolute top-12 mx-4 p-4 bg-red-500/90 rounded-xl z-50">
          <Text className="text-white text-center font-semibold">{error}</Text>
        </View>
      )}

      {!uploading && (
        <View className="absolute bottom-10 left-0 right-0 flex-row justify-between px-8 z-50">
          <TouchableOpacity 
            className="bg-black/50 p-4 rounded-full border border-white/30"
            onPress={clearImage}
          >
            <Text className="text-white font-semibold">Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-[#00d2ff] py-4 px-8 rounded-full shadow-lg"
            style={{ elevation: 5 }}
            onPress={handleUsePhoto}
          >
            <Text className="text-[#1a1a2e] font-bold text-lg">Use Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-black relative">
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject} 
        facing={facing}
      />
      
      {capturedImage ? renderPreview() : (
        <SafeAreaView className="flex-1 justify-between">
          <View className="px-6 pt-4 flex-row justify-end">
            <TouchableOpacity 
              className="bg-black/40 p-3 rounded-full"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center pb-12 px-10 relative">
            <View className="absolute left-10">
               {/* Empty placeholder for alignment */}
            </View>
            
            <TouchableOpacity 
              onPress={takePicture}
              className="w-20 h-20 rounded-full border-4 border-[#00d2ff] bg-white/20 items-center justify-center p-1"
            >
              <View className="w-full h-full bg-white rounded-full" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="absolute right-10 bg-black/40 p-4 rounded-full"
              onPress={toggleCameraFacing}
            >
              <Text className="text-white font-bold">Flip</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
