const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const pool = getPool();

    // Check if email already exists
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UserID FROM Users WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .query('INSERT INTO Users (Name, Email, PasswordHash) OUTPUT INSERTED.UserID VALUES (@name, @email, @passwordHash)');

    const newUserId = result.recordset[0].UserID;

    // Create JWT token
    const token = jwt.sign(
      { userId: newUserId, email },
      process.env.JWT_SECRET || 'taskmanager_super_secret_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUserId, name, email }
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const pool = getPool();

    // Find user by email
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.recordset[0];

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.UserID, email: user.Email },
      process.env.JWT_SECRET || 'taskmanager_super_secret_2026',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.UserID, name: user.Name, email: user.Email }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords are required' });
    }

    const pool = getPool();

    // Get current user
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT * FROM Users WHERE UserID = @userId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.recordset[0];

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .input('passwordHash', sql.NVarChar, newHash)
      .query('UPDATE Users SET PasswordHash = @passwordHash WHERE UserID = @userId');

    res.status(200).json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

module.exports = { register, login, changePassword };
