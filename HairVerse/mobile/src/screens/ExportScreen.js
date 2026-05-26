import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { useTryOnStore } from '../store/tryOnStore';

export default function ExportScreen({ navigation }) {
  const { renderedImageURL } = useTryOnStore();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Export HD</Text>
      
      <View style={styles.previewCard}>
        {renderedImageURL ? (
          <Image source={{ uri: renderedImageURL }} style={styles.renderedImage} />
        ) : (
          <Text style={styles.placeholderText}>Render Try-On First</Text>
        )}
      </View>

      <Text style={styles.label}>Select Export Format:</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.formatBtn}><Text style={styles.formatText}>PNG</Text></TouchableOpacity>
        <TouchableOpacity style={styles.formatBtn}><Text style={styles.formatText}>JPEG</Text></TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.btn}
        onPress={() => navigation.navigate('Premium')}
      >
        <Text style={styles.btnText}>Download Ultra HD (No Watermark)</Text>
      </TouchableOpacity>
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
  previewCard: {
    width: '100%',
    height: 350,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  renderedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  formatBtn: {
    backgroundColor: COLORS.card,
    flex: 0.48,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  formatText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  btn: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
