import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function AdminScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Super Admin Panel</Text>
      
      <Text style={styles.sectionTitle}>Overview Statistics</Text>
      <View style={styles.card}>
        <Text style={styles.statText}>Total App Users: 1,420</Text>
        <Text style={styles.statText}>Daily Try-On Generation Requests: 4,890</Text>
        <Text style={styles.statText}>Active Premium Members: 350</Text>
      </View>

      <Text style={styles.sectionTitle}>Admin Operations</Text>
      
      <TouchableOpacity style={styles.opBtn}>
        <Text style={styles.opText}>Manage Hairstyle Library</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.opBtn}>
        <Text style={styles.opText}>View User Support Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.opBtn}>
        <Text style={styles.opText}>Configure GPU Server Cluster Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>Exit Admin View</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 30,
  },
  statText: {
    color: COLORS.secondary,
    fontSize: 15,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  opBtn: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  opText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  backBtn: {
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  backBtnText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
});
