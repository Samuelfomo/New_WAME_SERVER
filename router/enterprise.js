const express = require('express');
const path = require('path');
const paths = require('../config/paths');

const {Enterprise} = require("../lib/class/Enterprise");
const R = require(path.join(paths.TOOL_DIR, 'Reply'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        const {guid,name, manager, email, password} = req.body;
        if(!name.trim() || !password.trim() || !email.trim()){
            return R.handleError(res, W.errorMissingFields, 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return R.handleError(res, "invalid_email_format", 400);
        }

        const enterprise = new Enterprise(name, manager.trim(), email, password, null, guid);
        const entry = await enterprise.save();
        return R.response(true, entry.toJson(), res, 200);
    } catch (error) {
        return R.handleError(res, error.message, 500);
    }

});


router.put('/list', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const enterprise = await Enterprise.findEnterpriseByEmail(email);

        if (!enterprise) {
            return R.handleError(res, 'user_not_found', 404);
        }

        const isPasswordValid = await Enterprise.verifyPassword(password, enterprise.password);
        if (!isPasswordValid) {
            return R.handleError(res, 'invalid_password', 401);
        }

        return R.response(true, enterprise, res, 200);

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
