const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const ContactModel = require(path.join(paths.MDL_DIR, 'ContactModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Contact {
    constructor(lastname, mobile, firstname = null, whatsapp = null, email = null, gender = null,
                language = null, location = null, qualified = false, id = null, guid = null) {
        this.id = id;
        this.guid = guid;
        this.firstname = firstname;
        this.lastname = lastname;
        this.mobile = mobile;
        this.whatsapp = whatsapp;
        this.email = email;
        this.gender = gender;
        this.language = language;
        this.location = location;
        this.qualified = qualified;
    }

    // Convert JSON data to Contact instance
    static fromJson(json) {
        return new Contact(
            json.lastname, json.mobile, json.firstname, json.whatsapp, json.email, json.gender,
            json.language , json.location , json.qualified, json.id , json.guid);
    }

    // Save Contact data in database
    async save() {
        try {
            let entry;
            if (!this.guid || parseInt(this.guid) === 0) {
                // Check for duplicate mobile number
                await this._checkDuplicate();

                // Generate new GUID
                const db = new Db();
                const guid = await db.generateGuid(ContactModel, 6);

                entry = await ContactModel.create({
                    guid: guid,
                    firstname: this.firstname,
                    lastname: this.lastname,
                    mobile: this.mobile,
                    whatsapp: this.whatsapp,
                    email: this.email,
                    gender: this.gender,
                    language: this.language,
                    location: this.location,
                    qualified: this.qualified,
                });
            } else {
                // Update existing entry
                entry = await ContactModel.update({
                    firstname: this.firstname,
                    lastname: this.lastname,
                    mobile: this.mobile,
                    whatsapp: this.whatsapp,
                    email: this.email,
                    gender: this.gender,
                    language: this.language,
                    location: this.location,
                    qualified: this.qualified,
                }, {
                    where: {guid: this.guid}
                });

                // Fetch the updated entry
                entry = await ContactModel.findOne({
                    where: {guid: this.guid}
                });
            }

            return Contact.fromJson(entry.toJSON());
        } catch (error) {
            throw error;
        }
    }

    // Check for duplicate mobile number
    async _checkDuplicate() {
        const existingEntry = await ContactModel.findOne({
            where: {mobile: this.mobile}
        });
        await W.isOccur(existingEntry, W.duplicate);  // Handle duplicate error
    }

    // Convert object to JSON
    toJson() {
        return {
            guid: this.guid,
            firstname: this.firstname,
            lastname: this.lastname,
            mobile: this.mobile,
            whatsapp: this.whatsapp,
            email: this.email,
            gender: this.gender,
            language: this.language,
            location: this.location,
            qualified: this.qualified,
        };
    }

    // List all contacts
    static async list() {
        try {
            const entries = await ContactModel.findAll();
            if (!entries.length) return [];
            return entries.map(entry => Contact.fromJson(entry.toJSON()).toJson());
        } catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    }


    static async list_elt(filters = {}) {
        try {
            // Applique les filters furnish dans la request 'findAll'
            const entries = await ContactModel.findAll({
                where: filters
            });

            if (!entries.length) return [];

            // Transform les entrées en format JSON
            return entries.map(entry => Contact.fromJson(entry.toJSON()).toJson());
        } catch (error) {
            throw error;
        }
    }


    // removes the contact so the id is given
     async delete() {
        try {
            await W.isOccur(!ContactModel, 'ContactModel is not properly initialized');

            // Check if entry exists
            const existingEntry = await ContactModel.findOne({
                where: { guid: this.guid }
            });

            await W.isOccur(!existingEntry, W.errorGuid);

            // Delete the entry
            const deleted = await ContactModel.destroy({
                where: { guid: this.guid }
            });

            // Double check if deletion was successful
            await W.isOccur(deleted === 0, W.errorDeleted);

        } catch (error) {
            throw error;
        }
    }


}


module.exports = {Contact};
