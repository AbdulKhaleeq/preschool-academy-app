const { pool } = require('../config/db');

// Helper to get conversation ID - always include studentId for proper separation
const getConversationId = async (senderId, receiverId, studentId) => {
    // Always require studentId for proper conversation separation
    if (!studentId) {
        throw new Error('Student ID is required for conversation identification');
    }
    
    const res = await pool.query(
        `SELECT conversation_id FROM messages
         WHERE (sender_id = $1 AND receiver_id = $2 AND student_id = $3)
            OR (sender_id = $2 AND receiver_id = $1 AND student_id = $3)
         LIMIT 1`,
        [senderId, receiverId, studentId]
    );
    
    if (res.rows.length > 0) {
        return res.rows[0].conversation_id;
    } else {
        const newUuidRes = await pool.query('SELECT gen_random_uuid()');
        return newUuidRes.rows[0].gen_random_uuid;
    }
};

// @desc    Teacher sends message to all parents of their students
// @route   POST /api/messages/teacher/send-to-all-parents
// @access  Private (Teacher)
const teacherSendToAllParents = async (req, res) => {
    const { messageContent, studentId } = req.body;
    const teacherId = req.user.userId;

    if (!messageContent) {
        return res.status(400).json({ status: 'error', message: 'Message content is required.' });
    }

    try {
        let targetParents = [];

        if (studentId) {
            // Teacher sending to parent of a specific student
            const studentCheck = await pool.query(
                `SELECT s.id, s.parent_phone, p.id as parent_id, p.name as parent_name
                 FROM students s
                 JOIN users p ON s.parent_phone = p.phone_number AND p.role = 'parent'
                 WHERE s.id = $1 AND s.teacher_id = $2`,
                [studentId, teacherId]
            );

            if (studentCheck.rows.length === 0) {
                return res.status(403).json({ 
                    status: 'error', 
                    message: 'You are not authorized to message parents of this student or student has no assigned parent.' 
                });
            }
            targetParents = studentCheck.rows;
        } else {
            // Teacher sending to all parents of their assigned students
            // We need to send a separate message for each student to maintain proper conversation context
            const result = await pool.query(
                `SELECT s.id as student_id, s.parent_phone, p.id as parent_id, p.name as parent_name, s.name as student_name
                 FROM students s
                 JOIN users p ON s.parent_phone = p.phone_number AND p.role = 'parent'
                 WHERE s.teacher_id = $1
                 ORDER BY s.name`,
                [teacherId]
            );
            targetParents = result.rows;
        }

        if (targetParents.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No parents found to send message to.' });
        }

        for (const parent of targetParents) {
            // Use the specific studentId if provided, otherwise use the student_id from the query result
            const messageStudentId = studentId || parent.student_id;
            const conversationId = await getConversationId(teacherId, parent.parent_id, messageStudentId);
            await pool.query(
                `INSERT INTO messages (sender_id, receiver_id, student_id, message, conversation_id)
                 VALUES ($1, $2, $3, $4, $5)`,
                [teacherId, parent.parent_id, messageStudentId, messageContent, conversationId]
            );
        }

        res.status(201).json({ 
            status: 'success', 
            message: `Message sent to ${targetParents.length} parent(s).` 
        });
    } catch (error) {
        console.error('Error sending message to all parents:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

// @desc    Teacher sends message to a specific parent of a specific student
// @route   POST /api/messages/teacher/send-to-parent
// @access  Private (Teacher)
const teacherSendToParent = async (req, res) => {
    const { messageContent, studentId, parentId } = req.body;
    const teacherId = req.user.userId;

    if (!messageContent || !studentId || !parentId) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Message content, student ID, and parent ID are required.' 
        });
    }

    try {
        // Validate if teacher is assigned to student and parent is associated with student
        const validation = await pool.query(
            `SELECT s.id, s.name as student_name, p.name as parent_name
             FROM students s
             JOIN users p ON s.parent_phone = p.phone_number AND p.role = 'parent'
             WHERE s.id = $1 AND s.teacher_id = $2 AND p.id = $3`,
            [studentId, teacherId, parentId]
        );

        if (validation.rows.length === 0) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'You are not authorized to message this parent/student combination.' 
            });
        }

        const conversationId = await getConversationId(teacherId, parentId, studentId);
        await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, student_id, message, conversation_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [teacherId, parentId, studentId, messageContent, conversationId]
        );

        res.status(201).json({ status: 'success', message: 'Message sent to parent.' });
    } catch (error) {
        console.error('Error sending message to specific parent:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

// @desc    Parent sends message to an assigned teacher
// @route   POST /api/messages/parent/send-to-teacher
// @access  Private (Parent)
const parentSendToTeacher = async (req, res) => {
    const { messageContent, teacherId, studentId } = req.body;
    const parentId = req.user.userId;

    if (!messageContent || !teacherId) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Message content and teacher ID are required.' 
        });
    }

    try {
        let finalStudentId = studentId;
        let validationQuery;
        let queryParams;

        if (studentId) {
            // Parent sending about a specific child
            validationQuery = `
                SELECT s.id, s.name as student_name, t.name as teacher_name
                FROM students s
                JOIN users t ON s.teacher_id = t.id AND t.role = 'teacher'
                JOIN users p ON s.parent_phone = p.phone_number AND p.role = 'parent'
                WHERE s.id = $1 AND p.id = $2 AND s.teacher_id = $3`;
            queryParams = [studentId, parentId, teacherId];
        } else {
            // Parent sending to teacher without specifying child - find the first child with this teacher
            validationQuery = `
                SELECT s.id, s.name as student_name, t.name as teacher_name
                FROM students s
                JOIN users t ON s.teacher_id = t.id AND t.role = 'teacher'
                JOIN users p ON s.parent_phone = p.phone_number AND p.role = 'parent'
                WHERE p.id = $1 AND s.teacher_id = $2
                ORDER BY s.name
                LIMIT 1`;
            queryParams = [parentId, teacherId];
        }

        const validation = await pool.query(validationQuery, queryParams);

        if (validation.rows.length === 0) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'You are not authorized to message this teacher or no children found with this teacher.' 
            });
        }

        // Use the validated student ID
        finalStudentId = validation.rows[0].id;

        const conversationId = await getConversationId(parentId, teacherId, finalStudentId);
        await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, student_id, message, conversation_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [parentId, teacherId, finalStudentId, messageContent, conversationId]
        );

        res.status(201).json({ status: 'success', message: 'Message sent to teacher.' });
    } catch (error) {
        console.error('Error sending message to teacher:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

// @desc    Get all messages for the authenticated user
// @route   GET /api/messages
// @access  Private (Teacher, Parent)
const getMessages = async (req, res) => {
    const userId = req.user.userId;
    const { limit = 20, offset = 0, otherUserId, studentId } = req.query;

    try {
        let query = `
            SELECT
                m.id, m.sender_id, m.receiver_id, m.student_id, m.message, 
                m.created_at, m.read_at, m.conversation_id,
                us.name as sender_name,
                ur.name as receiver_name,
                s.name as student_name
            FROM messages m
            LEFT JOIN users us ON m.sender_id = us.id
            LEFT JOIN users ur ON m.receiver_id = ur.id
            LEFT JOIN students s ON m.student_id = s.id
        `;

        const queryParams = [userId];
        let whereClauses = [`(m.sender_id = $1 OR m.receiver_id = $1)`];
        let paramIndex = 2;

        if (otherUserId) {
            whereClauses.push(`(m.sender_id = $${paramIndex} OR m.receiver_id = $${paramIndex})`);
            queryParams.push(otherUserId);
            paramIndex++;
        }
        if (studentId) {
            whereClauses.push(`m.student_id = $${paramIndex}`);
            queryParams.push(studentId);
            paramIndex++;
        }

        query += ` WHERE ${whereClauses.join(' AND ')}`;
        query += ` ORDER BY m.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);

        res.status(200).json({ status: 'success', messages: result.rows });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

// @desc    Get teachers' contacts (students and their parents)
// @route   GET /api/messages/teacher/contacts
// @access  Private (Teacher)
const getTeacherContacts = async (req, res) => {
    const teacherId = req.user.userId;

    try {
        const result = await pool.query(
            `SELECT
                s.id as student_id, s.name as student_name,
                p.id as parent_id, p.name as parent_name, p.phone_number as parent_phone
            FROM students s
            JOIN users p ON s.parent_phone = p.phone_number AND p.role = 'parent'
            WHERE s.teacher_id = $1
            ORDER BY s.name, p.name`,
            [teacherId]
        );

        const studentsMap = new Map();
        result.rows.forEach(row => {
            if (!studentsMap.has(row.student_id)) {
                studentsMap.set(row.student_id, { 
                    studentId: row.student_id, 
                    studentName: row.student_name, 
                    parents: [] 
                });
            }
            studentsMap.get(row.student_id).parents.push({ 
                parentId: row.parent_id, 
                parentName: row.parent_name,
                parentPhone: row.parent_phone
            });
        });

        res.status(200).json({ 
            status: 'success', 
            students: Array.from(studentsMap.values()) 
        });
    } catch (error) {
        console.error('Error fetching teacher contacts:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

// @desc    Get parents' contacts (children and their teachers)
// @route   GET /api/messages/parent/contacts
// @access  Private (Parent)
const getParentContacts = async (req, res) => {
    const parentId = req.user.userId;

    try {
        const result = await pool.query(
            `SELECT
                s.id as student_id, s.name as student_name,
                t.id as teacher_id, t.name as teacher_name, t.phone_number as teacher_phone
            FROM students s
            JOIN users t ON s.teacher_id = t.id AND t.role = 'teacher'
            JOIN users p ON s.parent_phone = p.phone_number AND p.role = 'parent'
            WHERE p.id = $1
            ORDER BY s.name, t.name`,
            [parentId]
        );

        const childrenMap = new Map();
        result.rows.forEach(row => {
            if (!childrenMap.has(row.student_id)) {
                childrenMap.set(row.student_id, { 
                    studentId: row.student_id, 
                    studentName: row.student_name, 
                    teachers: [] 
                });
            }
            childrenMap.get(row.student_id).teachers.push({ 
                teacherId: row.teacher_id, 
                teacherName: row.teacher_name,
                teacherPhone: row.teacher_phone
            });
        });

        res.status(200).json({ 
            status: 'success', 
            children: Array.from(childrenMap.values()) 
        });
    } catch (error) {
        console.error('Error fetching parent contacts:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

// @desc    Get conversation threads grouped by student
// @route   GET /api/messages/conversations
// @access  Private (Teacher, Parent)
const getConversationThreads = async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;

    try {
        let query;
        if (userRole === 'teacher') {
            query = `
                SELECT DISTINCT
                    m.conversation_id,
                    m.student_id,
                    s.name as student_name,
                    p.id as parent_id,
                    p.name as parent_name,
                    p.phone_number as parent_phone,
                    (SELECT message FROM messages m2 WHERE m2.conversation_id = m.conversation_id ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM messages m2 WHERE m2.conversation_id = m.conversation_id ORDER BY m2.created_at DESC LIMIT 1) as last_message_time,
                    (SELECT COUNT(*) FROM messages m2 WHERE m2.conversation_id = m.conversation_id AND m2.receiver_id = $1 AND m2.read_at IS NULL) as unread_count
                FROM messages m
                JOIN students s ON m.student_id = s.id
                JOIN users p ON s.parent_phone = p.phone_number AND p.role = 'parent'
                WHERE (m.sender_id = $1 OR m.receiver_id = $1)
                AND s.teacher_id = $1
                ORDER BY last_message_time DESC`;
        } else if (userRole === 'parent') {
            query = `
                SELECT DISTINCT
                    m.conversation_id,
                    m.student_id,
                    s.name as student_name,
                    t.id as teacher_id,
                    t.name as teacher_name,
                    t.phone_number as teacher_phone,
                    (SELECT message FROM messages m2 WHERE m2.conversation_id = m.conversation_id ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM messages m2 WHERE m2.conversation_id = m.conversation_id ORDER BY m2.created_at DESC LIMIT 1) as last_message_time,
                    (SELECT COUNT(*) FROM messages m2 WHERE m2.conversation_id = m.conversation_id AND m2.receiver_id = $1 AND m2.read_at IS NULL) as unread_count
                FROM messages m
                JOIN students s ON m.student_id = s.id
                JOIN users t ON s.teacher_id = t.id AND t.role = 'teacher'
                JOIN users p ON s.parent_phone = p.phone_number AND p.role = 'parent'
                WHERE (m.sender_id = $1 OR m.receiver_id = $1)
                AND p.id = $1
                ORDER BY last_message_time DESC`;
        } else {
            return res.status(403).json({ status: 'error', message: 'Access denied' });
        }

        const result = await pool.query(query, [userId]);

        res.status(200).json({ 
            status: 'success', 
            conversations: result.rows 
        });
    } catch (error) {
        console.error('Error fetching conversation threads:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

// @desc    Mark messages as read in a conversation
// @route   PUT /api/messages/mark-read
// @access  Private (Teacher, Parent)
const markMessagesAsRead = async (req, res) => {
    const userId = req.user.userId;
    const { conversationId } = req.body;

    if (!conversationId) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Conversation ID is required.' 
        });
    }

    try {
        await pool.query(
            `UPDATE messages 
             SET read_at = NOW() 
             WHERE conversation_id = $1 
             AND receiver_id = $2 
             AND read_at IS NULL`,
            [conversationId, userId]
        );

        res.status(200).json({ status: 'success', message: 'Messages marked as read.' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

// @desc    Clear all messages in a conversation
// @route   DELETE /api/messages/conversation/:conversationId
// @access  Private (Teacher, Parent)
const clearConversation = async (req, res) => {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    if (!conversationId) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Conversation ID is required.' 
        });
    }

    try {
        // First verify that the user is part of this conversation
        const conversationCheck = await pool.query(
            `SELECT DISTINCT sender_id, receiver_id 
             FROM messages 
             WHERE conversation_id = $1 
             AND (sender_id = $2 OR receiver_id = $2)`,
            [conversationId, userId]
        );

        if (conversationCheck.rows.length === 0) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'You are not authorized to clear this conversation.' 
            });
        }

        // Delete all messages in the conversation
        const result = await pool.query(
            `DELETE FROM messages 
             WHERE conversation_id = $1 
             AND (sender_id = $2 OR receiver_id = $2)`,
            [conversationId, userId]
        );

        res.status(200).json({ 
            status: 'success', 
            message: `Conversation cleared. ${result.rowCount} messages deleted.` 
        });
    } catch (error) {
        console.error('Error clearing conversation:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

module.exports = {
    teacherSendToAllParents,
    teacherSendToParent,
    parentSendToTeacher,
    getMessages,
    getTeacherContacts,
    getParentContacts,
    getConversationThreads,
    markMessagesAsRead,
    clearConversation
};