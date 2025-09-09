// MessageComposer.js
import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import './MessageComposer.chat.css';

/**
 * MessageComposer.js
 * - Shows merged student names for parents with multiple children
 * - Ensures bubbles display "Re: <Child1, Child2>" when selected contact has multiple students
 * - Adds students list to optimistic messages so temporary bubbles also look correct
 *
 * Props:
 * - user: { userId, id, name, ... }
 * - contacts: array (shape depends on parent/teacher view)
 * - isTeacher: boolean
 * - initialContact: optional object to auto-select a contact when opened (used by ParentDashboard)
 */

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '';
  }
};

const initialsFromName = (name) =>
  (name || '').split(' ').map(n => n[0] || '').slice(0, 2).join('').toUpperCase();

/* Single message bubble */
const MessageBubble = ({ msg, isSentByMe, currentUserName }) => {
  // Prefer msg.students (array) -> join, else msg.student_name (single)
  const studentLabel = msg.students && msg.students.length ? msg.students.join(', ')
                       : msg.student_name || '';

  return (
    <div className={`message-bubble ${isSentByMe ? 'sent' : 'received'} ${msg.temp ? 'sending' : ''}`} title={msg.message}>
      {!isSentByMe && (
        <div className="bubble-avatar" title={msg.sender_name || 'User'}>
          {initialsFromName(msg.sender_name)}
        </div>
      )}

      <div className="bubble-body">
        <div className="bubble-meta">
          <div className="meta-left">
            <span className="meta-sender">{isSentByMe ? 'You' : msg.sender_name}</span>
            {(studentLabel) && (
              <span className="meta-context">Re: {studentLabel}</span>
            )}
          </div>
          <div className="meta-time">{formatTime(msg.created_at)}</div>
        </div>

        <div className="bubble-text">{msg.message}</div>

        {isSentByMe && (
          <div className="bubble-status">
            {msg.temp ? 'Sending…' : (msg.delivery_status || 'Delivered')}
          </div>
        )}
      </div>

      {isSentByMe && (
        <div className="bubble-avatar sent-avatar" title={currentUserName || 'You'}>
          {initialsFromName(currentUserName)}
        </div>
      )}
    </div>
  );
};

const MessageComposer = ({ user, contacts = [], isTeacher = false, initialContact = null }) => {
  const [messageContent, setMessageContent] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedStudentForTeacher, setSelectedStudentForTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ---------------------------
  // Helper: build recipient options and dedupe / merge students
  // ---------------------------
  const getRecipientOptions = () => {
    const raw = [];
    if (isTeacher) {
      // Teacher view: build list of parents from students
      raw.push({ id: 'all', name: 'All Parents of My Students', type: 'group' });
      (contacts || []).forEach(student => {
        (student.parents || []).forEach(parent => {
          raw.push({
            id: parent.parentId ?? parent.id,
            name: parent.parentName ?? parent.name,
            type: 'parent',
            studentId: student.studentId ?? student.id,
            studentName: student.studentName ?? student.name
          });
        });
      });
    } else {
      // Parent view: build list of teachers from each child
      (contacts || []).forEach(child => {
        (child.teachers || []).forEach(teacher => {
          raw.push({
            id: teacher.teacherId ?? teacher.id,
            name: teacher.teacherName ?? teacher.name,
            type: 'teacher',
            studentId: child.studentId ?? child.id,
            studentName: child.studentName ?? child.name
          });
        });
      });
    }

    // Dedupe by type+id and merge student names into `students` array
    const map = new Map();
    raw.forEach(item => {
      if (item.id === 'all') {
        map.set('all', { ...item });
        return;
      }
      const key = `${item.type}-${item.id}`;
      if (!map.has(key)) {
        map.set(key, { ...item, students: item.studentName ? [item.studentName] : [] });
      } else {
        const existing = map.get(key);
        if (item.studentName && !existing.students.includes(item.studentName)) {
          existing.students.push(item.studentName);
        }
      }
    });

    // Build final options: put students and subName
    const options = Array.from(map.values()).map(it => {
      if (it.id === 'all') return it;
      return {
        ...it,
        subName: it.students && it.students.length ? `Parent of ${it.students.join(', ')}` : (it.subName || ''),
        students: it.students || []
      };
    });

    return options;
  };

  const optionKey = (opt) => opt.id === 'all' ? 'all' : `${opt.type}-${opt.id}-${opt.studentId || ''}`;

  // ---------------------------
  // Fetch messages and enrich each message with `students` info where possible
  // ---------------------------
  const fetchMessages = async (otherUserId = null, studentId = null, studentsForRecipient = null) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/messages`;
      const queryParams = [];
      if (otherUserId) queryParams.push(`otherUserId=${otherUserId}`);
      if (studentId) queryParams.push(`studentId=${studentId}`);
      if (queryParams.length) url += `?${queryParams.join('&')}`;

      const response = await api.get(url);
      if (response.data?.status === 'success') {
        const sorted = (response.data.messages || []).slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        // Enrich each message with students array:
        const enriched = sorted.map(m => {
          // if server already included a students array, keep it
          if (m.students && Array.isArray(m.students)) return m;
          // if message has a student_name field, use it as single-element array
          if (m.student_name) return { ...m, students: [m.student_name] };
          // fallback to the studentsForRecipient (e.g., the selected contact who may have multiple kids)
          if (studentsForRecipient && studentsForRecipient.length) return { ...m, students: studentsForRecipient };
          return m;
        });

        setMessages(enriched);
        setTimeout(() => scrollToBottom(false), 40);
      } else {
        setError(response.data?.message || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('fetchMessages error', err);
      setError('Unable to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Initial load + respond to contacts / selection changes
  // ---------------------------
  useEffect(() => {
    // initial messages (no filter)
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, contacts]);

  useEffect(() => {
    // auto-select initialContact if provided once
    if (initialContact) {
      // initialContact expected to be { teacherId, teacherName, studentId, studentName } for parent,
      // or { id, name, students: [...] } shape if already normalized.
      // We'll try to find a matching option from recipientOptions and select it.
      const options = getRecipientOptions();
      // Find by teacher id or parent id
      let found = null;
      if (initialContact.teacherId) {
        found = options.find(o => o.type === 'teacher' && String(o.id) === String(initialContact.teacherId));
      }
      if (!found && initialContact.id) {
        found = options.find(o => String(o.id) === String(initialContact.id));
      }
      if (found) {
        setSelectedRecipient(found);
        setSelectedStudentForTeacher(initialContact.studentId || found.studentId || null);
        // fetch messages for that recipient
        fetchMessages(found.id !== 'all' ? found.id : null, initialContact.studentId || null, found.students || null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContact]);

  useEffect(() => {
    if (selectedRecipient) {
      const otherUserId = selectedRecipient.id === 'all' ? null : selectedRecipient.id;
      fetchMessages(otherUserId, selectedStudentForTeacher, selectedRecipient.students || null);
    } else {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecipient, selectedStudentForTeacher]);

  // auto scroll on messages change
  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ---------------------------
  // scrolling helper
  // ---------------------------
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
      } catch {
        messagesEndRef.current.scrollIntoView();
      }
    }
  };

  // ---------------------------
  // textarea autosize
  // ---------------------------
  const handleTextareaChange = (e) => {
    setMessageContent(e.target.value);
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const max = 160;
    textarea.style.height = Math.min(textarea.scrollHeight, max) + 'px';
  };

  // ---------------------------
  // Sending messages (optimistic)
  // ---------------------------
  const handleSendMessage = async () => {
    const trimmed = messageContent.trim();
    if (!trimmed) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      sender_id: user.userId || user.id,
      sender_name: user.name || 'You',
      message: trimmed,
      created_at: new Date().toISOString(),
      temp: true,
      // ensure students array present for optimistic bubble (use recipient's students if available)
      students: selectedRecipient?.students && selectedRecipient.students.length ? selectedRecipient.students : (selectedStudentForTeacher ? [selectedStudentForTeacher] : [])
    };

    // optimistic UI
    setMessages(prev => [...prev, tempMessage]);
    setMessageContent('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);
    setError(null);

    try {
      let payload = { messageContent: trimmed };
      let endpoint = '/messages/parent/send-to-teacher';

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
          setMessages(prev => prev.filter(m => m.id !== tempId));
          setLoading(false);
          return;
        }
        endpoint = '/messages/parent/send-to-teacher';
        payload.teacherId = selectedRecipient.id;
        if (selectedStudentForTeacher) payload.studentId = selectedStudentForTeacher;
      }

      const response = await api.post(endpoint, payload);
      if (response.data?.status === 'success') {
        // refetch messages for the currently selected recipient and include students array for enrichment
        const fetchOtherUserId = (selectedRecipient && selectedRecipient.id !== 'all') ? selectedRecipient.id : null;
        fetchMessages(fetchOtherUserId, selectedStudentForTeacher, selectedRecipient?.students || null);
      } else {
        setError(response.data?.message || 'Failed to send message');
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } catch (err) {
      console.error('send message error', err);
      setError(err?.response?.data?.message || 'Failed to send message. Please try again.');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  // Enter to send, Shift+Enter newline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ---------------------------
  // Contact select handlers
  // ---------------------------
  const recipientOptions = getRecipientOptions();

  const findOptionByKey = (key) => recipientOptions.find(o => optionKey(o) === key);

  const handleContactSelect = (option) => {
    if (!option) {
      setSelectedRecipient(null);
      setSelectedStudentForTeacher(null);
    } else {
      setSelectedRecipient(option);
      // if a parent option was selected in teacher view, set the selected studentId if present
      if (isTeacher && option.type === 'parent') {
        // prefer the first student for per-parent-per-student view; but option.students keeps all names for display
        setSelectedStudentForTeacher(option.studentId || null);
      } else if (!isTeacher && option.type === 'teacher') {
        setSelectedStudentForTeacher(option.studentId || null);
      } else if (option.id === 'all') {
        setSelectedStudentForTeacher(null);
      }
    }
  };

  // ---------------------------
  // Rendering
  // ---------------------------
  const renderMessages = () => {
    if (loading && messages.length === 0) {
      return <div className="loading-row">Loading messages…</div>;
    }
    if (error && messages.length === 0) {
      return <div className="error-row">{error}</div>;
    }
    if (!messages || messages.length === 0) {
      return (
        <div className="empty-row">
          <div className="empty-emoji">💬</div>
          <div className="empty-title">No messages yet</div>
          <div className="empty-sub">Start the conversation</div>
        </div>
      );
    }

    return messages.map((msg, idx) => {
      const isSentByCurrentUser = (msg.sender_id === (user.userId || user.id));
      // ensure msg.students exists (fallback to selectedRecipient students if available)
      const studentsArr = (msg.students && Array.isArray(msg.students) && msg.students.length) ? msg.students :
                          (selectedRecipient && selectedRecipient.students && selectedRecipient.students.length ? selectedRecipient.students : (msg.student_name ? [msg.student_name] : []));

      const enriched = { ...msg, students: studentsArr };

      return (
        <MessageBubble
          key={enriched.id || `${idx}-${enriched.created_at}`}
          msg={enriched}
          isSentByMe={isSentByCurrentUser}
          currentUserName={user.name}
        />
      );
    });
  };

  return (
    <div className="mc-container">
      <div className="mc-sidebar" aria-hidden={false}>
        <div className="mc-recipient-select">
          <label>Select Contact</label>
          <select
            value={selectedRecipient ? optionKey(selectedRecipient) : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) { handleContactSelect(null); return; }
              if (val === 'all') {
                handleContactSelect({ id: 'all', name: 'All Parents of My Students', type: 'group', students: [] });
                return;
              }
              const found = findOptionByKey(val);
              if (found) handleContactSelect(found);
            }}
          >
            <option value="">-- Select Contact --</option>
            {recipientOptions.map(opt => (
              <option key={optionKey(opt)} value={optionKey(opt)}>
                {opt.name}{opt.subName ? ` (${opt.subName})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="mc-contacts">
          {recipientOptions.map(opt => (
            <button
              key={optionKey(opt)}
              type="button"
              className={`contact-row ${selectedRecipient && (selectedRecipient.id === opt.id && selectedRecipient.type === opt.type) ? 'active' : ''}`}
              onClick={() => handleContactSelect(opt)}
            >
              <div className="contact-avatar">{opt.id === 'all' ? '👥' : initialsFromName(opt.name)}</div>
              <div className="contact-info">
                <div className="contact-name">{opt.id === 'all' ? 'All Parents' : opt.name}</div>
                <div className="contact-sub">{opt.id === 'all' ? 'Broadcast' : opt.subName}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mc-main">
        <div className="mc-header">
          <h3>{isTeacher ? 'Teacher Messages' : 'Messages'}</h3>
          <div className="header-sub">{selectedRecipient ? (selectedRecipient.id === 'all' ? 'Broadcast' : selectedRecipient.name) : 'Select a contact'}</div>
        </div>

        <div className="mc-divider" aria-hidden="true" />

        <div className="mc-message-list" role="log" aria-live="polite">
          {renderMessages()}
          <div ref={messagesEndRef} />
        </div>

        <div className="mc-composer">
          {error && <div className="composer-error">{error}</div>}
          <div className="composer-row">
            <textarea
              aria-label="Message input"
              ref={textareaRef}
              className="composer-textarea"
              placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
              value={messageContent}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="composer-send"
              type="button"
              onClick={handleSendMessage}
              disabled={loading || !messageContent.trim()}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3,11 22,2 13,21 11,13 3,11"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;
