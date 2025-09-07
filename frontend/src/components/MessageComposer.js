import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import './MessageComposer.css';

const MessageComposer = ({ user, contacts, isTeacher }) => {
    const [messageContent, setMessageContent] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [selectedStudentForTeacher, setSelectedStudentForTeacher] = useState(null); // For teacher to select a student to message their parents
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMessages = async (otherUserId = null, studentId = null) => {
        setLoading(true);
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
                setMessages(response.data.messages);
            } else {
                setError(response.data.message || 'Failed to fetch messages');
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError('Error fetching messages.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages(); // Fetch all messages on component mount
    }, [user, contacts]);

    useEffect(() => {
        // Refetch messages when a recipient is selected
        if (selectedRecipient && selectedRecipient.id !== 'all') {
            fetchMessages(selectedRecipient.id, selectedStudentForTeacher);
        } else {
            // If no specific recipient, or 'All Parents of My Students' is selected, show all relevant messages for the user
            fetchMessages();
        }
    }, [selectedRecipient, selectedStudentForTeacher]);

    const handleSendMessage = async () => {
        if (!messageContent.trim()) return;

        setLoading(true);
        setError(null);

        try {
            let payload = { messageContent: messageContent.trim() };
            let endpoint;

            if (isTeacher) {
                if (selectedRecipient && selectedRecipient.type === 'parent') {
                    endpoint = '/messages/teacher/send-to-parent';
                    payload.studentId = selectedStudentForTeacher; // The student whose parent is the recipient
                    payload.parentId = selectedRecipient.id;
                } else if (selectedStudentForTeacher) {
                    endpoint = '/messages/teacher/send-to-all-parents';
                    payload.studentId = selectedStudentForTeacher; // Send to all parents of this student
                } else {
                    endpoint = '/messages/teacher/send-to-all-parents'; // Send to all parents of all teacher's students
                }
            } else { // Is Parent
                if (!selectedRecipient || selectedRecipient.type !== 'teacher') {
                    setError('Please select a teacher to send a message to.');
                    setLoading(false);
                    return;
                }
                endpoint = '/messages/parent/send-to-teacher';
                payload.teacherId = selectedRecipient.id;
                // If a parent has multiple children, they might select a student to give context
                if (selectedStudentForTeacher) { // Re-using this variable for parent's selected child
                    payload.studentId = selectedStudentForTeacher;
                }
            }
            const response = await api.post(endpoint, payload);

            if (response.data.status === 'success') {
                setMessageContent('');
                // Only pass otherUserId if a specific recipient (not 'all') is selected
                const fetchOtherUserId = (selectedRecipient && selectedRecipient.id !== 'all') ? selectedRecipient.id : null;
                fetchMessages(fetchOtherUserId, selectedStudentForTeacher); // Refresh messages
            } else {
                setError(response.data.message || 'Failed to send message');
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setError(err.response?.data?.message || 'Error sending message.');
        } finally {
            setLoading(false);
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
                        name: `${parent.parentName} (Parent of ${student.studentName})`, 
                        type: 'parent',
                        studentId: student.studentId
                    });
                });
            });
        } else { // Parent
            contacts.forEach(child => {
                child.teachers.forEach(teacher => {
                    options.push({ 
                        id: teacher.teacherId, 
                        name: `${teacher.teacherName} (Teacher of ${child.studentName})`, 
                        type: 'teacher',
                        studentId: child.studentId
                    });
                });
            });
        }
        return options;
    };

    const renderMessages = () => {
        if (loading && messages.length === 0) return <p>Loading messages...</p>;
        if (error) return <p className="error-message">Error: {error}</p>;
        if (messages.length === 0) return <p>No messages yet.</p>;

        // Group messages by conversation (if conversation_id is available and we are viewing a specific conversation)
        const groupedMessages = messages.reduce((acc, msg) => {
            const conversationKey = msg.conversation_id || 'general';
            if (!acc[conversationKey]) {
                acc[conversationKey] = [];
            }
            acc[conversationKey].push(msg);
            return acc;
        }, {});

        return Object.entries(groupedMessages).map(([key, convMessages]) => (
            <div key={key} className="conversation-group">
                {/* You might want a conversation header here if not a direct 1-1 chat */}
                {convMessages.map(msg => (
                    <div key={msg.id} className={`message-item ${msg.sender_id === user.userId ? 'sent' : 'received'}`}>
                        <div className="message-header">
                            <strong>{msg.sender_id === user.userId ? 'You' : msg.sender_name}</strong>
                            {msg.student_name && <span className="message-context"> (Student: {msg.student_name})</span>}
                            <span className="message-time">{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                        <p>{msg.message}</p>
                    </div>
                ))}
            </div>
        ));
    };

    const handleRecipientChange = (e) => {
        const value = e.target.value;
        if (value === '' || value === 'all') {
            setSelectedRecipient(value === 'all' ? {id: 'all', name: 'All Parents of My Students', type: 'group'} : null);
            setSelectedStudentForTeacher(null);
        } else {
            const [type, id, studentIdStr] = value.split('-');
            const studentId = studentIdStr ? parseInt(studentIdStr) : null;

            const contact = getRecipientOptions().find(opt => 
                opt.id == id && opt.type === type && (opt.studentId === studentId || !opt.studentId)
            );
            setSelectedRecipient(contact);
            if (isTeacher && type === 'parent') {
                setSelectedStudentForTeacher(studentId);
            } else if (!isTeacher && type === 'teacher') {
                setSelectedStudentForTeacher(studentId); // For parent to specify which child they are referring to
            }
        }
    };

    return (
        <div className="message-composer">
            <div className="message-header">
                <h3>💬 {isTeacher ? 'Teacher Messages' : 'Parent Messages'}</h3>
            </div>
            
            <div className="recipient-selection">
                <label htmlFor="recipient-select">Send to:</label>
                <select id="recipient-select" onChange={handleRecipientChange} value={selectedRecipient ? (selectedRecipient.id === 'all' ? 'all' : `${selectedRecipient.type}-${selectedRecipient.id}-${selectedRecipient.studentId || ''}`) : ''}>
                    <option value="">-- Select Recipient --</option>
                    {getRecipientOptions().map(option => (
                        <option 
                            key={`${option.type}-${option.id}-${option.studentId || ''}`}
                            value={option.id === 'all' ? 'all' : `${option.type}-${option.id}-${option.studentId || ''}`}
                        >
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="message-list">
                {renderMessages()}
            </div>

            <div className="message-input-area">
                <textarea
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows="3"
                ></textarea>
                <button onClick={handleSendMessage} disabled={loading || !messageContent.trim() || (!selectedRecipient && selectedRecipient?.id !== 'all' && isTeacher) || (!selectedRecipient && !isTeacher)}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default MessageComposer;
