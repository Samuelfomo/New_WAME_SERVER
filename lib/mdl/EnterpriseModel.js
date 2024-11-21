const {DataTypes} = require("sequelize");
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const EnterpriseModel = sequelize.define('User',{

    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ENTERPRISE'
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-ENTERPRISE-GUID',
            msg: 'The GUID of Enterprise must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: {
            name: 'UNIQUE-ENTERPRISE-EMAIL',
            msg: 'The EMAIL of Enterprise must be unique'
        },
        comment: 'EMAIL'
    },
    manager: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'MANAGER NAME'
    },
    email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: {
            name: 'UNIQUE-ENTERPRISE-EMAIL',
            msg: 'The EMAIL of Enterprise must be unique'
        },
        comment: 'EMAIL'
    },
    password: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: 'PASSWORD'
    },
},
    {
        tableName: 'enterprise',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated'
    });


 EnterpriseModel.initialize = async function () {
 try {
 // Checks database connection
 await sequelize.authenticate();

 await EnterpriseModel.sync({alter: true, force: W.development});

 console.log('EnterpriseModel synchronized successfully');
 } catch (error) {
 console.error('Unable to synchronize the EnterpriseModel:', error);
 throw error;
 }
 };

module.exports = EnterpriseModel;
