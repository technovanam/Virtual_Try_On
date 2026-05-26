import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

const MOCK_FOLDERS = [
  { id: '1', name: 'Korean Styles', count: 3 },
  { id: '2', name: 'Office Looks', count: 2 },
  { id: '3', name: 'Fades Collection', count: 5 },
];

export default function SavedCollectionsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>My Collections</Text>
      
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.activeTabText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Folders</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Custom Folders</Text>
      {MOCK_FOLDERS.map((folder) => (
        <TouchableOpacity key={folder.id} style={styles.folderCard}>
          <View>
            <Text style={styles.folderName}>{folder.name}</Text>
            <Text style={styles.folderCount}>{folder.count} items saved</Text>
          </View>
          <Text style={styles.arrow}>></Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.createBtn}>
        <Text style={styles.createBtnText}>+ Create New Folder</Text>
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
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  folderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  folderCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  arrow: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  createBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createBtnText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
