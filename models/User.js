const Sequelize = require('sequelize');
const sq = require("./../sequelize");

module.exports =  sq.define('user', {
    username: {
        type: Sequelize.STRING,
    },
    email: {
        type: Sequelize.STRING,
    },
    password: {
        type: Sequelize.STRING,
    },
})