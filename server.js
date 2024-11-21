const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const host = '192.168.100.103';
const os = require('os');
const path = require('path');
const paths = require('./config/paths');

app.use(cors());
app.use(express.json());

/**
 * Initialize project tables
 */
const LexiconModel = require(path.join(paths.MDL_DIR, 'LexiconModel'));
const ContactModel = require(path.join(paths.MDL_DIR, 'ContactModel'));
const EnterpriseModel = require(path.join(paths.MDL_DIR, 'EnterpriseModel'));

async function main() {
    try {
        await LexiconModel.initialize();
        await ContactModel.initialize();
        await EnterpriseModel.initialize();

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

/**
 * APP INITIALIZATION
 */
main().then(r => {

    /**
     * API routes configs
     * @type {Router | {}}
     */
    const lexiconRoute = require(path.join(paths.ROUTER, 'lexicon'));
    const contactRoute = require(path.join(paths.ROUTER, 'contact'));
    const enterpriseRoute = require(path.join(paths.ROUTER, 'enterprise'));

    app.use("/lexicon", lexiconRoute);
    app.use("/contact", contactRoute);
    app.use("/enterprise", enterpriseRoute);
});

/**
 * Listen app
 */
app.listen(port, os.hostname, async() => {
    console.log(`Server running on ${os.hostname()}:${port}`)
});