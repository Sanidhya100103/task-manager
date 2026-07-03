const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Sanidhya2003@',
  server: 'localhost',
  database: 'TaskManagerDB',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

let pool = null;

const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server successfully');
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return pool;
};

module.exports = { connectDB, getPool, sql };