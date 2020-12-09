const Sequelize = require('sequelize');
const sequelize = new Sequelize('node-complete', 'admin', 'qwerzaq1!', {
  dialect: 'mysql',
  host: '44.231.114.205',
});

module.exports = sequelize;
