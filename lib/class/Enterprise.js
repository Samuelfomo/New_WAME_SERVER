const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const EnterpriseModel = require(path.join(paths.MDL_DIR, 'EnterpriseModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const { Op } = require('sequelize');

class Enterprise {

    constructor(name, manager, email, password, id = null, guid = null) {

        this.id = id;
        this.guid = guid;
        this.name = name;
        this.manager = manager;
        this.email = email;
        this.password = password;
    }

    static fromJson(json) {
        return new Enterprise(
            json.name, json.manager, json.email, json.password, json.id, json.guid);
    }

     // Check for duplicate mobile number
     // async _checkDuplicate() {
     // const existingEntry = await EnterpriseModel.findOne({
     // where: {
     //     name: this.name,
     // }
     // });
     // await W.isOccur(existingEntry, W.duplicate);  // Handle duplicate error
     // }

    async _checkDuplicate() {
        const existingEntry = await EnterpriseModel.findOne({
            where: {
                [Op.or]: [
                    { name: this.name },
                    { email: this.email },
                    { password: this.password }
                ]
            }
        });

        if (existingEntry) {
                await W.isOccur(true, W.duplicate);
        }
    }

     // convert to Json
     toJson() {
        return{
            guid: this.guid,
            name: this.name,
            manager: this.manager,
            email: this.email,
            password: this.password
        };
     }

    /**
     *save entreprise
     * @returns {Promise<Enterprise>}
     */
    async save(){
        try {
            let entry;
            const scrypt = await this.hashPassword(this.password);
            if (!this.guid || parseInt(this.guid) === 0)
            {
                await this._checkDuplicate();

                const db = new Db();
                const guid = await db.generateGuid(EnterpriseModel, 6);

                entry = await EnterpriseModel.create({
                    guid: guid,
                    name: this.name,
                    manager: this.manager,
                    email: this.email,
                    password: scrypt
                    });
            } else {
                entry = await EnterpriseModel.update({
                    name: this.name,
                    manager: this.manager,
                    email: this.email,
                    password: scrypt
                },{
                    where: {guid: this.guid}
                    });

                entry = await EnterpriseModel.findOne({
                    where: {guid: this.guid}
                });
            }

            return Enterprise.fromJson(entry.toJSON());
        } catch (error){
            throw error;
        }
    }

    async hashPassword  (plainPassword) {
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);
            console.log('Password hash:', hashedPassword);
            return hashedPassword;
        } catch (error) {
            console.error('Password hashing error:', error);
            throw error;
        }
    };

    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            const match = await bcrypt.compare(plainPassword, hashedPassword);
            if (match) {
                console.log('✅ Mot de passe valide');
            } else {
                console.log('❌ Mot de passe invalide');
            }
            return match;
        } catch (error) {
            console.error('Erreur lors de la vérification du mot de passe :', error);
            throw error;
        }
    };

    static async findEnterpriseByEmail(email) {
        try {
            const enterprise = await EnterpriseModel.findOne({ where: { email } });
            if (!enterprise) return null;
            return Enterprise.fromJson(enterprise.toJSON()).toJson();
        } catch (error){
            throw error;
        }
    }


    static async list_elt(filters = {}) {
        try {
            const entries = await EnterpriseModel.findAll({
                where: filters
            });
            if (!entries.length) return [];
            return entries.map(entry => Enterprise.fromJson(entry.toJSON()).toJson());
        } catch (error) {
            throw error;
        }
    }

}

module.exports = {Enterprise};