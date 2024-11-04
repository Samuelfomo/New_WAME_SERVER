const express = require('express');
const path = require('path');
const paths = require('../config/paths');

const {Contact} = require("../lib/class/Contact");
const R = require(path.join(paths.TOOL_DIR, 'Reply'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        const {guid, lastname, mobile, whatsapp, location, language, gender, email, firstname, qualified} = req.body;
        if (!lastname || !mobile || typeof qualified === 'undefined' || typeof qualified !== 'boolean')
            return R.handleError(res, W.errorMissingFields, 400);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return R.handleError(res, "invalid_email_format", 400);
        }

        const contact = new Contact(lastname, mobile, firstname, whatsapp, email, gender, language, location, qualified, null, guid);
        const entry = await contact.save();
        return R.response(true, entry.toJson(), res, 200);
    } catch (error) {
        return R.handleError(res, error.message, 500)
    }
});

router.put('/list', async (req, res) => {
    try {
        const { qualified, mobile, guid, email } = req.body;

        if (!qualified && !mobile && !guid && !email) {
            return R.handleError(res, "missing_required_fields", 400);
        }
        if (typeof qualified !== 'undefined' && typeof qualified !== 'boolean') {
            return R.handleError(res, "qualified_must_be_Boolean", 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return R.handleError(res, "invalid_email_format", 400);
        }
        const phoneRegex = /^\d{9}$/;
        if (mobile && !phoneRegex.test(mobile)) {
            return R.handleError(res, "invalid_mobile_format", 400);
        }
        const filters = {};
        if (typeof qualified !== 'undefined') filters.qualified = qualified;
        if (mobile) filters.mobile = mobile;
        if (guid) filters.guid = guid;
        if (email) filters.email = email;

        const entries = await Contact.list_elt(filters);

        if (!entries.length) {
            return R.response(false, 'list_is_empty', res, 200);
        }
        return R.response(true, entries, res, 200);
    } catch (error) {
        return R.handleError(res, error.message, 500);
    }
});


// router.put('/list', async (req, res) => {
//     try {
//         const {qualified} = req.body;
//
//         if (typeof  qualified === 'undefined' || typeof qualified !=='boolean')
//             return R.handleError(res, "missing_required_fields", 400);
//
//         const entries = await Contact.list(qualified);
//         if (!entries.length)
//             return R.response(false, 'list_is_empty', res, 200);
//         return R.response(true, entries, res, 200);
//     } catch (error) {
//         return R.handleError(res, error.message, 500);
//     }
// });

router.put('/delete', async (req, res) => {
    try {
        const {guid} = req.body;
        if (!guid)
            return R.handleError(res, "missing_required_fields", 400);

        const contact = new Contact(null, null, null, null, null, null, null, null, false, null, guid);
        await contact.delete();
        return R.response(true, 'deleted_successfully', res, 200);
    } catch (error) {
        return R.handleError(res, error.message, 500);
    }
});

router.use((req, res) => {
    if (req.method === 'GET') {
        return R.handleError(res, `The method ${req.method} on ${req.url} is not defined`, 404);
    }
});

module.exports = router;