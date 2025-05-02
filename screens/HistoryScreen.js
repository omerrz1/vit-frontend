import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HistoryScreen = () => {
  const [scansHistory, setScansHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newResult, setNewResult] = useState('');
  const [scanBeingUpdated, setScanBeingUpdated] = useState(null); // Track the scan being updated

  // Load scans from AsyncStorage on mount
  useEffect(() => {
    const loadScansHistory = async () => {
      try {
        const scans = await AsyncStorage.getItem('scansHistory');
        if (scans) {
          const parsedScans = JSON.parse(scans);
          console.log('Loaded scans from AsyncStorage:', parsedScans); // Debug: Log loaded scans
          setScansHistory(parsedScans);
        } else {
          console.log('No scans found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error loading scans history:', error);
      }
    };
    loadScansHistory();
  }, []);

  // Save scans to AsyncStorage
  const saveScansHistory = async (newScans) => {
    try {
      console.log('Saving scans to AsyncStorage:', newScans); // Debug: Log scans being saved
      await AsyncStorage.setItem('scansHistory', JSON.stringify(newScans));
      setScansHistory(newScans);
    } catch (error) {
      console.error('Error saving scans history:', error);
    }
  };

  const updateScanResult = async (scanId) => {
    if (!newResult) {
      alert('Please provide a result to update.');
      return;
    }

    if (!scanId) {
      console.error('scanId is undefined'); // Debug: Log undefined scanId
      alert('Error: Scan ID is missing.');
      return;
    }

    console.log('Updating scan with ID:', scanId, 'New Result:', newResult); // Debug: Log scanId and newResult

    setLoading(true);
    setScanBeingUpdated(scanId); // Indicate the scan being updated

    try {
      // Create form data for the request
      const formData = new FormData();
      formData.append('actual_result', newResult);

      // Update backend with form data
      const response = await axios.put(
        `http://127.0.0.1:8000/update-result/${scanId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Update response:', response.data); // Debug: Log server response

      // Update local state and AsyncStorage
      const updatedScans = scansHistory.map((scan) =>
        scan.scanId === scanId ? { ...scan, actualResult: newResult } : scan
      );

      await saveScansHistory(updatedScans);
      setNewResult('');
      setScanBeingUpdated(null); // Reset the scan update state
    } catch (error) {
      console.error('Update Error:', error.response?.data || error.message); // Debug: Log detailed error
      alert(`Error updating scan result: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan History</Text>
      {scansHistory.length === 0 ? (
        <Text style={styles.noScansText}>No scans available.</Text>
      ) : (
        <FlatList
          data={scansHistory}
          renderItem={({ item }) => (
            <View style={styles.scanItem}>
              <Text style={styles.scanText}>Scan ID: {item.scanId || 'N/A'}</Text>
              <Text style={styles.scanText}>Result: {item.result[0]?.label || 'N/A'}</Text>
              <Text style={styles.scanText}>Date: {new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.scanText}>Doctor's Result: {item.actualResult || 'Not updated'}</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('Toggling update for scanId:', item.scanId); // Debug: Log scanId on toggle
                  setScanBeingUpdated(scanBeingUpdated === item.scanId ? null : item.scanId);
                }}
              >
                <Text style={styles.updateText}>
                  {scanBeingUpdated === item.scanId ? 'Cancel' : 'Update Result'}
                </Text>
              </TouchableOpacity>
              {scanBeingUpdated === item.scanId && (
                <View style={styles.updateContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter the new result"
                    value={newResult}
                    onChangeText={setNewResult}
                  />
                  {loading ? (
                    <ActivityIndicator size="small" color="purple" />
                  ) : (
                    <Button
                      title="Save"
                      onPress={() => updateScanResult(item.scanId)}
                      color="purple"
                    />
                  )}
                </View>
              )}
            </View>
          )}
          keyExtractor={(item) => item.scanId || Math.random().toString()} // Fallback key if scanId is missing
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  noScansText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  scanItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  scanText: {
    fontSize: 16,
    marginBottom: 5,
  },
  updateText: {
    color: 'purple',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  updateContainer: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    width: '100%',
    borderRadius: 5,
    fontSize: 16,
  },
});

export default HistoryScreen;