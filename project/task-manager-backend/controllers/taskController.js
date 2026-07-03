const { getPool, sql } = require('../config/database');

// GET /api/tasks — get all tasks for logged in user
const getTasks = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT 
          TaskID as id,
          Title as title,
          Description as description,
          Priority as priority,
          Status as status,
          DueDate as dueDate,
          CreatedAt as createdAt,
          UserID as userId
        FROM Tasks 
        WHERE UserID = @userId 
        ORDER BY CreatedAt DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// GET /api/tasks/:id — get single task
const getTaskById = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('taskId', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT 
          TaskID as id,
          Title as title,
          Description as description,
          Priority as priority,
          Status as status,
          DueDate as dueDate,
          CreatedAt as createdAt,
          UserID as userId
        FROM Tasks 
        WHERE TaskID = @taskId AND UserID = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Get task error:', error.message);
    res.status(500).json({ message: 'Server error fetching task' });
  }
};

// POST /api/tasks — create new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const pool = getPool();
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('priority', sql.NVarChar, priority || 'Medium')
      .input('status', sql.NVarChar, status || 'Pending')
      .input('dueDate', sql.Date, dueDate || null)
      .input('userId', sql.Int, req.user.userId)
      .query(`
        INSERT INTO Tasks (Title, Description, Priority, Status, DueDate, UserID)
        OUTPUT 
          INSERTED.TaskID as id,
          INSERTED.Title as title,
          INSERTED.Description as description,
          INSERTED.Priority as priority,
          INSERTED.Status as status,
          INSERTED.DueDate as dueDate,
          INSERTED.CreatedAt as createdAt,
          INSERTED.UserID as userId
        VALUES (@title, @description, @priority, @status, @dueDate, @userId)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// PUT /api/tasks/:id — update task
const updateTask = async (req, res) => {
  try {
    const pool = getPool();

    // First confirm task belongs to this user AND get existing data
    const existing = await pool.request()
      .input('taskId', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT * FROM Tasks WHERE TaskID = @taskId AND UserID = @userId');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Merge existing data with incoming updates
    const current = existing.recordset[0];
    const title = req.body.title ?? current.Title;
    const description = req.body.description ?? current.Description;
    const priority = req.body.priority ?? current.Priority;
    const status = req.body.status ?? current.Status;
    const dueDate = req.body.dueDate ?? current.DueDate;

    const result = await pool.request()
      .input('taskId', sql.Int, req.params.id)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('priority', sql.NVarChar, priority || 'Medium')
      .input('status', sql.NVarChar, status || 'Pending')
      .input('dueDate', sql.Date, dueDate || null)
      .query(`
        UPDATE Tasks
        SET Title = @title,
            Description = @description,
            Priority = @priority,
            Status = @status,
            DueDate = @dueDate
        OUTPUT 
          INSERTED.TaskID as id,
          INSERTED.Title as title,
          INSERTED.Description as description,
          INSERTED.Priority as priority,
          INSERTED.Status as status,
          INSERTED.DueDate as dueDate,
          INSERTED.CreatedAt as createdAt,
          INSERTED.UserID as userId
        WHERE TaskID = @taskId
      `);

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// DELETE /api/tasks/:id — delete task
const deleteTask = async (req, res) => {
  try {
    const pool = getPool();

    // Confirm task belongs to this user
    const existing = await pool.request()
      .input('taskId', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT TaskID FROM Tasks WHERE TaskID = @taskId AND UserID = @userId');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await pool.request()
      .input('taskId', sql.Int, req.params.id)
      .query('DELETE FROM Tasks WHERE TaskID = @taskId');

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };