const {DataTypes} = require("sequelize");
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const UserModel = sequelize.define('User',{

    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        privateKey: true,
        autoIncrement: true,
        comment: 'User'
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-USER-GUID',
            msg: 'The GUID of User must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    username: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: {
            name: 'UNIQUE-USER-USERNAME',
            msg: 'The USERNAME of User must be unique'
        },
        comment: 'USERNAME'
    },
    password: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: {
            name: 'UNIQUE-USER-PASSWORD',
            msg: 'The PASSWORD of User must be unique'
        },
        comment: 'PASSWORD'
    },
    contact_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'Contact',
            key: 'id'
        },
        comment: 'CONTACT_ID'
    }
},
    {
        tableName: 'user',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated'
    });

UserModel.associate = (models) => {
    UserModel.belongsTo(models.Contact, {
        foreignKey: 'contact_id',
        as: 'contact'
    });
};


 UserModel.initialize = async function () {
 try {
 // Checks database connection
 await sequelize.authenticate();

 await UserModel.sync({alter: true, force: W.development});

 console.log('UserModel synchronized successfully');
 } catch (error) {
 console.error('Unable to synchronize the UserModel:', error);
 throw error;
 }
 };

module.exports = UserModel;
