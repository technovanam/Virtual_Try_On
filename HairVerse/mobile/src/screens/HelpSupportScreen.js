import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function HelpSupportScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Help & Support</Text>
      
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      <View style={styles.card}>
        <Text style={styles.faqQ}>Q: How accurate is the AI try-on overlay?</Text>
        <Text style={styles.faqA}>A: The MVP composition uses OpenCV head boundary scaling. The premium rendering leverages Stable Diffusion control models to blend matches cleanly.</Text>
        
        <Text style={styles.faqQ}>Q: Are my selfie uploads stored permanently?</Text>
        <Text style={styles.faqA}>A: Selfies are processed in memory and are never saved permanently unless bookmarked in custom favorites collections.</Text>
      </View>

      <Text style={styles.sectionTitle}>Contact Ticket</Text>
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Open a Support Ticket</Text>
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
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 30,
  },
  faqQ: {
    fontWeight: 'bold',
    color: COLORS.secondary,
    fontSize: 15,
  },
  faqA: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 20,
  },
  btn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
