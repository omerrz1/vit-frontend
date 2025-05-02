import React from 'react';
import { Modal, View, Text, Image, StyleSheet, Button } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const ResultModal = ({ visible, result, onClose, barChartData }) => {
  const { result: scanResult, explainabilityImage } = result || {};

  const getUrgency = (label) => {
    switch (label) {
      case 'Melanocytic nevus':
        return 'Low urgency, no immediate action required.';
      case 'Benign keratosis':
        return 'Low urgency, benign skin condition.';
      default:
        return 'Urgency may vary. Consult a doctor.';
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.resultText}>Result: {scanResult?.[0]?.label}</Text>
        <Text style={styles.definition}>
          Definition: {getUrgency(scanResult?.[0]?.label)}
        </Text>
        <Image
          source={{ uri: explainabilityImage }}
          style={styles.explainabilityImage}
          resizeMode="contain" // Ensure image scales without cropping
        />
        <BarChart
          data={{
            ...barChartData,
            labels: barChartData?.labels?.map((label) =>
              label.length > 10 ? `${label.substring(0, 10)}...` : label // Truncate long labels
            ),
          }}
          width={Dimensions.get('window').width - 60} // Slightly narrower for padding
          height={250} // Increased height for better label spacing
          yAxisLabel="%"
          fromZero={true}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontSize: 10, // Smaller font size for labels
              rotation: 45, // Rotate labels to prevent overlap
              dx: 10, // Adjust label position
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          style={styles.barChart}
          withHorizontalLabels={true}
          showValuesOnTopOfBars={false} // Avoid clutter
        />
        <Button title="Close" onPress={onClose} color="purple" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  resultText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  definition: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
  explainabilityImage: {
    width: '80%', // Responsive width
    height: 200, // Fixed height, adjust as needed
    marginVertical: 20,
  },
  barChart: {
    marginVertical: 20,
    paddingRight: 20, // Add padding to prevent label cutoff
  },
});

export default ResultModal;