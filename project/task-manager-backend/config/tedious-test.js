const { Connection } = require('tedious');

const config = {
  server: 'localhost',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'Sanidhya2003@'
    }
  },
  options: {
    database: 'master',
    encrypt: true,
    trustServerCertificate: true,
    port: 1433
  }
};

const connection = new Connection(config);

connection.on('connect', err => {
  if (err) {
    console.error(err);
  } else {
    console.log('✅ Connected!');
    connection.close();
  }
});

connection.connect();