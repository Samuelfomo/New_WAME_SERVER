const {DataTypes} = require("sequelize");
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const SubscriberModel = sequelize.define('Subscriber', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment:'SUBSCRIBER ID'
    },
    token: {
        type: DataTypes.STRING,
        unique: {
            args: true,
            name: 'UNIQUE-SUBSCRIBER-TOKEN',
            msg: 'TOKEN ALREADY EXISTS'
        },
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: 'SUBSCRIBER TOKEN'
    },
    code: {
        type: DataTypes.INTEGER.UNSIGNED,
        unique: {
            args: true,
            name: 'UNIQUE-SUBSCRIBER-CODE',
            msg: 'CODE ALREADY EXISTS'
        },
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: 'SUBSCRIBER CODE'
    },
    mobile: {
        type: DataTypes.INTEGER.UNSIGNED,
        unique: {
            args: true,
            name: 'UNIQUE-SUBSCRIBER-MOBILE',
            msg: 'MOBILE ALREADY EXISTS'
        },
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: 'SUBSCRIBER MOBILE'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: 'SUBSCRIBER NAME'
    },
    formula:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        },
        comment:'SUBSCRIBER FORMULA'
    },
    bouquet: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: true
        },
        comment: 'SUBSCRIBER BOUQUET'
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        },
        comment: 'SUBSCRIBER EXPIRY DATE'
    }
}, {
        tableName: 'subscriber',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated'
    });
SubscriberModel.initialize = async function () {
    try {
        await sequelize.authenticate();

        await SubscriberModel.sync({alter: true, force: W.development});
        console.log('SubscriberModel synchronized successfully');
    }
    catch (error) {
        console.error('Unable to synchronize the SubscriberModel:', error);
        throw error;
    }
};

module.exports = SubscriberModel;
