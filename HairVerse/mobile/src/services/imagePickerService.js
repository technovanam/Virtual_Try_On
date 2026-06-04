import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export const handleOpenCamera = async () => {
  try {
    // 1. Request camera permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Denied",
        "You need to grant camera access to take a selfie."
      );
      return null;
    }

    // 2. Launch device camera
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    // 3. User cancel handling
    if (result.canceled) {
      return null;
    }

    // 4. Capture image and return URI
    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (!uri) {
        Alert.alert("Error", "Captured image is invalid.");
        return null;
      }
      return uri;
    }

    return null;
  } catch (error) {
    // Camera unavailable handling
    console.error("Camera Error: ", error);
    Alert.alert("Camera Unavailable", "Could not launch the camera. Please check if your device has a working camera.");
    return null;
  }
};

export const handleOpenGallery = async () => {
  try {
    // 1. Request gallery permission (especially for iOS)
    if (Platform.OS !== 'web') {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Denied",
          "You need to grant gallery access to select a photo."
        );
        return null;
      }
    }

    // 2. Open photo library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    // 3. User cancel handling
    if (result.canceled) {
      return null;
    }

    // 4. Return image URI and handle invalid file
    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (!uri) {
        Alert.alert("Error", "Selected file is invalid.");
        return null;
      }
      return uri;
    }

    return null;
  } catch (error) {
    console.error("Gallery Error: ", error);
    Alert.alert("Error", "Could not open the photo gallery.");
    return null;
  }
};
