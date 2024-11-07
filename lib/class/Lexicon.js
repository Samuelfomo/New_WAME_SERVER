const path = require('path');
const paths = require('../../config/paths');

const Db = require(path.join(paths.MDL_DIR, 'Db'));
const LexiconModel = require(path.join(paths.MDL_DIR, 'LexiconModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Lexicon {
    constructor(reference, english, french, portable = false, id = null, guid = null) {
        this.id = id;
        this.guid = guid;
        this.reference = reference;
        this.english = english;
        this.french = french;
        this.portable = portable;
    }

    /**
     * Convert a JSON data to an instance of Lexicon
     * @param json
     * @returns {Lexicon}
     */
    static fromJson(json) {
        return new Lexicon(json.reference, json.english, json.french, json.portable, json.id, json.guid);
    }

    /**
     * Check for duplicate entry
     * @returns {Promise<void>}
     */
    async _duplicate() {
        const existingEntry = await LexiconModel.findOne({
            where: { reference: this.reference }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    /**
     * Convert to OpenCamelCase
     * @param str
     * @returns {string}
     */
    static toOpenCamelCase(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }

    /**
     * Save Lexicon data in the database
     * @returns {Promise<Lexicon>}
     */
    async save() {
        try {
            this.reference = Lexicon.toOpenCamelCase(this.english);
            await W.isOccur(!LexiconModel, 'LexiconModel is not properly initialized');

            let entry;
            if (!this.guid) {
                // Vérifiez les doublons lors de la création
                await this._duplicate();

                // Crée une nouvelle entrée
                const db = new Db();
                const guid = await db.generateGuid(LexiconModel, 6);

                entry = await LexiconModel.create({
                    guid: guid,
                    reference: this.reference,
                    english: this.english,
                    french: this.french,
                    portable: this.portable
                });
            } else {
                // Vérifiez si l'entrée existe pour la mise à jour
                const existingEntry = await LexiconModel.findOne({
                    where: { guid: this.guid }
                });

                await W.isOccur(!existingEntry, W.errorGuid);

                // Met à jour l'entrée existante
                await LexiconModel.update(
                    {
                        reference: this.reference,
                        english: this.english,
                        french: this.french,
                        portable: this.portable
                    },
                    {
                        where: { guid: this.guid }
                    }
                );

                // Récupère l'entrée mise à jour
                entry = await LexiconModel.findOne({
                    where: { guid: this.guid }
                });
            }

            return Lexicon.fromJson(entry.toJSON());
        } catch (error) {
            throw error;
        }
    }
    /**
     * List lexicon entries
     * @param portable
     * @returns {Promise<{reference, english, guid, french}[]|*[]>}
     */
    static async list(portable = false) {
        try {
            const entries = portable
                ? await LexiconModel.findAll({ where: { portable: 1 } })
                : await LexiconModel.findAll();

            if (!entries.length) return [];

            // Convert entries to Lexicon instances and then to JSON
            return entries.map(entry => Lexicon.fromJson(entry.toJSON()).toJson());
        } catch (error) {
            console.error('Error listing lexicon entries:', error);
            throw error;
        }
    }
    static async list_all() {
        try {
            const entries = await LexiconModel.findAll();
            if (!entries.length) return [];
            return entries.map(entry => Lexicon.fromJson(entry.toJSON()).toJson());
        } catch (error) {
            console.error('Error fetching lexicons:', error);
            throw error;
        }
    }

    /**
     * Delete lexicon entry from database
     * @returns {Promise<void>}
     */
    async delete() {
        try {
            await W.isOccur(!LexiconModel, 'LexiconModel is not properly initialized');

            // Check if entry exists
            const existingEntry = await LexiconModel.findOne({
                where: { guid: this.guid }
            });

            await W.isOccur(!existingEntry, W.errorGuid);

            // Delete the entry
            const deleted = await LexiconModel.destroy({
                where: { guid: this.guid }
            });

            // Double check if deletion was successful
            await W.isOccur(deleted !== 1, W.errorDeleted); // Vérification du nombre d'entrées supprimées
        } catch (error) {
            throw error;
        }
    }

    /**
     * Convert object to JSON
     * @returns {{reference, english, guid, french}}
     */
    toJson() {
        return {
            guid: this.guid,
            reference: this.reference,
            english: this.english,
            french: this.french,
            portable: this.portable
        };
    }
}

module.exports = { Lexicon };


// // const path = require('path');
// // const paths = require('../../config/paths');
// //
// // const Db = require(path.join(paths.MDL_DIR, 'Db'));
// // const LexiconModel = require(path.join(paths.MDL_DIR, 'LexiconModel'));
// // const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
// //
// // class Lexicon {
// //     constructor(reference, english, french, portable = false, id = null, guid = null) {
// //         this.id = id;
// //         this.guid = guid;
// //         this.reference = reference;
// //         this.portable = portable;
// //         this.english = english;
// //         this.french = french;
// //     }
// //
// //     // Convert english to OpenCamelCase
// //     toOpenCamelCase(str) {
// //         return str
// //             .toLowerCase()
// //             .split(' ')
// //             .map((word, index) =>
// //                 index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
// //             )
// //             .join('');
// //     }
// //
// //     async _duplicate() {
// //         const existingEntry = await LexiconModel.findOne({
// //             where: { reference: this.reference }
// //         });
// //         await W.isOccur(existingEntry, W.duplicate);
// //     }
// //
// //     async save() {
// //         try {
// //             this.reference = this.toOpenCamelCase(this.english);  // Set reference using OpenCamelCase
// //             await W.isOccur(!LexiconModel, 'LexiconModel is not properly initialized');
// //
// //             let entry;
// //             if (!this.guid || parseInt(this.guid) === 0) {
// //                 await this._duplicate();
// //
// //                 const db = new Db();
// //                 const guid = await db.generateGuid(LexiconModel, 6);
// //
// //                 entry = await LexiconModel.create({
// //                     guid: guid,
// //                     reference: this.reference,
// //                     english: this.english,
// //                     french: this.french,
// //                     portable: this.portable
// //                 });
// //             } else {
// //                 const existingEntry = await LexiconModel.findOne({
// //                     where: { guid: this.guid }
// //                 });
// //
// //                 await W.isOccur(!existingEntry, W.errorGuid);
// //
// //                 await LexiconModel.update(
// //                     {
// //                         reference: this.reference,
// //                         english: this.english,
// //                         french: this.french,
// //                         portable: this.portable
// //                     },
// //                     {
// //                         where: { guid: this.guid }
// //                     }
// //                 );
// //
// //                 entry = await LexiconModel.findOne({
// //                     where: { guid: this.guid }
// //                 });
// //             }
// //
// //             return Lexicon.fromJson(entry.toJSON());
// //         } catch (error) {
// //             throw error;
// //         }
// //     }
// //
// //     static fromJson(json) {
// //         return new Lexicon(json.reference, json.english, json.french, json.portable, json.id, json.guid);
// //     }
// //
// //     static async list(portable = false) {
// //         try {
// //             const entries = portable
// //                 ? await LexiconModel.findAll({ where: { portable: 1 } })
// //                 : await LexiconModel.findAll();
// //
// //             return entries.map(entry => Lexicon.fromJson(entry.toJSON()).toJson());
// //         } catch (error) {
// //             console.error('Error listing lexicon entries:', error);
// //             throw error;
// //         }
// //     }
// //
// //     static async list_all() {
// //         try {
// //             const entries = await LexiconModel.findAll();
// //             if (!entries.length) return [];
// //             return entries.map(entry => Lexicon.fromJson(entry.toJSON()).toJson());
// //         } catch (error) {
// //             console.error('Error fetching lexicons:', error);
// //             throw error;
// //         }
// //     }
// //
// //     async delete() {
// //         try {
// //             await W.isOccur(!LexiconModel, 'LexiconModel is not properly initialized');
// //
// //             const existingEntry = await LexiconModel.findOne({
// //                 where: { guid: this.guid }
// //             });
// //
// //             await W.isOccur(!existingEntry, W.errorGuid);
// //
// //             await LexiconModel.destroy({
// //                 where: { guid: this.guid }
// //             });
// //         } catch (error) {
// //             throw error;
// //         }
// //     }
// //
// //     toJson() {
// //         return {
// //             guid: this.guid,
// //             reference: this.reference,
// //             english: this.english,
// //             french: this.french,
// //             portable: this.portable
// //         };
// //     }
// // }
// //
// // module.exports = { Lexicon };
//
//
// const path = require('path');
// const paths = require('../../config/paths');
//
// const Db = require(path.join(paths.MDL_DIR, 'Db'));
// const LexiconModel = require(path.join(paths.MDL_DIR, 'LexiconModel'));
// const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
//
// class Lexicon {
//     constructor(reference, english, french, portable = false, id = null, guid = null) {
//         this.reference = reference;
//         this.id = id;
//         this.guid = guid;
//         this.portable = portable;
//         this.english = english;
//         this.french = french;
//     }
//
//     /**
//      * Convert a JSON data to an instance of Lexicon
//      * @param json
//      * @returns {Lexicon}
//      */
//     static fromJson(json) {
//         return new Lexicon( json.english, json.french, json.portable, json.id, json.guid);
//     }
//
//     /**
//      *
//      * @returns {Promise<void>}
//      */
//     async _duplicate(){
//         // Check the entry exists
//         const existingEntry = await LexiconModel.findOne({
//             where: { reference: this.reference }
//         });
//         await W.isOccur(existingEntry, W.duplicate);
//     }
//
//     /**
//      * convert to OpenCamelCase
//      * @param str
//      * @returns {string}
//      */
//     // toOpenCamelCase(str) {
//     //     return str
//     //         .toLowerCase()
//     //         .split(' ')
//     //         .map((word, index) =>
//     //             index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
//     //         )
//     //         .join('');
//     // }
//     /**
//      * convert to OpenCamelCase
//      * @param str
//      * @returns {string}
//      */
//      toOpenCamelCase(str) {
//         return str
//             .toLowerCase()
//             .split(' ')
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//             .join('_'); }
//
//     /**
//      * Save Lexicon data in database
//      * @returns {Promise<Lexicon>}
//      */
//     async save() {
//         try {
//             this.reference = this.toOpenCamelCase(this.english);
//             await W.isOccur(!LexiconModel, 'LexiconModel is not properly initialized');
//
//             let entry;
//             if (!this.guid || parseInt(this.guid) === 0) {
//                 // Check duplicate item
//                 await this._duplicate();
//
//                 // Create new entry
//                 const db = new Db();
//                 const guid = await db.generateGuid(LexiconModel, 6);
//
//                 entry = await LexiconModel.create({
//                     guid: guid,
//                     reference: this.reference,
//                     english: this.english,
//                     french: this.french,
//                     portable: this.portable
//                 });
//             } else {
//                 // Check the entry exists
//                 const existingEntry = await LexiconModel.findOne({
//                     where: { guid: this.guid }
//                 });
//
//                 await W.isOccur(!existingEntry, W.errorGuid);
//
//                 // Update existing entry
//                 await LexiconModel.update(
//                     {
//                         reference: this.reference,
//                         english: this.english,
//                         french: this.french,
//                         portable: this.portable
//                     },
//                     {
//                         where: {guid: this.guid}
//                     }
//                 );
//
//                 // Fetch the updated entry
//                 entry = await LexiconModel.findOne({
//                     where: {guid: this.guid}
//                 });
//             }
//
//             return Lexicon.fromJson(entry.toJSON());
//         } catch (error) {
//             throw error;
//         }
//     }
//
//     /**
//      * List of items
//      * @param portable
//      * @returns {Promise<{reference, english, guid, french}[]|*[]>}
//      */
//     static async list(portable = false) {
//         try {
//             const entries = portable
//                 ? await LexiconModel.findAll({where: {portable: 1}})
//                 : await LexiconModel.findAll();
//
//             if (!entries.length)
//                 return [];
//
//             // Convert entries to Lexicon instances and then to JSON
//             return entries.map(entry => Lexicon.fromJson(entry.toJSON()).toJson());
//         } catch (error) {
//             console.error('Error listing lexicon entries:', error);
//             throw error;
//         }
//     }
//
//     static async list_all() {
//         try {
//             const entries = await LexiconModel.findAll();
//             if (!entries.length) return [];
//             return entries.map(entry => Lexicon.fromJson(entry.toJSON()).toJson());
//         } catch (error) {
//             // Log the error for debugging purposes (si nécessaire)
//             console.error('Error fetching lexicons:', error);
//             throw error; // Vous pouvez également choisir de retourner une réponse par défaut ici
//         }
//     }
//
//
//
//     /**
//      * Delete lexicon entry from database
//      * @returns {Promise<void>}
//      */
//     async delete() {
//         try {
//             await W.isOccur(!LexiconModel, 'LexiconModel is not properly initialized');
//
//             // Check if entry exists
//             const existingEntry = await LexiconModel.findOne({
//                 where: { guid: this.guid }
//             });
//
//             await W.isOccur(!existingEntry, W.errorGuid);
//
//             // Delete the entry
//             const deleted = await LexiconModel.destroy({
//                 where: { guid: this.guid }
//             });
//
//             // Double check if deletion was successful
//             await W.isOccur(deleted === 0, W.errorDeleted);
//
//         } catch (error) {
//             throw error;
//         }
//     }
//
//     /**
//      * Convert object to JSON
//      * @returns {{reference, english, guid, french}}
//      */
//     toJson() {
//         return {
//             guid: this.guid,
//             reference: this.reference,
//             english: this.english,
//             french: this.french,
//             portable: this.portable
//         };
//     }
// }
//
// module.exports = {Lexicon};
//
