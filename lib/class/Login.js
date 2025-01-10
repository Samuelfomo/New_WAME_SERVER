const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const LoginModel = require(path.join(paths.MDL_DIR, 'LoginModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const { Op } = require('sequelize');

class Login {

    constructor(pin, mobile, id = null, guid = null) {

        this.id = id;
        this.guid = guid;
        this.pin = pin;
        this.mobile = mobile
    }

    static fromJson(json) {
        return new Login(
            json.pin, json.mobile, json.id, json.guid);
    }


    async _checkDuplicate() {
        const existingEntry = await LoginModel.findOne({
            where: {
                [Op.or]: [
                    { pin: this.pin },
                    { mobile: this.mobile }
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
            pin: this.pin,
            mobile: this.mobile
        };
    }

    /**
     *save entreprise
     * @returns {Promise<Enterprise>}
     */
    async save(){
        try {
            let entry;
            const scrypt = await this.hashPassword(this.pin);
            if (!this.guid || parseInt(this.guid) === 0)
            {
                await this._checkDuplicate();

                const db = new Db();
                const guid = await db.generateGuid(LoginModel, 6);

                entry = await LoginModel.create({
                    guid: guid,
                    pin: scrypt,
                    mobile: this.mobile
                });
            } else {
                entry = await LoginModel.update({
                    pin: scrypt,
                    mobile: this.mobile
                },{
                    where: {guid: this.guid}
                });

                entry = await LoginModel.findOne({
                    where: {guid: this.guid}
                });
            }

            return Login.fromJson(entry.toJSON());
        } catch (error){
            throw error;
        }
    }

    async hashPassword  (plainPin) {
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPin = await bcrypt.hash(plainPin, salt);
            console.log('pin hash:', hashedPin);
            return hashedPin;
        } catch (error) {
            console.error('pin hashing error:', error);
            throw error;
        }
    };

    static async verifyPin(plainPin, hashedPin) {
        try {
            const match = await bcrypt.compare(plainPin, hashedPin);
            if (match) {
                console.log('✅Code pin valide');
            } else {
                console.log('❌ Code pin invalide');
            }
            console.log("value return",match);
            return match;
        } catch (error) {
            console.error('Erreur lors de la vérification du Code pin :', error);
            throw error;
        }
    };

    static async findLoginByMobile(mobile) {
        try {
            const login = await LoginModel.findOne({ where: { mobile } });
            if (!login) return null;
            return Login.fromJson(login.toJSON()).toJson();
        } catch (error){
            throw error;
        }
    }


    static async list_elt(filters = {}) {
        try {
            const entries = await LoginModel.findAll({
                where: filters
            });
            if (!entries.length) return [];
            return entries.map(entry => Login.fromJson(entry.toJSON()).toJson());
        } catch (error) {
            throw error;
        }
    }

    async Mobile_validator(){
        if (!this.mobile){
            throw new Error('your account number is required')
        }
        const regexNumberCam = /^(\+237|237)?6(2[0]\d{6}|[5-9]\d{7})$/;
        const orangeRegex = /^(\+237|237)?6(5[5-9]|8[5-9]|9[0-9])\d{6}$/;
        const mtnRegex = /^(\+237|237)?6(5[0-4]|7[0-9]|8[0-4])\d{6}$/;

        const cleanedPhoneNumber = this.mobile.toString();
        if (!regexNumberCam.test(cleanedPhoneNumber) && !orangeRegex.test(cleanedPhoneNumber) && !mtnRegex.test(cleanedPhoneNumber)){
            console.log('Your account number is invalid.');
            throw new Error('Your account number is invalid.')
        }
    }

    async PIN_validator() {
        if (!this.pin) {
            throw new Error('Your PIN is required');
        }
        const pinRegex = /^\d{4}$/;
        const cleanedPIN = this.pin.toString()

        if (!pinRegex.test(cleanedPIN)) {
            console.log('Your PIN is invalid.');
            throw new Error('Your PIN is invalid. It must be exactly 4 digits.');
        }
    }

}

module.exports = {Login};