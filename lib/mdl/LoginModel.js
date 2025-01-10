const {DataTypes} = require("sequelize");
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const LoginModel = sequelize.define('Login',{

        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: 'WAP'
        },
        guid: {
            type: DataTypes.BIGINT.UNSIGNED,
            unique: {
                name: 'UNIQUE-WAP-GUID',
                msg: 'The GUID of Enterprise must be unique'
            },
            allowNull: false,
            comment: 'GUID'
        },
        pin: {
            // type: DataTypes.SMALLINT.UNSIGNED,
            type: DataTypes.TEXT,
            allowNull: false,
            unique: {
                name: 'UNIQUE-WAP-PIN',
                msg: 'The PIN of WAP must be unique'
            },
            comment: 'PIN'
        },
        mobile: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique:{
                name:'UNIQUE-WAP-MOBILE',
                msg:'The MOBILE of WAP must be unique'
            },
            comment: 'MOBILE'
        }
    },
    {
        tableName: 'login',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated'
    });


LoginModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        await LoginModel.sync({alter: true, force: W.development});

        console.log('LoginModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the LoginModel:', error);
        throw error;
    }
};

module.exports = LoginModel;
