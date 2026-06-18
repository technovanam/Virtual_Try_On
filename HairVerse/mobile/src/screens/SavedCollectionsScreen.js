import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSavedStore } from '../store/savedStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileSetupStore } from '../store/useProfileSetupStore';

const SavedItemCard = ({ item, onOpenMenu }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onOpenMenu(item, 'open')}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Ionicons name="image-outline" size={24} color="#94A3B8" />
        </View>
      )}
      <View style={styles.cardInfo}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          <View style={styles.viewCountContainer}>
             <Ionicons name="eye-outline" size={12} color="#94A3B8" style={{ marginRight: 3 }} />
             <Text style={styles.viewCountText}>{item.viewCount}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardFooter}>
           <Text style={styles.cardDate}>
             {new Date(item.createdAt).toLocaleDateString()}
           </Text>
           {item.matchScore > 0 && (
              <Text style={styles.matchScoreText}>{item.matchScore}% Match</Text>
           )}
        </View>
      </View>
      <TouchableOpacity style={styles.menuButton} onPress={() => onOpenMenu(item, 'menu')} activeOpacity={0.6}>
        <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function SavedCollectionsScreen() {
  const { 
    isLoading, error, fetchSavedItems, deleteItem, updateItemCategory,
    searchQuery, setSearchQuery, sortBy, setSortBy, 
    activeTab, setActiveTab, activeCategory, setActiveCategory,
    getFilteredItems, getUniqueCategories 
  } = useSavedStore();
  
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const { data: userProfile } = useProfileSetupStore();
  
  const tabs = [
    { id: 'favorites', label: 'Favorites', icon: 'heart' },
    { id: 'history', label: 'History', icon: 'time' },
    { id: 'comparison', label: 'Comparisons', icon: 'git-compare' },
    { id: 'haircolor', label: 'Hair Colors', icon: 'color-palette' }
  ];

  if (userProfile?.gender !== 'Female') {
    tabs.push({ id: 'beardstyle', label: 'Beards', icon: 'cut' });
  }

  const filteredItems = getFilteredItems();
  const uniqueCategories = getUniqueCategories();

  const handleOpenItem = (item) => {
    if (item.itemType === 'hairstyle') {
      navigation.navigate('HairstyleDetails', { hairstyleId: item.referenceId });
    } else if (item.itemType === 'tryon') {
      navigation.navigate('VirtualTryOn', { sessionId: item.referenceId });
    } else if (item.itemType === 'comparison') {
      navigation.navigate('Comparison', { comparisonId: item.referenceId });
    } else if (item.itemType === 'analysis') {
      navigation.navigate('AIAnalysisResult', { analysisId: item.referenceId });
    }
  };

  const handleMenuAction = (item, actionType) => {
    if (actionType === 'open') {
      handleOpenItem(item);
    } else {
      setSelectedItem(item);
      setMenuVisible(true);
    }
  };

  const executeAction = (action) => {
    setMenuVisible(false);
    if (!selectedItem) return;

    switch (action) {
      case 'open':
        handleOpenItem(selectedItem);
        break;
      case 'delete':
        deleteItem(selectedItem.savedId);
        break;
      case 'move':
        const newCat = selectedItem.category === 'Favorites' ? 'Archived' : 'Favorites';
        updateItemCategory(selectedItem.savedId, newCat);
        break;
      case 'try_again':
        navigation.navigate('VirtualTryOn', { hairstyleId: selectedItem.referenceId });
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Collections</Text>
      </View>

      {/* Search and Sort Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search saved items..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setSortBy(sortBy === 'newest' ? 'highest_match' : 'newest')}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={18} color="#6D28D9" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity 
                key={tab.id}
                style={[
                  styles.tabItem,
                  isActive ? styles.tabItemActive : styles.tabItemInactive
                ]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={14} 
                  color={isActive ? '#6D28D9' : '#64748B'} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Folders / Categories */}
      {uniqueCategories.length > 1 && (
        <View style={styles.categoryBar}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {uniqueCategories.map(cat => {
                 const isActive = activeCategory === cat;
                 return (
                   <TouchableOpacity 
                      key={cat}
                      style={[styles.categoryTab, isActive ? styles.categoryTabActive : null]}
                      onPress={() => setActiveCategory(cat)}
                      activeOpacity={0.7}
                   >
                      <Text style={[styles.categoryText, isActive ? styles.categoryTextActive : styles.categoryTextInactive]}>
                        {cat}
                      </Text>
                   </TouchableOpacity>
                 );
              })}
           </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6D28D9" />
          </View>
        )}

        {!isLoading && error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchSavedItems} activeOpacity={0.8}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && filteredItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="folder-open-outline" size={32} color="#6D28D9" />
            </View>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? `We couldn't find anything matching "${searchQuery}".` : 'Explore the app and save items to build your collection.'}
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Recommendations')}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreButtonText}>Explore Hairstyles</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && filteredItems.length > 0 && (
          <View style={{ paddingBottom: 20 }}>
            {filteredItems.map(item => (
              <SavedItemCard 
                key={item.savedId} 
                item={item} 
                onOpenMenu={handleMenuAction}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Bottom Sheet Modal */}
      <Modal visible={menuVisible} transparent animationType="slide">
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Options</Text>
                  <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeButton} activeOpacity={0.6}>
                     <Ionicons name="close" size={22} color="#1E293B" />
                  </TouchableOpacity>
               </View>

               <TouchableOpacity style={styles.modalItem} onPress={() => executeAction('open')} activeOpacity={0.7}>
                  <Ionicons name="eye-outline" size={20} color="#4B5563" style={{ marginRight: 14 }} />
                  <Text style={styles.modalItemText}>Open Item</Text>
               </TouchableOpacity>

               <TouchableOpacity style={styles.modalItem} onPress={() => executeAction('try_again')} activeOpacity={0.7}>
                  <Ionicons name="color-wand-outline" size={20} color="#4B5563" style={{ marginRight: 14 }} />
                  <Text style={styles.modalItemText}>Try Again</Text>
               </TouchableOpacity>

               <TouchableOpacity style={styles.modalItem} onPress={() => executeAction('move')} activeOpacity={0.7}>
                  <Ionicons name="folder-open-outline" size={20} color="#4B5563" style={{ marginRight: 14 }} />
                  <Text style={styles.modalItemText}>Move to Folder</Text>
               </TouchableOpacity>

               <TouchableOpacity style={[styles.modalItem, { borderBottomWidth: 0 }]} onPress={() => executeAction('delete')} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" style={{ marginRight: 14 }} />
                  <Text style={[styles.modalItemText, { color: '#EF4444' }]}>Delete Item</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  backButton: {
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    flex: 1,
  },
  searchRow: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#1E293B',
    marginLeft: 8,
    height: '100%',
    padding: 0,
  },
  filterButton: {
    backgroundColor: '#F8FAFC',
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 10,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  tabItemActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#EDE9FE',
  },
  tabItemInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#E2E8F0',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  tabTextActive: {
    color: '#6D28D9',
  },
  tabTextInactive: {
    color: '#64748B',
  },
  categoryBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 8,
  },
  categoryTab: {
    marginRight: 16,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  categoryTabActive: {
    borderColor: '#6D28D9',
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
  },
  categoryTextActive: {
    color: '#6D28D9',
  },
  categoryTextInactive: {
    color: '#94A3B8',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImage: {
    width: 76,
    height: 76,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: '#F8FAFC',
  },
  cardImagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#F5F3FF',
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#6D28D9',
    fontSize: 9,
    fontFamily: 'Poppins_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCountText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDate: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  matchScoreText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#10B981',
  },
  menuButton: {
    padding: 6,
    marginLeft: 6,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    backgroundColor: '#F5F3FF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#6D28D9',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  modalItemText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#334155',
  },
});
