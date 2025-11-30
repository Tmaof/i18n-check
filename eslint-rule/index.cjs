const baseRule = require('./base.cjs');
const importRule = require('./import.cjs');

module.exports = { ...baseRule, ...importRule };
