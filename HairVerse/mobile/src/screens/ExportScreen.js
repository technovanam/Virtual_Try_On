import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useExportStore } from '../store/exportStore';
import { formatDistanceToNow } from '../utils/dateUtils';

export default function ExportScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Expecting parameters from the screen that triggered the export
  const { imageUrl, exportType = 'tryon', resourceId = 'unknown' } = route.params || {};

  const { downloadAsset, isDownloading, isLoading, fetchExportHistory, exportHistory } = useExportStore();
  
  const [format, setFormat] = useState('jpg'); // jpg, png
  const [quality, setQuality] = useState('hd'); // standard, hd, ultrahd

  useEffect(() => {
    fetchExportHistory();
  }, []);

  const handleDownload = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'No image provided for export.');
      return;
    }

    if (quality === 'ultrahd') {
      Alert.alert('Pro Feature', 'Ultra HD export requires a HairVerse Pro subscription.');
      return;
    }

    const success = await downloadAsset({
      imageUrl,
      exportType,
      resourceId,
      format,
      quality
    });

    if (success) {
      Alert.alert('Success', `Image securely saved to your device's photo gallery.`);
    }
  };

  const FormatChip = ({ value, label }) => (
    <TouchableOpacity 
      className={`px-6 py-2.5 rounded-full border mr-3 ${format === value ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
      onPress={() => setFormat(value)}
    >
      <Text className={`font-bold ${format === value ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
    </TouchableOpacity>
  );

  const QualityRow = ({ value, label, subLabel, isPro }) => (
    <TouchableOpacity 
      className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border ${quality === value ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}
      onPress={() => setQuality(value)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className={`w-5 h-5 rounded-full border-2 mr-4 items-center justify-center ${quality === value ? 'border-indigo-600' : 'border-gray-300'}`}>
          {quality === value && <View className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
        </View>
        <View>
          <Text className={`text-base font-bold ${quality === value ? 'text-indigo-900' : 'text-gray-900'}`}>{label}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">{subLabel}</Text>
        </View>
      </View>
      {isPro && (
        <View className="bg-amber-100 px-2 py-1 rounded-md flex-row items-center">
          <Ionicons name="lock-closed" size={12} color="#D97706" />
          <Text className="text-[10px] font-black text-amber-600 uppercase ml-1">Pro</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-4 bg-white border-b border-gray-100 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 flex-1">Export</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Preview Area */}
        <View className="p-6 items-center border-b border-gray-100 bg-white shadow-sm">
           {imageUrl ? (
             <Image 
                source={{ uri: imageUrl }} 
                className="w-48 h-64 rounded-2xl bg-gray-100 border border-gray-200"
                resizeMode="cover"
             />
           ) : (
             <View className="w-48 h-64 rounded-2xl bg-gray-100 border border-gray-200 items-center justify-center">
                <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-400 mt-2 font-medium">No Preview</Text>
             </View>
           )}
        </View>

        {/* Configuration Area */}
        <View className="px-5 mt-8">
           <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">1. Format</Text>
           <View className="flex-row mb-8">
              <FormatChip value="jpg" label="JPG" />
              <FormatChip value="png" label="PNG" />
           </View>

           <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">2. Quality</Text>
           <QualityRow value="standard" label="Standard" subLabel="Fastest download, good for sharing" />
           <QualityRow value="hd" label="High Definition" subLabel="Best for printing and saving" />
           <QualityRow value="ultrahd" label="Ultra HD (4K)" subLabel="Lossless raw quality" isPro />
        </View>

        {/* Action Buttons */}
        <View className="px-5 mt-6 mb-8">
           <TouchableOpacity 
              className={`py-4 rounded-2xl flex-row items-center justify-center shadow-sm ${isDownloading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
              onPress={handleDownload}
              disabled={isDownloading}
           >
              {isDownloading ? (
                 <ActivityIndicator color="#FFFFFF" />
              ) : (
                 <>
                   <Ionicons name="download-outline" size={24} color="#FFFFFF" className="mr-2" />
                   <Text className="text-white font-black text-lg ml-2">Download Now</Text>
                 </>
              )}
           </TouchableOpacity>

           <TouchableOpacity 
              className="mt-4 py-4 rounded-2xl flex-row items-center justify-center bg-white border border-gray-200"
              onPress={() => navigation.navigate('Saved', { saveUrl: imageUrl })}
           >
              <Ionicons name="bookmark-outline" size={20} color="#4B5563" className="mr-2" />
              <Text className="text-gray-700 font-bold ml-2">Save to Collection</Text>
           </TouchableOpacity>
        </View>

        {/* Export History */}
        <View className="px-5 pt-6 border-t border-gray-100">
           <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Recent Exports</Text>
           {isLoading ? (
             <ActivityIndicator color="#4F46E5" className="my-4" />
           ) : exportHistory.length === 0 ? (
             <View className="bg-gray-50 p-6 rounded-2xl items-center border border-gray-100">
               <Text className="text-gray-500 font-medium">No previous exports found.</Text>
             </View>
           ) : (
             exportHistory.map((item) => (
               <View key={item.exportId} className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 mb-3">
                  <View className="flex-row items-center flex-1">
                     <View className="w-10 h-10 bg-indigo-50 rounded-lg items-center justify-center mr-3">
                        <Ionicons name={item.format === 'png' ? 'image' : 'images'} size={20} color="#4F46E5" />
                     </View>
                     <View>
                        <Text className="text-gray-900 font-bold capitalize">{item.exportType} Export</Text>
                        <Text className="text-gray-400 text-xs mt-0.5">
                           {item.quality.toUpperCase()} • {formatDistanceToNow(new Date(item.exportedAt), { addSuffix: true })}
                        </Text>
                     </View>
                  </View>
                  <TouchableOpacity onPress={() => {}}>
                     <Ionicons name="cloud-download-outline" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
               </View>
             ))
           )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
