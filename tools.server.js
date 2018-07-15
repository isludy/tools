const opn = require('opn');
const os = require('os');
const {exec} = require('child_process');

let lh,
    port = 3000;

try {
    let network = os.networkInterfaces();
    lh = network[Object.keys(network)[0]][1].address;
} catch (e) {
    lh = 'localhost';
}

exec('http-server -p '+port, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});

opn('http://' + lh + ':' + port);