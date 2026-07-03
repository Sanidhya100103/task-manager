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

(async () => {
  try {
    console.log("Connecting...");
    const pool = await sql.connect(config);

    console.log("Connected!");

    const result = await pool.request().query("SELECT @@VERSION AS Version");
    console.log(result.recordset);

    await pool.close();
  } catch (err) {
    console.error(err);
  }
})();