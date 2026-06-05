import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSupportStore } from '../store/supportStore';
import { formatDistanceToNow } from '../utils/dateUtils';

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const { 
    fetchData, getFilteredFaqs, tickets, isLoadingFaqs, isLoadingTickets, 
    searchQuery, setSearchQuery, submitTicket, submitFeedback, isSubmitting 
  } = useSupportStore();

  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('faqs'); // faqs, tickets
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Ticket Form
  const [ticketCategory, setTicketCategory] = useState('General');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  // Feedback Form
  const [rating, setRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const handleTicketSubmit = async () => {
    if (!ticketTitle || !ticketDesc) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const success = await submitTicket({ category: ticketCategory, title: ticketTitle, description: ticketDesc });
    if (success) {
      Alert.alert('Success', 'Your support ticket has been submitted. We will get back to you shortly.');
      setShowTicketModal(false);
      setTicketTitle('');
      setTicketDesc('');
      setActiveTab('tickets');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating.');
      return;
    }
    const success = await submitFeedback({ type: 'General', message: feedbackMsg, rating });
    if (success) {
      Alert.alert('Thank You', 'Your feedback helps us improve HairVerse!');
      setShowFeedbackModal(false);
      setRating(0);
      setFeedbackMsg('');
    }
  };

  const faqs = getFilteredFaqs();
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2 bg-white border-b border-gray-100 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 flex-1">Help & Support</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <View className="bg-indigo-600 px-5 pt-6 pb-8">
           <Text className="text-white font-black text-2xl mb-4">How can we help you?</Text>
           <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-sm">
             <Ionicons name="search" size={20} color="#9CA3AF" />
             <TextInput 
               className="flex-1 ml-3 text-base text-gray-900"
               placeholder="Search FAQs and topics..."
               value={searchQuery}
               onChangeText={setSearchQuery}
               placeholderTextColor="#9CA3AF"
             />
           </View>
        </View>

        {/* Diagnostics & Quick Actions */}
        <View className="px-5 mt-[-20px] flex-row justify-between mb-6">
           <TouchableOpacity 
              className="bg-white flex-1 mr-2 p-4 rounded-2xl shadow-sm items-center border border-gray-100"
              onPress={() => setShowTicketModal(true)}
           >
              <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mb-2">
                 <Ionicons name="warning" size={20} color="#EF4444" />
              </View>
              <Text className="text-gray-900 font-bold text-sm">Report Issue</Text>
           </TouchableOpacity>
           
           <TouchableOpacity 
              className="bg-white flex-1 ml-2 p-4 rounded-2xl shadow-sm items-center border border-gray-100"
              onPress={() => setShowFeedbackModal(true)}
           >
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-2">
                 <Ionicons name="star" size={20} color="#10B981" />
              </View>
              <Text className="text-gray-900 font-bold text-sm">Rate App</Text>
           </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row px-5 border-b border-gray-200 mb-4">
           <TouchableOpacity 
             className={`pb-3 mr-6 border-b-2 ${activeTab === 'faqs' ? 'border-indigo-600' : 'border-transparent'}`}
             onPress={() => setActiveTab('faqs')}
           >
             <Text className={`font-bold ${activeTab === 'faqs' ? 'text-indigo-600' : 'text-gray-500'}`}>FAQs</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             className={`pb-3 border-b-2 ${activeTab === 'tickets' ? 'border-indigo-600' : 'border-transparent'}`}
             onPress={() => setActiveTab('tickets')}
           >
             <Text className={`font-bold ${activeTab === 'tickets' ? 'text-indigo-600' : 'text-gray-500'}`}>My Tickets</Text>
           </TouchableOpacity>
        </View>

        {/* FAQ Tab */}
        {activeTab === 'faqs' && (
          <View className="px-5">
            {isLoadingFaqs ? (
              <ActivityIndicator color="#4F46E5" className="mt-10" />
            ) : Object.keys(groupedFaqs).length === 0 ? (
              <View className="items-center py-10">
                 <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                 <Text className="text-gray-500 mt-4 font-medium">No FAQs found.</Text>
              </View>
            ) : (
              Object.entries(groupedFaqs).map(([category, items]) => (
                <View key={category} className="mb-6">
                  <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">{category}</Text>
                  <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {items.map((faq, index) => (
                      <View key={faq.id} className={`${index !== items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                        <TouchableOpacity 
                          className="p-4 flex-row justify-between items-center"
                          onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        >
                          <Text className="text-gray-900 font-medium flex-1 pr-4">{faq.question}</Text>
                          <Ionicons name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                        {expandedFaq === faq.id && (
                          <View className="px-4 pb-4 bg-gray-50/50">
                            <Text className="text-gray-600 text-sm leading-6">{faq.answer}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <View className="px-5">
            {isLoadingTickets ? (
              <ActivityIndicator color="#4F46E5" className="mt-10" />
            ) : tickets.length === 0 ? (
              <View className="items-center py-10">
                 <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="ticket-outline" size={32} color="#9CA3AF" />
                 </View>
                 <Text className="text-gray-900 font-bold mb-2">No support history available.</Text>
                 <Text className="text-gray-500 text-center px-6">If you experience any issues, report them above and track their status here.</Text>
              </View>
            ) : (
              tickets.map((ticket) => (
                <View key={ticket.ticketId} className="bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className={`px-2 py-1 rounded-md ${ticket.status === 'open' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                       <Text className={`text-[10px] font-black uppercase ${ticket.status === 'open' ? 'text-yellow-700' : 'text-green-700'}`}>{ticket.status}</Text>
                    </View>
                    <Text className="text-xs text-gray-400 font-medium">
                      {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    </Text>
                  </View>
                  <Text className="text-gray-900 font-bold mb-1">{ticket.title}</Text>
                  <Text className="text-gray-500 text-sm" numberOfLines={2}>{ticket.description}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Diagnostics Info */}
        <View className="px-5 mt-10">
           <Text className="text-xs text-gray-400 text-center">HairVerse App v2.4.1 • Network: Connected</Text>
        </View>

      </ScrollView>

      {/* Ticket Modal */}
      <Modal visible={showTicketModal} animationType="slide" presentationStyle="pageSheet">
         <SafeAreaView className="flex-1 bg-[#F8FAFC]">
            <View className="flex-row items-center px-5 pt-4 pb-4 bg-white border-b border-gray-100">
               <TouchableOpacity onPress={() => setShowTicketModal(false)} className="mr-4">
                 <Text className="text-gray-500 text-base">Cancel</Text>
               </TouchableOpacity>
               <Text className="text-xl font-bold text-gray-900 flex-1 text-center">Submit Ticket</Text>
               <View className="w-12" />
            </View>
            <ScrollView className="p-5">
               <Text className="text-sm font-bold text-gray-700 mb-2">Issue Title</Text>
               <TextInput 
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base text-gray-900"
                  placeholder="E.g. App crashes when taking photo"
                  value={ticketTitle}
                  onChangeText={setTicketTitle}
               />
               
               <Text className="text-sm font-bold text-gray-700 mb-2">Description</Text>
               <TextInput 
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 text-base text-gray-900 h-32"
                  placeholder="Please describe the issue in detail..."
                  multiline
                  textAlignVertical="top"
                  value={ticketDesc}
                  onChangeText={setTicketDesc}
               />

               <TouchableOpacity 
                  className="bg-indigo-600 py-4 rounded-xl items-center"
                  onPress={handleTicketSubmit}
                  disabled={isSubmitting}
               >
                  {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text className="text-white font-bold text-base">Submit Issue</Text>}
               </TouchableOpacity>
            </ScrollView>
         </SafeAreaView>
      </Modal>

      {/* Feedback Modal */}
      <Modal visible={showFeedbackModal} animationType="fade" transparent={true}>
         <View className="flex-1 bg-black/50 justify-center px-5">
            <View className="bg-white rounded-3xl p-6">
               <Text className="text-xl font-bold text-gray-900 text-center mb-2">Rate Your Experience</Text>
               <Text className="text-gray-500 text-center mb-6">How are you enjoying HairVerse?</Text>
               
               <View className="flex-row justify-center space-x-2 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                     <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <Ionicons name={rating >= star ? "star" : "star-outline"} size={36} color={rating >= star ? "#F59E0B" : "#D1D5DB"} />
                     </TouchableOpacity>
                  ))}
               </View>

               <TextInput 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 text-sm text-gray-900 min-h-[80px]"
                  placeholder="Any additional feedback? (Optional)"
                  multiline
                  value={feedbackMsg}
                  onChangeText={setFeedbackMsg}
               />

               <View className="flex-row space-x-3">
                  <TouchableOpacity className="flex-1 py-3 rounded-xl border border-gray-200 items-center" onPress={() => setShowFeedbackModal(false)}>
                     <Text className="text-gray-600 font-bold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 py-3 rounded-xl bg-indigo-600 items-center" onPress={handleFeedbackSubmit} disabled={isSubmitting}>
                     {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text className="text-white font-bold">Submit</Text>}
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>

    </SafeAreaView>
  );
}
