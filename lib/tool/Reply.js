
const express = require('express');

class Reply {

    /**
     * Handle successful JSON response
     * @param {Response} res - The response object
     * @param {Object} structure - The structure of the response data
     * @param {int} resCode - The response code
     */
    static handleResponse(res, structure, resCode = 200) {
        res.status(resCode).json({
            status: true,
            response: structure
        });
    }

    /**
     * Handle error JSON response
     * @param {Response} res - The response object
     * @param {string} errorMessage - The error message
     * @param {int} errorCode - The error code
     * @returns {*}
     */
    static handleError(res, errorMessage, errorCode = 400) {
        return res.status(errorCode).json({
            status: false,
            message: errorMessage
        });
    }

    /**
     * Universal response handler
     * @param {boolean} state - Whether the operation succeeded (true) or failed (false)
     * @param {Object|string} structure - The structure of the response data or error message
     * @param {Response} res - The response object
     * @param {int} resCode - The response code
     */
    static async response(state, structure, res, resCode) {
        if (state) {
            // Send successful response
            Reply.handleResponse(res, structure, resCode);
        } else {
            // Send error response
            Reply.handleError(res, structure, resCode);
        }
    }
}

module.exports = Reply;
