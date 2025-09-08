import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import './MessageComposer.css';

const MessageComposer = ({ user, contacts, isTeacher }) => {
    const [messageContent, setMessageContent] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [selectedStudentForTeacher, setSelectedStudentForTeacher] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobileView, setIsMobileView] = useState(false); // Start with false for desktop
    const [showChatView, setShowChatView] = useState(false);
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Better viewport detection
    useEffect(() => {
        const checkViewport = () => {
            const width = window.innerWidth;
            const isMobile = width <= 768;
            console.log('Viewport width:', width, 'Is Mobile:', isMobile); // Debug log
            setIsMobileView(isMobile);
            if (!isMobile) {
                setShowChatView(false);
            }
        };

        // Check immediately
        checkViewport();
        
        // Add resize listener
        window.addEventListener('resize', checkViewport);
        
        return () => window.removeEventListener('resize', checkViewport);
    }, []);

    // Force scroll to bottom on desktop when messages change
    useEffect(() => {
        if (!isMobileView && messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages, isMobileView]);

    const fetchMessages = async (otherUserId = null, studentId = null) => {
        setLoading(true);
        setError(null);
        try {
            let url = `/messages`;
            const queryParams = [];
            if (otherUserId) {
                queryParams.push(`otherUserId=${otherUserId}`);
            }
            if (studentId) {
                queryParams.push(`studentId=${studentId}`);
            }
            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }
            
            const response = await api.get(url);
            if (response.data.status === 'success') {
                // Always sort oldest first - CSS will handle display order for mobile
                const sortedMessages = response.data.messages.sort((a, b) => 
                    new Date(a.created_at) - new Date(b.created_at)
                );
                setMessages(sortedMessages);
            } else {
                setError(response.data.message || 'Failed to fetch messages');
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError('Unable to load messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [user, contacts]);

    useEffect(() => {
        if (selectedRecipient && selectedRecipient.id !== 'all') {
            fetchMessages(selectedRecipient.id, selectedStudentForTeacher);
        } else {
            fetchMessages();
        }
    }, [selectedRecipient, selectedStudentForTeacher]);

    const handleSendMessage = async () => {
        if (!messageContent.trim()) return;

        const tempMessage = {
            id: Date.now(),
            sender_id: user.userId,
            sender_name: 'You',
            message: messageContent.trim(),
            created_at: new Date().toISOString(),
            temp: true
        };

        // Always add to end of array - CSS handles display order
        setMessages(prev => [...prev, tempMessage]);
        
        setMessageContent('');
        
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        
        setLoading(true);
        setError(null);

        try {
            let payload = { messageContent: messageContent.trim() };
            let endpoint;

            if (isTeacher) {
                if (selectedRecipient && selectedRecipient.type === 'parent') {
                    endpoint = '/messages/teacher/send-to-parent';
                    payload.studentId = selectedStudentForTeacher;
                    payload.parentId = selectedRecipient.id;
                } else if (selectedStudentForTeacher) {
                    endpoint = '/messages/teacher/send-to-all-parents';
                    payload.studentId = selectedStudentForTeacher;
                } else {
                    endpoint = '/messages/teacher/send-to-all-parents';
                }
            } else {
                if (!selectedRecipient || selectedRecipient.type !== 'teacher') {
                    setError('Please select a teacher to send a message to.');
                    setMessages(prev => prev.filter(msg => !msg.temp));
                    setLoading(false);
                    return;
                }
                endpoint = '/messages/parent/send-to-teacher';
                payload.teacherId = selectedRecipient.id;
                if (selectedStudentForTeacher) {
                    payload.studentId = selectedStudentForTeacher;
                }
            }

            const response = await api.post(endpoint, payload);

            if (response.data.status === 'success') {
                const fetchOtherUserId = (selectedRecipient && selectedRecipient.id !== 'all') ? selectedRecipient.id : null;
                fetchMessages(fetchOtherUserId, selectedStudentForTeacher);
            } else {
                setError(response.data.message || 'Failed to send message');
                setMessages(prev => prev.filter(msg => !msg.temp));
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
            setMessages(prev => prev.filter(msg => !msg.temp));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleTextareaChange = (e) => {
        setMessageContent(e.target.value);
        
        // Auto-resize textarea
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const maxHeight = isMobileView ? 80 : 200;
            textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
        }
    };

    const getRecipientOptions = () => {
        const options = [];
        if (isTeacher) {
            options.push({ id: 'all', name: 'All Parents of My Students', type: 'group' });
            contacts.forEach(student => {
                student.parents.forEach(parent => {
                    options.push({ 
                        id: parent.parentId, 
                        name: `${parent.parentName}`, 
                        subName: `Parent of ${student.studentName}`,
                        type: 'parent',
                        studentId: student.studentId
                    });
                });
            });
        } else {
            contacts.forEach(child => {
                child.teachers.forEach(teacher => {
                    options.push({ 
                        id: teacher.teacherId, 
                        name: `${teacher.teacherName}`, 
                        subName: `Teacher of ${child.studentName}`,
                        type: 'teacher',
                        studentId: child.studentId
                    });
                });
            });
        }
        return options;
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleContactSelect = (option) => {
        if (option.id === 'all') {
            setSelectedRecipient({id: 'all', name: 'All Parents of My Students', type: 'group'});
            setSelectedStudentForTeacher(null);
        } else {
            setSelectedRecipient(option);
            if (isTeacher && option.type === 'parent') {
                setSelectedStudentForTeacher(option.studentId);
            } else if (!isTeacher && option.type === 'teacher') {
                setSelectedStudentForTeacher(option.studentId);
            }
        }
        
        if (isMobileView) {
            setShowChatView(true);
        }
    };

    const handleBackToContacts = () => {
        setShowChatView(false);
    };

    const renderMessages = () => {
        if (loading && messages.length === 0) {
            return (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <span>Loading messages...</span>
                </div>
            );
        }
        
        if (error && messages.length === 0) {
            return (
                <div className="error-message">
                    {error}
                </div>
            );
        }
        
        if (messages.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-state-icon">💬</div>
                    <h3>No messages yet</h3>
                    <p>Start a conversation by sending your first message!</p>
                </div>
            );
        }

        return (
        <>
            {messages.map(msg => {
                // Fix the alignment logic - check if current user sent the message
                const isSentByCurrentUser = msg.sender_id === user.userId;
                
                return (
                    <div 
                        key={msg.id} 
                        className={`message-item ${isSentByCurrentUser ? 'sent' : 'received'} ${msg.temp ? 'sending' : ''}`}
                    >
                        <div className="message-item-header">
                            <div className="message-sender">
                                {isSentByCurrentUser ? 'You' : msg.sender_name}
                                {msg.student_name && (
                                    <span className="message-context">
                                        Re: {msg.student_name}
                                    </span>
                                )}
                            </div>
                            <span className="message-time">
                                {new Date(msg.created_at).toLocaleString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <p>{msg.message}</p>
                        {isSentByCurrentUser && (
                            <div className="message-status">
                                {msg.temp ? 'Sending...' : 'Delivered'}
                            </div>
                        )}
                    </div>
                );
            })}
            {!isMobileView && <div ref={messagesEndRef} />}
        </>
    );
};

    // Debug logging
    console.log('Current view mode:', isMobileView ? 'Mobile' : 'Desktop');

    const renderDesktopView = () => (
        <div className="message-composer desktop-view">
            <div className="message-header">
                <h3>{isTeacher ? 'Teacher Messages' : 'Parent Messages'}</h3>
            </div>
            
            <div className="message-composer-content">
                <div className="message-sidebar">
                    <div className="recipient-selection">
                        <label>Select Contact</label>
                        <select 
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || value === 'all') {
                                    const option = value === 'all' ? 
                                        {id: 'all', name: 'All Parents of My Students', type: 'group'} : 
                                        null;
                                    handleContactSelect(option);
                                } else {
                                    const [type, id, studentIdStr] = value.split('-');
                                    const studentId = studentIdStr ? parseInt(studentIdStr) : null;
                                    const option = getRecipientOptions().find(opt => 
                                        opt.id == id && opt.type === type && (opt.studentId === studentId || !opt.studentId)
                                    );
                                    handleContactSelect(option);
                                }
                            }} 
                            value={selectedRecipient ? (selectedRecipient.id === 'all' ? 'all' : `${selectedRecipient.type}-${selectedRecipient.id}-${selectedRecipient.studentId || ''}`) : ''}
                        >
                            <option value="">-- Select Contact --</option>
                            {getRecipientOptions().map(option => (
                                <option 
                                    key={`${option.type}-${option.id}-${option.studentId || ''}`}
                                    value={option.id === 'all' ? 'all' : `${option.type}-${option.id}-${option.studentId || ''}`}
                                >
                                    {option.name} {option.subName && `(${option.subName})`}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="contacts-list">
                        {getRecipientOptions().map(option => (
                            <div
                                key={`${option.type}-${option.id}-${option.studentId || ''}`}
                                className={`contact-item ${selectedRecipient && (selectedRecipient.id === option.id || (selectedRecipient.id === 'all' && option.id === 'all')) ? 'active' : ''}`}
                                onClick={() => handleContactSelect(option)}
                            >
                                <div className="contact-avatar">
                                    {option.id === 'all' ? '👥' : getInitials(option.name)}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-name">
                                        {option.id === 'all' ? 'All Parents' : option.name}
                                    </div>
                                    <div className="contact-role">
                                        {option.id === 'all' ? 'Broadcast Message' : option.subName}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="message-main">
                    <div className="message-list">
                        {renderMessages()}
                    </div>

                    <div className="message-input-section desktop-input">
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                        
                        <div className="message-input-area desktop-input-area">
                            <div className="message-input-wrapper desktop-input-wrapper">
                                <textarea
                                    ref={textareaRef}
                                    className="desktop-textarea"
                                    placeholder="Type your message here... Press Enter to send, Shift+Enter for new line"
                                    value={messageContent}
                                    onChange={handleTextareaChange}
                                    onKeyPress={handleKeyPress}
                                />
                                <button className="emoji-button desktop-emoji" type="button">
                                    😊
                                </button>
                            </div>
                            <button 
                                className="send-button desktop-send"
                                onClick={handleSendMessage} 
                                disabled={loading || !messageContent.trim()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="3,11 22,2 13,21 11,13 3,11"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMobileView = () => {
    if (showChatView && selectedRecipient) {
        return (
            <div className="message-composer mobile-view chat-view">
                <div className="mobile-chat-header">
                    <button className="mobile-back-button" onClick={handleBackToContacts}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                    </button>
                    <div className="chat-info">
                        <div className="chat-avatar">
                            {selectedRecipient.id === 'all' ? '👥' : getInitials(selectedRecipient.name)}
                        </div>
                        <div className="chat-details">
                            <div className="chat-name">
                                {selectedRecipient.id === 'all' ? 'All Parents' : selectedRecipient.name}
                            </div>
                            <div className="chat-role">
                                {selectedRecipient.id === 'all' ? 'Broadcast' : selectedRecipient.subName}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mobile-message-list">
                    {renderMessages()}
                </div>
                
                <div className="mobile-message-input">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    <div className="mobile-input-area">
                        <textarea
                            ref={textareaRef}
                            placeholder="Type a message..."
                            value={messageContent}
                            onChange={handleTextareaChange}
                            onKeyPress={handleKeyPress}
                        />
                        <button 
                            className="mobile-send-button"
                            onClick={handleSendMessage} 
                            disabled={loading || !messageContent.trim()}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWeight="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="3,11 22,2 13,21 11,13 3,11"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

        return (
            <div className="message-composer mobile-view contacts-view">
                <div className="mobile-header">
                    <h3>{isTeacher ? 'Messages' : 'Messages'}</h3>
                </div>
                
                <div className="mobile-recipient-selection">
                    <label>Select Contact</label>
                    <select 
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || value === 'all') {
                                const option = value === 'all' ? 
                                    {id: 'all', name: 'All Parents of My Students', type: 'group'} : 
                                    null;
                                handleContactSelect(option);
                            } else {
                                const [type, id, studentIdStr] = value.split('-');
                                const studentId = studentIdStr ? parseInt(studentIdStr) : null;
                                const option = getRecipientOptions().find(opt => 
                                    opt.id == id && opt.type === type && (opt.studentId === studentId || !opt.studentId)
                                );
                                handleContactSelect(option);
                            }
                        }} 
                        value={selectedRecipient ? (selectedRecipient.id === 'all' ? 'all' : `${selectedRecipient.type}-${selectedRecipient.id}-${selectedRecipient.studentId || ''}`) : ''}
                    >
                        <option value="">-- Select Contact --</option>
                        {getRecipientOptions().map(option => (
                            <option 
                                key={`${option.type}-${option.id}-${option.studentId || ''}`}
                                value={option.id === 'all' ? 'all' : `${option.type}-${option.id}-${option.studentId || ''}`}
                            >
                                {option.name} {option.subName && `(${option.subName})`}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="mobile-contacts-list">
                    {getRecipientOptions().map(option => (
                        <div
                            key={`${option.type}-${option.id}-${option.studentId || ''}`}
                            className="mobile-contact-item"
                            onClick={() => handleContactSelect(option)}
                        >
                            <div className="mobile-contact-avatar">
                                {option.id === 'all' ? '👥' : getInitials(option.name)}
                            </div>
                            <div className="mobile-contact-info">
                                <div className="mobile-contact-name">
                                    {option.id === 'all' ? 'All Parents' : option.name}
                                </div>
                                <div className="mobile-contact-role">
                                    {option.id === 'all' ? 'Send message to all parents' : option.subName}
                                </div>
                            </div>
                            <div className="mobile-contact-arrow">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return isMobileView ? renderMobileView() : renderDesktopView();
};

export default MessageComposer;
