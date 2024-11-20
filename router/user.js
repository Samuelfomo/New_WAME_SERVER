const express = require('express');
const path = require('path');
const paths = require('../config/paths');

const {User} = require("../lib/class/User");
const R = require(path.join(paths.TOOL_DIR, 'Reply'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const router = express.Router();
