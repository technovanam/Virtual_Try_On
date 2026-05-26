import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import { useAnalysisStore } from '../store/analysisStore';

export default function AIAnalysisScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const { submitImage, isAnalyzing } = useAnalysisStore();

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to upload your photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setBase64Image(result.assets[0].base64);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your camera to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setBase64Image(result.assets[0].base64);
    }
  };

  const startAnalysis = async () => {
    if (!base64Image) {
      Alert.alert('Error', 'Please select or take an image first.');
      return;
    }
    
    // Call analysisStore
    await submitImage(base64Image);
    navigation.navigate('Recommendation');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Face Shape Analysis</Text>
      
      {isAnalyzing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Analyzing face shape...</Text>
          <Text style={styles.subLoadingText}>Detecting eyes, forehead & hair texture</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.scanPlaceholder}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <Text style={styles.placeholderText}>No Photo Selected</Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.btnSec} onPress={pickImage}>
              <Text style={styles.btnSecText}>Upload Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSec} onPress={takePhoto}>
              <Text style={styles.btnSecText}>Take Selfie</Text>
            </TouchableOpacity>
          </View>

          {imageUri && (
            <TouchableOpacity style={styles.btn} onPress={startAnalysis}>
              <Text style={styles.btnText}>Start AI Scanning</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
  content: {
    alignItems: 'center',
  },
  scanPlaceholder: {
    width: 260,
    height: 340,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnSec: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
  btnSecText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subLoadingText: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontSize: 14,
  },
});
