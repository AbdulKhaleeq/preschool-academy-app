const { pool } = require('../config/db');

// Helper to get conversation ID (simplified for now)
const getConversationId = async (senderId, receiverId, studentId = null) => {
    // In a real app, this would involve more sophisticated logic
    // to ensure unique conversation IDs for distinct teacher-parent-student threads.
    // For simplicity, we'll generate a new one if not provided, or find an existing one.
    // This is a placeholder; actual implementation might involve checking existing messages.
    const res = await pool.query(
        `SELECT conversation_id FROM messages
         WHERE (sender_id = $1 AND receiver_id = $2 AND (student_id = $3 OR ($3 IS NULL AND student_id IS NULL)))
            OR (sender_id = $2 AND receiver_id = $1 AND (student_id = $3 OR ($3 IS NULL AND student_id IS NULL)))
         LIMIT 1`,
        [senderId, receiverId, studentId]
    );
    if (res.rows.length > 0) {
        return res.rows[0].conversation_id;
    } else {
        // Generate a new UUID if no existing conversation found
        const newUuidRes = await pool.query('SELECT gen_random_uuid()');
        return newUuidRes.rows[0].gen_random_uuid;
    }
};


// @desc    Teacher sends message to all parents of their students
// @route   POST /api/messages/teacher/send-to-all-parents
// @access  Private (Teacher)
const teacherSendToAllParents = async (req, res) => {
    const { messageContent, studentId } = req.body;
    const teacherId = req.user.userId; // Authenticated teacher's user ID

    if (!messageContent) {
        return res.status(400).json({ status: 'error', message: 'Message content is required.' });
    }

    try {
        let targetParentIds = [];

        if (studentId) {
            // Teacher sending to parents of a specific student
            const studentCheck = await pool.query(
                `SELECT s.id, sp.parent_id
                 FROM students s
                 JOIN student_teachers st ON s.id = st.student_id
                 JOIN student_parents sp ON s.id = sp.student_id
                 JOIN users up ON sp.parent_id = up.id
                 WHERE s.id = $1 AND st.teacher_id = $2 AND up.role = 'parent'`,
                [studentId, teacherId]
            );

            if (studentCheck.rows.length === 0) {
                return res.status(403).json({ status: 'error', message: 'You are not authorized to message parents of this student.' });
            }
            targetParentIds = studentCheck.rows.map(row => row.parent_id);
        } else {
            // Teacher sending to all parents of their assigned students
            const result = await pool.query(
                `SELECT DISTINCT sp.parent_id
                 FROM student_teachers st
                 JOIN student_parents sp ON st.student_id = sp.student_id
                 JOIN users up ON sp.parent_id = up.id
                 WHERE st.teacher_id = $1 AND up.role = 'parent'`,
                [teacherId]
            );
            targetParentIds = result.rows.map(row => row.parent_id);
        }

        if (targetParentIds.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No parents found to send message to.' });
        }

        for (const parentId of targetParentIds) {
            const conversationId = await getConversationId(teacherId, parentId, studentId);
            await pool.query(
                `INSERT INTO messages (sender_id, receiver_id, student_id, message, conversation_id)
                 VALUES ($1, $2, $3, $4, $5)`,
                [teacherId, parentId, studentId, messageContent, conversationId]
            );
        }

        res.status(201).json({ status: 'success', message: 'Message sent to relevant parents.' });
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
    const teacherId = req.user.userId; // Corrected from req.user.id

    if (!messageContent || !studentId || !parentId) {
        return res.status(400).json({ status: 'error', message: 'Message content, student ID, and parent ID are required.' });
    }

    try {
        // Validate if teacher is assigned to student and parent is associated with student
        const validation = await pool.query(
            `SELECT s.id
             FROM students s
             JOIN student_teachers st ON s.id = st.student_id
             JOIN student_parents sp ON s.id = sp.student_id
             WHERE s.id = $1 AND st.teacher_id = $2 AND sp.parent_id = $3`,
            [studentId, teacherId, parentId]
        );

        if (validation.rows.length === 0) {
            return res.status(403).json({ status: 'error', message: 'You are not authorized to message this parent/student combination.' });
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
    const parentId = req.user.userId; // Corrected from req.user.id

    if (!messageContent || !teacherId) {
        return res.status(400).json({ status: 'error', message: 'Message content and teacher ID are required.' });
    }

    try {
        // Validate if parent is associated with student and teacher is assigned to student
        let validationQuery;
        let queryParams;

        if (studentId) {
            validationQuery = `SELECT s.id
                             FROM students s
                             JOIN student_parents sp ON s.id = sp.student_id
                             JOIN student_teachers st ON s.id = st.student_id
                             WHERE s.id = $1 AND sp.parent_id = $2 AND st.teacher_id = $3`;
            queryParams = [studentId, parentId, teacherId];
        } else {
            // If studentId is not provided, check if the parent has any child with the teacher
            validationQuery = `SELECT s.id
                             FROM students s
                             JOIN student_parents sp ON s.id = sp.student_id
                             JOIN student_teachers st ON s.id = st.student_id
                             WHERE sp.parent_id = $1 AND st.teacher_id = $2`;
            queryParams = [parentId, teacherId];
        }

        const validation = await pool.query(validationQuery, queryParams);

        if (validation.rows.length === 0) {
            return res.status(403).json({ status: 'error', message: 'You are not authorized to message this teacher.' });
        }

        const conversationId = await getConversationId(parentId, teacherId, studentId);
        await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, student_id, message, conversation_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [parentId, teacherId, studentId, messageContent, conversationId]
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
    const userId = req.user.userId; // Corrected from req.user.id
    const { limit = 20, offset = 0, otherUserId, studentId } = req.query;

    try {
        let query = `
            SELECT
                m.id, m.sender_id, m.receiver_id, m.student_id, m.message, m.created_at, m.read_at, m.conversation_id,
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

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

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
    const teacherId = req.user.userId; // Corrected from req.user.id

    try {
        const result = await pool.query(
            `SELECT
                s.id as student_id, s.name as student_name,
                up.id as parent_id, up.name as parent_name
            FROM students s
            JOIN student_teachers st ON s.id = st.student_id
            JOIN student_parents sp ON s.id = sp.student_id
            JOIN users up ON sp.parent_id = up.id
            WHERE st.teacher_id = $1
            ORDER BY s.name, up.name`,
            [teacherId]
        );

        const studentsMap = new Map();
        result.rows.forEach(row => {
            if (!studentsMap.has(row.student_id)) {
                studentsMap.set(row.student_id, { studentId: row.student_id, studentName: row.student_name, parents: [] });
            }
            studentsMap.get(row.student_id).parents.push({ parentId: row.parent_id, parentName: row.parent_name });
        });

        res.status(200).json({ status: 'success', students: Array.from(studentsMap.values()) });
    } catch (error) {
        console.error('Error fetching teacher contacts:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

// @desc    Get parents' contacts (children and their teachers)
// @route   GET /api/messages/parent/contacts
// @access  Private (Parent)
const getParentContacts = async (req, res) => {
    const parentId = req.user.userId; // Corrected from req.user.id

    try {
        const result = await pool.query(
            `SELECT
                s.id as student_id, s.name as student_name,
                ut.id as teacher_id, ut.name as teacher_name
            FROM students s
            JOIN student_parents sp ON s.id = sp.student_id
            JOIN student_teachers st ON s.id = st.student_id
            JOIN users ut ON st.teacher_id = ut.id
            WHERE sp.parent_id = $1
            ORDER BY s.name, ut.name`,
            [parentId]
        );

        const childrenMap = new Map();
        result.rows.forEach(row => {
            if (!childrenMap.has(row.student_id)) {
                childrenMap.set(row.student_id, { studentId: row.student_id, studentName: row.student_name, teachers: [] });
            }
            childrenMap.get(row.student_id).teachers.push({ teacherId: row.teacher_id, teacherName: row.teacher_name });
        });

        res.status(200).json({ status: 'success', children: Array.from(childrenMap.values()) });
    } catch (error) {
        console.error('Error fetching parent contacts:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};

module.exports = {
    teacherSendToAllParents,
    teacherSendToParent,
    parentSendToTeacher,
    getMessages,
    getTeacherContacts,
    getParentContacts
};



