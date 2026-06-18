import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { handleOpenCamera, handleOpenGallery } from '../services/imagePickerService';
import { useUploadStore } from '../store/uploadStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAnalysisStore } from '../store/analysisStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function UploadSelfieScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
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
      setIsValidating(true);
      // Simulate image validation (face detection, lighting check)
      setTimeout(() => {
        setIsValidating(false);
        uploadSelfie(selectedImage);
      }, 1500);
    }
  };

  const handleAction = (action) => {
    const finalImage = imageUrl || selectedImage;
    if (action === 'AIAnalysis') {
      useAnalysisStore.getState().startAnalysis(finalImage);
      navigation.navigate('AIAnalysis');
    } else if (action === 'Recommendations') {
      navigation.navigate('Recommendations');
    } else if (action === 'VirtualTryOn') {
      navigation.navigate('VirtualTryOn');
    } else if (action === 'LiveCamera') {
      navigation.navigate('LiveCamera');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Selfie</Text>
        </View>

        {/* Content Area */}
        <View style={styles.mainContent}>
          
          {/* Success State */}
          {success ? (
            <View style={styles.successContainer}>
              <View style={styles.successPreviewWrapper}>
                <Image source={{ uri: imageUrl || selectedImage }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              </View>
              <Text style={styles.successTitle}>Ready to Go!</Text>
              <Text style={styles.successSubtitle}>
                Your selfie is securely uploaded. What would you like to do next?
              </Text>
              
              <View style={styles.actionColumn}>
                <TouchableOpacity 
                  onPress={() => handleAction('AIAnalysis')}
                  style={styles.primaryActionButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#6D28D9']}
                    style={styles.gradientButtonContent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="scan" size={18} color="white" />
                    <Text style={styles.gradientButtonText}>AI Analysis</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleAction('Recommendations')}
                  style={styles.primaryActionButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#A78BFA', '#7C3AED']}
                    style={styles.gradientButtonContent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="bulb-outline" size={18} color="white" />
                    <Text style={styles.gradientButtonText}>Get Recommendations</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleAction('VirtualTryOn')}
                  style={styles.outlineActionButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="color-wand-outline" size={18} color="#6D28D9" />
                  <Text style={styles.outlineActionText}>Virtual Try-On</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleAction('LiveCamera')}
                  style={[styles.outlineActionButton, { borderBottomWidth: 1 }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={18} color="#475569" />
                  <Text style={[styles.outlineActionText, { color: '#475569' }]}>Live Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Image Selection / Preview */}
              <View style={styles.previewContainer}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <View style={styles.emptyPreview}>
                    <View style={styles.cameraIconContainer}>
                      <Ionicons name="camera" size={42} color="#6D28D9" />
                    </View>
                    <Text style={styles.emptyPreviewTitle}>Take a clear selfie</Text>
                    <Text style={styles.emptyPreviewSubtitle}>
                      Position your face clearly with good lighting for the best AI results.
                    </Text>
                  </View>
                )}

                {/* Validate / Upload Progress Overlay */}
                {(isValidating || isUploading) && (
                  <View style={styles.progressOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" style={{ marginBottom: 12 }} />
                    {isValidating ? (
                      <>
                        <Text style={styles.progressTitle}>Validating Image...</Text>
                        <Text style={styles.progressSubtitle}>Checking face alignment and lighting</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.progressTitle}>{progress}%</Text>
                        <Text style={styles.progressSubtitle}>Uploading securely...</Text>
                      </>
                    )}
                  </View>
                )}
              </View>

              {/* Error State */}
              {error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.bottomActions}>
                {(!isUploading && !isValidating) && !selectedImage && (
                  <View style={styles.twoButtonRow}>
                    <TouchableOpacity 
                      onPress={takePhoto}
                      style={styles.halfPrimaryButton}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#8B5CF6', '#6D28D9']}
                        style={styles.gradientButtonContent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons name="camera-outline" size={18} color="white" />
                        <Text style={styles.gradientButtonText}>Camera</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={pickImage}
                      style={styles.halfOutlineButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="images-outline" size={18} color="#6D28D9" />
                      <Text style={styles.halfOutlineText}>Gallery</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {(!isUploading && !isValidating) && selectedImage && !error && (
                  <>
                    <TouchableOpacity 
                      onPress={handleUpload}
                      style={styles.fullActionButton}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#8B5CF6', '#6D28D9']}
                        style={styles.gradientButtonContent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.gradientButtonText}>Upload Selfie</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setSelectedImage(null)}
                      style={styles.changePhotoButton}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.changePhotoText}>Choose a different photo</Text>
                    </TouchableOpacity>
                  </>
                )}

                {error && (
                  <View style={styles.bottomActions}>
                    <TouchableOpacity 
                      onPress={handleUpload}
                      style={styles.fullActionButton}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#8B5CF6', '#6D28D9']}
                        style={styles.gradientButtonContent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.gradientButtonText}>Retry Upload</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setSelectedImage(null)}
                      style={styles.changePhotoButton}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.changePhotoText}>Choose a different photo</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginLeft: 14,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    width: '100%',
    alignItems: 'center',
  },
  successPreviewWrapper: {
    width: 180,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#10B981',
    position: 'relative',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  successBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  actionColumn: {
    width: '100%',
  },
  primaryActionButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  gradientButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  outlineActionButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#EDE9FE',
    backgroundColor: '#FDFDFD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outlineActionText: {
    color: '#6D28D9',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  previewContainer: {
    width: 240,
    height: 300,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    // Soft shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  emptyPreview: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cameraIconContainer: {
    backgroundColor: '#F5F3FF',
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyPreviewTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyPreviewSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  progressTitle: {
    color: '#ffffff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  progressSubtitle: {
    color: '#CBD5E1',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    width: '100%',
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
  },
  bottomActions: {
    width: '100%',
  },
  twoButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfPrimaryButton: {
    flex: 1.1,
    marginRight: 6,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  halfOutlineButton: {
    flex: 0.9,
    marginLeft: 6,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#EDE9FE',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfOutlineText: {
    color: '#6D28D9',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  fullActionButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  changePhotoButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  changePhotoText: {
    color: '#94A3B8',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
});
