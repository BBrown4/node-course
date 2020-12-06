const mysql2 = require('mysql2');
const pool = mysql2.createPool({
  host: '44.231.114.205',
  user: 'admin',
  database: 'node-complete',
  password: 'qwerzaq1!',
});

module.exports = pool.promise();
