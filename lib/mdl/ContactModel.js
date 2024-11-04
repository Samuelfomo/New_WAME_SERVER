const {DataTypes} = require("sequelize");
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const ContactModel = sequelize.define('Contact', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Lexicon'
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-CONTACT-GUID',
            msg: 'The GUID of Contact must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    firstname: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: 'Firstname'
    },
    lastname: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: 'Lastname'
    },
    mobile: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: {
            name: 'UNIQUE-CONTACT-MOBILE-NUMBER',
            msg: 'The MOBILE NUMBER of Contact must be unique'
        },
        comment: 'Mobile'
    },
    whatsapp: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        unique: {
            name: 'UNIQUE-CONTACT-WHATSAPP-NUMBER',
            msg: 'The WHATSAPP NUMBER of Contact must be unique'
        },
        comment: 'WhatsApp'
    },
    email: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: 'Email'
    },
    gender: {
        type: DataTypes.ENUM('m', 'f', ''),
        allowNull: true,
        comment: 'Gender'
    },
    language: {
        type: DataTypes.ENUM('fr', 'en', ''),
        allowNull: true,
        comment: 'Language'
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Location'
    },
    qualified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: 'Qualified'
    }
}, {
    tableName: 'contact',
    timestamps: true,  // Enables timestamps
    createdAt: 'created',
    updatedAt: 'updated'
});

/**
 * Synchronises model with database
 * @returns {Promise<void>}
 */
ContactModel.initialize = async function () {
    try {
        await sequelize.authenticate();
        await ContactModel.sync({alter: true, force: W.development});
        console.log('ContactModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the ContactModel:', error);
        throw error;
    }
};

module.exports = ContactModel;