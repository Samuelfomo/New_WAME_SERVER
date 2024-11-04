class Db {
    constructor() {

        /**
         * Get one row in table using ID
         * @param table
         * @param id
         * @returns {Promise<*|null>}
         * @private
         */
        this._findOne = async function (table, id) {
            try {
                const entry = await table.findByPk(id);
                return entry ? entry.toJSON() : null;
            } catch (error) {
                console.error('Error retrieving entry:', error);
                throw error;
            }
        };

        /**
         * get table last autoincrement ID
         * @param table
         * @returns {Promise<*|number>}
         * @private
         */
        this._lastID = async function (table) {
            const lastRecord = await table.findOne({
                order: [['id', 'DESC']]
            });
            return lastRecord ? lastRecord.id : 0;
        };

        /**
         * Generate GUID from table
         * @param table
         * @param length
         * @param guid
         * @returns {Promise<*>}
         * @private
         */
        this._guid = async function (table, length = 6, guid = null) {
            if (guid === null) {
                guid = Math.pow(10, length - 1) + (await this._lastID(table) + 1);
            }
            const record = await table.findOne({
                where: {
                    guid: guid
                }
            });
            return record === null ? guid : await this._guid(table, length, guid + 1);
        };
    }

    /**
     * Generate GUID from table
     * @param table
     * @param length
     * @returns {Promise<*>}
     */
    async generateGuid(table, length) {
        return await this._guid(table, length);
    }
}
module.exports = Db;