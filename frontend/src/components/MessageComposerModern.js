import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import { Card, Button, Badge } from './ui';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  FaceSmileIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { CheckIcon, CheckCheckIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

const MessageComposerModern = ({ user, contacts = [], isTeacher = false, initialContact = null }) => {
  const [messageContent, setMessageContent] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedStudentForTeacher, setSelectedStudentForTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContactsList, setShowContactsList] = useState(true);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (iso) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return '';
    }
  };

  const getInitials = (name) => {
    return (name || '').split(' ').map(n => n[0] || '').slice(0, 2).join('').toUpperCase();
  };

  const getRecipientOptions = () => {
    const raw = [];
    if (isTeacher) {
      raw.push({ id: 'all', name: 'All Parents of My Students', type: 'group' });
      (contacts || []).forEach(student => {
        (student.parents || []).forEach(parent => {
          raw.push({
            id: parent.parentId ?? parent.id,
            name: parent.parentName ?? parent.name,
            type: 'parent',
            studentName: student.studentName ?? student.name,
            studentId: student.studentId ?? student.id
          });
        });
      });
    } else {
      (contacts || []).forEach(child => {
        (child.teachers || []).forEach(teacher => {
          raw.push({
            id: teacher.teacherId ?? teacher.id,
            name: teacher.teacherName ?? teacher.name,
            type: 'teacher',
            studentName: child.studentName ?? child.name,
            studentId: child.studentId ?? child.id
          });
        });
      });
    }

    const seen = new Set();
    return raw.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const filteredRecipients = getRecipientOptions().filter(recipient =>
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.studentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchMessagesForRecipient = async (recipient) => {
    if (!recipient || recipient.id === 'all') return;
    
    setLoading(true);
    try {
      const { data } = await api.get(`/messages?otherUserId=${recipient.id}`);
      if (data && data.status === 'success') {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    setShowContactsList(false);
    fetchMessagesForRecipient(recipient);
    setSelectedStudentForTeacher(null);
    setSearchQuery('');
  };

  const handleBackToContacts = () => {
    setShowContactsList(true);
    setSelectedRecipient(null);
    setMessages([]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedRecipient) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
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
      const payload = {
        recipient_id: selectedRecipient.id,
        message: messageText,
        student_id: selectedStudentForTeacher?.studentId || selectedRecipient.studentId
      };

      const { data } = await api.post('/messages', payload);
      if (data && data.status === 'success') {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setMessages(prev => [...prev, data.message]);
        toast.success('Message sent!');
      } else {
        throw new Error('Failed to send message');
      }
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

  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '🙏', '💯', '🔥', '⭐', '🎉'];

  // Mobile view - show either contacts list or chat
  const isMobile = window.innerWidth < 768;

  if (isMobile && !showContactsList && selectedRecipient) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        {/* Mobile Chat Header */}
        <div className="flex items-center justify-between p-4 bg-primary-600 text-white">
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
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-primary-700 transition-colors">
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-primary-700 transition-colors">
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-primary-700 transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <ModernMessageBubble
                  key={message.id}
                  message={message}
                  currentUser={user}
                  isOwnMessage={message.sender_id === user.id}
                />
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
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
                        key={index}
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
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
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
          {filteredRecipients.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <UserGroupIcon className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm">No contacts found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredRecipients.map((recipient) => (
                <motion.button
                  key={recipient.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRecipientSelect(recipient)}
                  className={`
                    w-full flex items-center space-x-3 p-4 text-left transition-all duration-200 rounded-xl
                    ${selectedRecipient?.id === recipient.id
                      ? 'bg-primary-50 dark:bg-primary-900 border-l-4 border-primary-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="relative">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm
                      ${selectedRecipient?.id === recipient.id
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
                      <span className="text-xs text-gray-400">12:30 PM</span>
                    </div>
                    
                    {recipient.studentName && (
                      <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">
                        📚 {recipient.studentName}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {recipient.type === 'teacher' ? '👩‍🏫 Teacher' : '👨‍👩‍👧‍👦 Parent'}
                    </p>
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
        <div className="flex-1 flex flex-col">
          {selectedRecipient ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
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
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400">
                      <PhoneIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400">
                      <VideoCameraIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                {loading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <ModernMessageBubble
                        key={message.id}
                        message={message}
                        currentUser={user}
                        isOwnMessage={message.sender_id === user.id}
                      />
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 p-4">
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
                              key={index}
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
    </div>
  );
};

// Modern Message Bubble Component
const ModernMessageBubble = ({ message, currentUser, isOwnMessage }) => {
  const formatTime = (iso) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const studentLabel = message.students && message.students.length ? message.students.join(', ')
                       : message.student_name || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
        isOwnMessage
          ? 'bg-primary-600 text-white ml-auto'
          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-600'
      } ${message.temp ? 'opacity-70' : ''}`}>
        
        {!isOwnMessage && studentLabel && (
          <div className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-2 bg-primary-50 dark:bg-primary-900 px-2 py-1 rounded">
            📚 Re: {studentLabel}
          </div>
        )}
        
        <div className="text-sm leading-relaxed mb-1">
          {message.message}
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
                <CheckCheckIcon className="w-3 h-3 text-blue-400" />
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

export default MessageComposerModern;
