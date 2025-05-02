import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ResultModal from '../components/ResultModal';

const HomeScreen = () => {
  const [scanResult, setScanResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scansHistory, setScansHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Request camera and media library permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      console.log('Media Library Permission:', mediaLibraryPermission.status);
      console.log('Camera Permission:', cameraPermission.status);

      if (mediaLibraryPermission.status !== 'granted' || cameraPermission.status !== 'granted') {
        Alert.alert('Permissions Required', 'Camera and media library permissions are needed.');
      }
    };

    requestPermissions();
    loadScansHistory(); // Load scans from AsyncStorage on mount
  }, []);

  // Load scans from AsyncStorage
  const loadScansHistory = async () => {
    try {
      const scans = await AsyncStorage.getItem('scansHistory');
      if (scans) {
        setScansHistory(JSON.parse(scans));
      }
    } catch (error) {
      console.error('Error loading scans history:', error);
    }
  };

  // Save scans to AsyncStorage
  const saveScansHistory = async (newScans) => {
    try {
      await AsyncStorage.setItem('scansHistory', JSON.stringify(newScans));
      setScansHistory(newScans);
    } catch (error) {
      console.error('Error saving scans history:', error);
    }
  };

  const pickImage = async () => {
    console.log('Upload Image button pressed');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Image Picker Result:', result);
    if (!result.canceled) {
      handleUpload(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    console.log('Take Picture button pressed');
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Camera Result:', result);
    if (!result.canceled) {
      handleUpload(result.assets[0].uri);
    }
  };

  const handleUpload = async (uri) => {
    setLoading(true);
    let localUri = uri;
    let filename = localUri.split('/').pop();
    let type = `image/${filename.split('.').pop()}`;

    // Copy to cache directory for consistent URI
    const newUri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.copyAsync({ from: localUri, to: newUri });
    localUri = newUri;

    const formData = new FormData();
    formData.append('file', { uri: localUri, name: filename, type });

    try {
      const response = await axios.post('http://127.0.0.1:8000/quick-scan/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { result, explainability_image_path, id } = response.data; // Use 'id' from server response
      const newScan = {
        scanId: id.toString(), // Convert to string for consistency
        result,
        explainabilityImage: `http://127.0.0.1:8000/${explainability_image_path}`,
        date: new Date().toISOString(),
        actualResult: null, // Initialize actualResult as null
      };

      setScanResult(newScan);
      setModalVisible(true);

      // Save to scans history
      const updatedScans = [...scansHistory, newScan];
      await saveScansHistory(updatedScans);
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Upload Failed', `Error uploading image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const barChartData = {
    labels: scanResult?.result?.map((item) => item.label) || [],
    datasets: [
      {
        data: scanResult?.result?.map((item) => item.score * 100) || [],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skin Cancer Scan</Text>
      <View style={styles.buttonContainer}>
        <Button title="Upload Image" onPress={pickImage} color="purple" />
        <Button title="Take a Picture" onPress={takePhoto} color="purple" />
      </View>

      {loading && <ActivityIndicator size="large" color="purple" />}

      <ResultModal
        visible={modalVisible}
        result={scanResult}
        onClose={() => setModalVisible(false)}
        barChartData={barChartData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 30,
    width: '80%',
    gap: 10, // Add spacing between buttons
  },
});

export default HomeScreen;