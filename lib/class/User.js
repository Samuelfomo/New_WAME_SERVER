const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const UserModel = require(path.join(paths.MDL_DIR, 'UserModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class User {

    constructor(username, password, contact_id = null, id = null, guid = null) {

        this.id = id;
        this.guid = guid;
        this.username = username;
        this.password = password;
        this.contact_id = contact_id;
    }

    static fromJson(json) {
        return new User(
            json.username, json.password, json.contact_id, json.id, json.guid);
    }

}