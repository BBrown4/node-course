const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const Post = sequelize.define('post', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    creator: {
        type: Sequelize.JSON,
        allowNull: true
    }
});

module.exports = Post;