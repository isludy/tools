const path = require('path');
const os = require('os');

const config = require('./tools.config');

let www = path.join(__dirname, (config.output || 'dist')),
    port = 3000,
    lh;

try {
    let network = os.networkInterfaces();
    lh = network[Object.keys(network)[0]][1].address;
} catch (e) {
    lh = 'localhost';
}

module.exports = {www, port, lh};