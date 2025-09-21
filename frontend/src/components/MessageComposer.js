import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import { Button, Badge } from './ui';
import ConfirmModal from './ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  FaceSmileIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

const MessageComposer = ({ user, contacts = [], isTeacher = false, initialContact = null }) => {
  const [messageContent, setMessageContent] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedStudentForTeacher, setSelectedStudentForTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContactsList, setShowContactsList] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  // Check if mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (initialContact) {
      setSelectedRecipient(initialContact);
      setShowContactsList(false);
      fetchMessagesForRecipient(initialContact);
    }
  }, [initialContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const { data } = await api.get('/messages/conversations');
      if (data && data.status === 'success') {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRecipientOptions = () => {
    
    const raw = [];
    
    // Add "All Parents" option for teachers
    if (isTeacher) {
      raw.push({ id: 'all', name: 'All Parents of My Students', type: 'group' });
    }
    
    // Transform conversations into recipient format with unread counts
    // Each conversation is already unique by conversation_id from backend
    (conversations || []).forEach(conversation => {
      if (isTeacher) {
        raw.push({
          id: conversation.parent_id,
          name: conversation.parent_name,
          type: 'parent',
          studentName: conversation.student_name,
          studentId: conversation.student_id,
          unreadCount: conversation.unread_count || 0,
          lastMessage: conversation.last_message,
          lastMessageTime: conversation.last_message_time,
          conversationId: conversation.conversation_id,
          uniqueKey: conversation.conversation_id // Use conversation_id as unique identifier
        });
      } else {
        raw.push({
          id: conversation.teacher_id,
          name: conversation.teacher_name,
          type: 'teacher',
          studentName: conversation.student_name,
          studentId: conversation.student_id,
          unreadCount: conversation.unread_count || 0,
          lastMessage: conversation.last_message,
          lastMessageTime: conversation.last_message_time,
          conversationId: conversation.conversation_id,
          uniqueKey: conversation.conversation_id // Use conversation_id as unique identifier
        });
      }
    });

    // Add contacts that don't have conversations yet
    (contacts || []).forEach(contact => {
      if (isTeacher) {
        // For teachers: add each parent for each student
        (contact.parents || []).forEach(parent => {
          const existingConversation = raw.find(r => 
            r.id === parent.parentId && r.studentId === contact.studentId
          );
          
          
          if (!existingConversation) {
            const newContact = {
              id: parent.parentId,
              name: parent.parentName,
              type: 'parent',
              studentName: contact.studentName,
              studentId: contact.studentId,
              unreadCount: 0,
              lastMessage: null,
              lastMessageTime: null,
              conversationId: null,
              uniqueKey: `${parent.parentId}-${contact.studentId}` // Unique key for contacts without conversations
            };
            raw.push(newContact);
          }
        });
      } else {
        // For parents: add each teacher for each student
        (contact.teachers || []).forEach(teacher => {
          
          // Check if we already have this teacher-student combination (from conversations or contacts)
          const existingContact = raw.find(r => 
            r.id === teacher.teacherId && 
            r.studentId === contact.studentId &&
            r.type === 'teacher'
          );
          
          
          if (!existingContact) {
            const newContact = {
              id: teacher.teacherId,
              name: teacher.teacherName,
              type: 'teacher',
              studentName: contact.studentName,
              studentId: contact.studentId,
              unreadCount: 0,
              lastMessage: null,
              lastMessageTime: null,
              conversationId: null,
              uniqueKey: `${teacher.teacherId}-${contact.studentId}` // Unique key for contacts without conversations
            };
            raw.push(newContact);
          } else {
          }
        });
      }
    });

    
    // Final deduplication: remove any remaining duplicates based on teacher/parent ID + student ID + type
    const uniqueContacts = [];
    const seenKeys = new Set();
    
    raw.forEach(contact => {
      const uniqueKey = `${contact.id}-${contact.studentId}-${contact.type}`;
      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey);
        uniqueContacts.push(contact);
      } else {
      }
    });

    return uniqueContacts;
  };

  const filteredRecipients = getRecipientOptions().filter(recipient =>
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.studentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchMessagesForRecipient = async (recipient) => {
    if (!recipient || recipient.id === 'all') return;
    
    setLoading(true);
    try {
      // Include studentId in the API call for proper conversation separation
      let url = `/messages?otherUserId=${recipient.id}`;
      if (recipient.studentId) {
        url += `&studentId=${recipient.studentId}`;
      }
      
      const { data } = await api.get(url);
      
      if (data && data.status === 'success') {
        // Ensure proper message structure
        const messages = (data.messages || []).map(msg => ({
          ...msg,
          id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: msg.message || msg.content || msg.messageContent || '',
          sender_id: msg.sender_id || msg.senderId,
          created_at: msg.created_at || msg.createdAt || new Date().toISOString()
        }));
        
        // Sort messages by creation date (oldest first, newest last)
        const sortedMessages = messages.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateA - dateB; // Ascending order: oldest to newest
        });
        
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    if (!conversationId) return;
    
    try {
      await api.put(`/messages/mark-read`, { conversationId });
      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    if (isMobile) setShowContactsList(false);
    fetchMessagesForRecipient(recipient);
    
    // Mark messages as read when conversation is opened
    if (recipient.conversationId) {
      markMessagesAsRead(recipient.conversationId);
    }
    
    setSelectedStudentForTeacher(null);
    setSearchQuery('');
  };

  const handleBackToContacts = () => {
    setShowContactsList(true);
    setSelectedRecipient(null);
    setMessages([]);
  };

  const handleClearChat = async () => {
    if (!selectedRecipient?.conversationId) return;
    
    // Check if mobile device
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Check if running in Capacitor (native app)
      const isCapacitor = window.Capacitor?.isNativePlatform();
      
      let confirmed = false;
      
      if (false) { // Temporarily disabled for web testing
        // Use Capacitor Dialog for native apps
        try {
          // const { Dialog } = await import('@capacitor/dialog');
          const result = await Promise.resolve({ value: false }); // Dialog.confirm({
          //   title: 'Clear Chat',
          //   message: 'Are you sure you want to clear this chat? This action cannot be undone.',
          //   okButtonTitle: 'Clear',
          //   cancelButtonTitle: 'Cancel'
          // });
          confirmed = result.value;
        } catch (error) {
          // Fallback to native confirm if Capacitor Dialog not available
          confirmed = window.confirm('Are you sure you want to clear this chat? This action cannot be undone.');
        }
      } else {
        // Use native confirm for mobile web
        confirmed = window.confirm('Are you sure you want to clear this chat? This action cannot be undone.');
      }
      
      if (confirmed) {
        try {
          await api.delete(`/messages/conversation/${selectedRecipient.conversationId}`);
          setMessages([]);
          fetchConversations(); // Refresh conversation list
          toast.success('Chat cleared successfully');
        } catch (error) {
          console.error('Error clearing chat:', error);
          toast.error('Failed to clear chat');
        }
      }
    } else {
      // Use custom modal for desktop
      setConfirmModal({
        isOpen: true,
        title: 'Clear Chat',
        message: 'Are you sure you want to clear this chat? This action cannot be undone.',
        onConfirm: async () => {
          try {
            await api.delete(`/messages/conversation/${selectedRecipient.conversationId}`);
            setMessages([]);
            fetchConversations(); // Refresh conversation list
            toast.success('Chat cleared successfully');
          } catch (error) {
            console.error('Error clearing chat:', error);
            toast.error('Failed to clear chat');
          }
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
        }
      });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedRecipient) return;

    const tempMessage = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: messageContent,
      sender_id: user.id,
      sender_name: user.name || 'You',
      recipient_id: selectedRecipient.id,
      recipient_name: selectedRecipient.name,
      created_at: new Date().toISOString(),
      temp: true,
      student_name: selectedStudentForTeacher?.studentName || selectedRecipient.studentName
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageText = messageContent;
    setMessageContent('');

    try {
      let endpoint, payload;
      
      if (isTeacher) {
        if (selectedRecipient.id === 'all') {
          // Teacher sending to all parents
          endpoint = '/messages/teacher/send-to-all-parents';
          payload = {
            messageContent: messageText,
            studentId: selectedStudentForTeacher?.studentId
          };
        } else {
          // Teacher sending to specific parent
          endpoint = '/messages/teacher/send-to-parent';
          payload = {
            parentId: selectedRecipient.id,
            messageContent: messageText,
            studentId: selectedRecipient.studentId
          };
        }
      } else {
        // Parent sending to teacher
        endpoint = '/messages/parent/send-to-teacher';
        payload = {
          teacherId: selectedRecipient.id,
          messageContent: messageText,
          studentId: selectedRecipient.studentId
        };
      }

      const { data } = await api.post(endpoint, payload);
      
      // Remove the temporary message
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      
      // Create successful message with proper structure
      let successMessage;
      
      if (data && data.message) {
        // Use API response message if available
        successMessage = {
          ...data.message,
          id: data.message.id || `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: data.message.message || messageText,
          sender_id: user.id,
          sender_name: user.name || 'You',
          created_at: data.message.created_at || new Date().toISOString(),
          student_name: selectedStudentForTeacher?.studentName || selectedRecipient.studentName
        };
      } else {
        // Fallback message structure
        successMessage = {
          id: `sent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: messageText, // This is the actual message content
          sender_id: user.id,
          sender_name: user.name || 'You',
          recipient_id: selectedRecipient.id,
          recipient_name: selectedRecipient.name,
          created_at: new Date().toISOString(),
          student_name: selectedStudentForTeacher?.studentName || selectedRecipient.studentName,
          temp: false
        };
      }
      
      setMessages(prev => [...prev, successMessage]);
      
      // Refresh conversations to update last message and timestamps
      fetchConversations();
      
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const addEmoji = (emoji) => {
    setMessageContent(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '🙏', '💯', '🔥', '⭐', '🎉'];

  // Mobile view - show either contacts list or chat
  if (isMobile && !showContactsList && selectedRecipient) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        {/* Mobile Chat Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-primary-600 text-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToContacts}
              className="p-1 rounded-full hover:bg-primary-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="font-semibold text-sm">
                  {getInitials(selectedRecipient.name)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{selectedRecipient.name}</h3>
                {selectedRecipient.studentName && (
                  <p className="text-xs text-primary-200">
                    Re: {selectedRecipient.studentName}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* 3-dots menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-full hover:bg-primary-700 transition-colors"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <button
                  onClick={handleClearChat}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <div className="p-4 space-y-4 min-h-full flex flex-col">
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <ModernMessageBubble
                        key={message.id || `message-${index}-${message.created_at || Date.now()}`}
                        message={message}
                        currentUser={user}
                        isOwnMessage={message.sender_id === user.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={sendMessage} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={textareaRef}
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              />
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaceSmileIcon className="h-5 w-5" />
              </button>

              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="grid grid-cols-5 gap-2">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={`emoji-${emoji}-${index}`}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!messageContent.trim()}
              className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* Contacts Sidebar - Hidden on mobile when chat is open */}
      <div className={`${isMobile && !showContactsList ? 'hidden' : 'flex'} ${isMobile ? 'w-full' : 'w-80'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}>
        {/* Header */}
        <div className="p-4 bg-primary-600 text-white">
          <h2 className="text-lg font-semibold mb-3">
            Messages
          </h2>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-300" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-primary-700 text-white placeholder-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-sm">Loading conversations...</p>
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <UserGroupIcon className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredRecipients.map((recipient) => (
                <motion.button
                  key={recipient.uniqueKey || recipient.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRecipientSelect(recipient)}
                  className={`
                    w-full flex items-center space-x-3 p-4 text-left transition-all duration-200 rounded-xl
                    ${selectedRecipient?.conversationId === recipient.conversationId
                      ? 'bg-primary-50 dark:bg-primary-900 border-l-4 border-primary-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="relative">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm
                      ${selectedRecipient?.conversationId === recipient.conversationId
                        ? 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                      }
                    `}>
                      {getInitials(recipient.name)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {recipient.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {recipient.lastMessageTime ? new Date(recipient.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        {/* Green unread indicator */}
                        {recipient.unreadCount > 0 && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    {recipient.studentName && (
                      <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">
                        📚 {recipient.studentName}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                        {recipient.lastMessage ? recipient.lastMessage.substring(0, 40) + (recipient.lastMessage.length > 40 ? '...' : '') : 
                         recipient.type === 'teacher' ? '👩‍🏫 Teacher' : '👨‍👩‍👧‍👦 Parent'}
                      </p>
                      {/* Unread count indicator */}
                      {recipient.unreadCount > 0 && (
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 ml-2">
                          {recipient.unreadCount > 99 ? '99+' : recipient.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {recipient.type === 'group' && (
                    <Badge variant="info" className="ml-2 text-xs">
                      Group
                    </Badge>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Chat Area */}
      {!isMobile && (
        <div className="flex-1 flex flex-col h-full">
          {selectedRecipient ? (
            <>
              {/* Chat Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-white text-sm">
                        {getInitials(selectedRecipient.name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {selectedRecipient.name}
                      </h3>
                      {selectedRecipient.studentName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Regarding: {selectedRecipient.studentName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* 3-dots menu */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    
                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                        <button
                          onClick={handleClearChat}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Clear Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                <div className="min-h-full flex flex-col justify-end">
                  <div className="p-4 space-y-4">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence>
                          {messages.map((message, index) => (
                            <ModernMessageBubble
                              key={message.id || `desktop-message-${index}-${message.created_at || Date.now()}`}
                              message={message}
                              currentUser={user}
                              isOwnMessage={message.sender_id === user.id}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <form onSubmit={sendMessage} className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={textareaRef}
                      type="text"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <FaceSmileIcon className="h-5 w-5" />
                    </button>

                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-5 gap-2">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={`desktop-emoji-${emoji}-${index}`}
                              type="button"
                              onClick={() => addEmoji(emoji)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!messageContent.trim()}
                    className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose someone to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Chat Area - Only show when a conversation is selected */}
      {isMobile && !showContactsList && selectedRecipient && (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
          {/* Mobile Chat Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowContactsList(true)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-white text-xs">
                    {getInitials(selectedRecipient.name)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedRecipient.name}
                  </h3>
                  {selectedRecipient.studentName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Re: {selectedRecipient.studentName}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Mobile 3-dots menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    <button
                      onClick={handleClearChat}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <div className="min-h-full flex flex-col justify-end">
              <div className="p-4 space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <ModernMessageBubble
                          key={message.id || `mobile-message-${index}-${message.created_at || Date.now()}`}
                          message={message}
                          currentUser={user}
                          isOwnMessage={message.sender_id === user.id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Mobile Message Input - Fixed at bottom */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <form onSubmit={sendMessage} className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={textareaRef}
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                />
                
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaceSmileIcon className="h-5 w-5" />
                </button>

                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-5 gap-2">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={`mobile-emoji-${emoji}-${index}`}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!messageContent.trim()}
                className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Confirm Modal - Desktop only */}
      {!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => {
            setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
          }}
        />
      )}
    </div>
  );
};

// Modern Message Bubble Component
const ModernMessageBubble = ({ message, currentUser, isOwnMessage }) => {
  const formatTime = (iso) => {
    try {
      // Handle invalid or missing dates
      if (!iso) return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      
      const date = new Date(iso);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      }
      
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Date formatting error:', error);
      return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
  };

  const studentLabel = message.students && message.students.length ? message.students.join(', ')
                       : message.student_name || '';

  // Get message content - handle different field names
  const messageContent = message.message || message.content || message.messageContent || '';

  // Don't render if no message content
  if (!messageContent && !message.temp) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
        isOwnMessage
          ? 'bg-primary-600 text-white'
          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-600'
      } ${message.temp ? 'opacity-70' : ''}`}>
        
        {!isOwnMessage && studentLabel && (
          <div className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-2 bg-primary-50 dark:bg-primary-900 px-2 py-1 rounded">
            📚 Re: {studentLabel}
          </div>
        )}
        
        <div className="text-sm leading-relaxed mb-1">
          {message.temp ? 'Sending...' : messageContent}
        </div>
        
        <div className={`flex items-center justify-end space-x-1 text-xs ${
          isOwnMessage ? 'text-primary-100' : 'text-gray-400 dark:text-gray-500'
        }`}>
          <span>{formatTime(message.created_at)}</span>
          {isOwnMessage && (
            <div className="flex">
              {message.temp ? (
                <div className="animate-pulse">⏳</div>
              ) : message.read ? (
                <div className="flex">
                  <CheckIcon className="w-3 h-3 text-blue-400 -mr-1" />
                  <CheckIcon className="w-3 h-3 text-blue-400" />
                </div>
              ) : (
                <CheckIcon className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageComposer;
