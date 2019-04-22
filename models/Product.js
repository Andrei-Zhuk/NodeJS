const Sequelize = require('sequelize');
const sq = require("./../sequelize");

module.exports =  sq.define('product', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    title: {
        type: Sequelize.STRING,
    },
    reviews: {
        type: Sequelize.ARRAY(Sequelize.STRING),
    },
})