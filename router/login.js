const express = require('express');
const path = require('path');
const paths = require('../config/paths');

const {Login} = require("../lib/class/Login");
const R = require(path.join(paths.TOOL_DIR, 'Reply'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        const {guid,pin, mobile} = req.body;
        if(!pin.trim() || !mobile.trim()){
            return R.handleError(res, W.errorMissingFields, 400);
        }
        const pinVerify = new Login(pin,null, null, null);
       const pindata = pinVerify.PIN_validator();
        if (!pindata) {
            return R.handleError(res, " Invalid_pin_code_check", 400);
        }

        const mobileVerify = new Login(null, mobile, null, null)
        const mobileData = mobileVerify.Mobile_validator();
        if (!mobileData) {
            return R.handleError(res, " Invalid_account_mobile_check", 400);
        }

        console.log('value mobile is :',mobile,'and value pin is :',pin)

        const login = new Login(pin, mobile, null, guid);
        const entry = await login.save();
        return R.response(true, entry.toJson(), res, 200);
    } catch (error) {
        return R.handleError(res, error.message, 500);
    }

});

// router.put('/check', async (req, res) => {
//     try {
//         const {mobile } = req.body;
//
//         if (!mobile) {
//             return R.handleError(res, W.errorMissingFields, 400);
//         }
//         console.log('mobile send is :',mobile);
//
//         const login = await Login.findLoginByMobile(mobile);
//         if (!login) {
//             return R.handleError(res, 'user_not_found', 404);
//         }
//         return R.response(true, login, res, 200);
//
//     } catch (error) {
//         return R.handleError(res, error.message, 500);
//     }
// });
//
// router.put('/log', async (req, res) => {
//     try {
//         const { pin, pinCheck } = req.body;
//
//         if (!pin || !pinCheck) {
//             return R.handleError(res, W.errorMissingFields, 400);
//         }
//         console.log('pinCheck send is :',pinCheck);
//
//         console.log('your pin code is :', pin);
//         const isPinValid = await Login.verifyPin(pin, pinCheck);
//         if (!isPinValid) {
//             return R.handleError(res, 'invalid_pin_code', 401);
//         }
//
//         return R.response(true, "Authentification_Successful", res, 200);
//
//     } catch (error) {
//         return R.handleError(res, error.message, 500);
//     }
// });

router.put('/auth', async (req, res) => {
    try {
        const { pin, mobile } = req.body;

        if (!pin || !mobile) {
            return R.handleError(res, W.errorMissingFields, 400);
        }
        console.log('mobile send is :',mobile);

        const login = await Login.findLoginByMobile(mobile);
        if (!login) {
            return R.handleError(res, 'user_not_found', 404);
        }

        console.log('your pin code is :', pin);
        const isPinValid = await Login.verifyPin(pin, login.pin);
        if (!isPinValid) {
            return R.handleError(res, 'invalid_pin_code', 401);
        }

        return R.response(true, login, res, 200);

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
