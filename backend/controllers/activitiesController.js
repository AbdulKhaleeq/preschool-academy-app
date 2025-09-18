const { pool } = require('../config/db');

const listActivities = async (req, res) => {
  try {
    const { role, userId } = req.user;
    let query, params;

    if (role === 'teacher') {
      // Teachers see their activities with student details
      query = `
        SELECT DISTINCT a.*, u.name as teacher_name,
               array_agg(DISTINCT jsonb_build_object(
                 'id', s.id,
                 'name', s.name,
                 'is_completed', COALESCE(acs.is_completed, false)
               )) as students
        FROM activities a 
        LEFT JOIN users u ON a.teacher_id = u.id 
        LEFT JOIN activity_students acs ON a.id = acs.activity_id
        LEFT JOIN students s ON acs.student_id = s.id
        WHERE a.teacher_id = $1 
        GROUP BY a.id, u.name
        ORDER BY a.start_date DESC, a.created_at DESC
      `;
      params = [userId];
    } else if (role === 'parent') {
      // Parents see activities for their children
      query = `
        SELECT DISTINCT a.*, u.name as teacher_name,
               array_agg(DISTINCT jsonb_build_object(
                 'id', s.id,
                 'name', s.name,
                 'is_completed', COALESCE(acs.is_completed, false)
               )) as students
        FROM activities a 
        LEFT JOIN users u ON a.teacher_id = u.id 
        INNER JOIN activity_students acs ON a.id = acs.activity_id
        INNER JOIN students s ON acs.student_id = s.id AND s.parent_id = $1
        GROUP BY a.id, u.name
        ORDER BY a.start_date DESC, a.created_at DESC
      `;
      params = [userId];
    } else {
      // Admins see all activities
      query = `
        SELECT DISTINCT a.*, u.name as teacher_name,
               array_agg(DISTINCT jsonb_build_object(
                 'id', s.id,
                 'name', s.name,
                 'is_completed', COALESCE(acs.is_completed, false)
               )) as students
        FROM activities a 
        LEFT JOIN users u ON a.teacher_id = u.id 
        LEFT JOIN activity_students acs ON a.id = acs.activity_id
        LEFT JOIN students s ON acs.student_id = s.id
        GROUP BY a.id, u.name
        ORDER BY a.start_date DESC, a.created_at DESC
      `;
      params = [];
    }

    const result = await pool.query(query, params);
    return res.json({ success: true, activities: result.rows });
  } catch (error) {
    console.error('Error listing activities:', error);
    return res.status(500).json({ success: false, message: 'Error fetching activities' });
  }
};

const createActivity = async (req, res) => {
  try {
    const { role, userId, name: userName } = req.user;
    
    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers can create activities' });
    }

    const { title, description, start_date, end_date, student_ids } = req.body;
    
    if (!title || !start_date || !student_ids || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Title, start date, and at least one student are required' });
    }

    // Ensure student_ids are integers
    const intStudentIds = student_ids.map(id => parseInt(id));

    // Verify teacher can assign to these students
    if (role === 'teacher') {      
      const studentCheck = await pool.query(
        'SELECT id FROM students WHERE teacher_id = $1 AND id = ANY($2)',
        [userId, intStudentIds]
      );
      
      if (studentCheck.rows.length !== intStudentIds.length) {
        return res.status(403).json({ success: false, message: 'You can only create activities for your assigned students' });
      }
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create activity
      const activityResult = await pool.query(
        `INSERT INTO activities (title, description, start_date, end_date, teacher_id, created_by_name) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, description || null, start_date, end_date || null, userId, userName]
      );
      
      const activityId = activityResult.rows[0].id;

      // Create activity-student relationships
      for (const studentId of intStudentIds) {
        await pool.query(
          'INSERT INTO activity_students (activity_id, student_id) VALUES ($1, $2)',
          [activityId, studentId]
        );
      }

      await pool.query('COMMIT');

      // Fetch the complete activity with students
      const completeActivity = await pool.query(`
        SELECT a.*, u.name as teacher_name,
               array_agg(jsonb_build_object(
                 'id', s.id,
                 'name', s.name,
                 'is_completed', acs.is_completed
               )) as students
        FROM activities a 
        LEFT JOIN users u ON a.teacher_id = u.id 
        LEFT JOIN activity_students acs ON a.id = acs.activity_id
        LEFT JOIN students s ON acs.student_id = s.id
        WHERE a.id = $1
        GROUP BY a.id, u.name
      `, [activityId]);

      return res.json({ success: true, activity: completeActivity.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating activity:', error);
    return res.status(500).json({ success: false, message: 'Error creating activity' });
  }
};

const updateActivityStatus = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id: activityId } = req.params;
    const { student_id, is_completed } = req.body;

    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers can update activities' });
    }

    let query, params;

    if (student_id) {
      // Update specific student's completion status
      query = `UPDATE activity_students 
               SET is_completed = $1 
               WHERE activity_id = $2 AND student_id = $3`;
      params = [is_completed, activityId, student_id];

      if (role === 'teacher') {
        // Verify teacher owns this activity
        const activityCheck = await pool.query(
          'SELECT id FROM activities WHERE id = $1 AND teacher_id = $2',
          [activityId, userId]
        );
        if (activityCheck.rows.length === 0) {
          return res.status(403).json({ success: false, message: 'Not authorized to update this activity' });
        }
      }
    } else {
      // Update overall activity completion
      query = `UPDATE activities 
               SET is_completed = $1 
               WHERE id = $2`;
      params = [is_completed, activityId];

      if (role === 'teacher') {
        query += ' AND teacher_id = $3';
        params.push(userId);
      }

      query += ' RETURNING *';
    }

    const result = await pool.query(query, params);
    
    if (!student_id && result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found or not authorized' });
    }

    return res.json({ success: true, message: 'Activity updated successfully' });
  } catch (error) {
    console.error('Error updating activity:', error);
    return res.status(500).json({ success: false, message: 'Error updating activity' });
  }
};

const getTeacherStudents = async (req, res) => {
  try {
    const { role, userId } = req.user;
    
    if (role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can access this endpoint' });
    }

    const result = await pool.query(
      'SELECT id, name, class_name FROM students WHERE teacher_id = $1 ORDER BY name',
      [userId]
    );
    
    return res.json({ success: true, students: result.rows });
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    return res.status(500).json({ success: false, message: 'Error fetching students' });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id: activityId } = req.params;

    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers can delete activities' });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // For teachers, verify they own this activity
      if (role === 'teacher') {
        const activityCheck = await pool.query(
          'SELECT id FROM activities WHERE id = $1 AND teacher_id = $2',
          [activityId, userId]
        );
        if (activityCheck.rows.length === 0) {
          await pool.query('ROLLBACK');
          return res.status(403).json({ success: false, message: 'Not authorized to delete this activity' });
        }
      }

      // Delete activity_students relationships first (due to foreign key constraints)
      await pool.query('DELETE FROM activity_students WHERE activity_id = $1', [activityId]);

      // Delete the activity
      const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING *', [activityId]);

      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Activity not found' });
      }

      await pool.query('COMMIT');

      return res.json({ 
        success: true, 
        message: 'Activity deleted successfully',
        deletedActivity: result.rows[0]
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting activity:', error);
    return res.status(500).json({ success: false, message: 'Error deleting activity' });
  }
};

module.exports = { listActivities, createActivity, updateActivityStatus, getTeacherStudents, deleteActivity };



