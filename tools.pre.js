const fs = require('fs');

const utils = require('./utils/utils');

function includeUtils() {
    let js = fs.readFileSync('./test/main.js'),
        map = new Map(),
        tilsArr;

    js = js.toString();

    tilsArr = js.match(/utils\.(\[["'][^"']*?["']]|[\d\w$_]+)/g);
    tilsArr.forEach(str=>{
        let name = str.slice(6);
        if(utils[name]){
            map.set(name, name+':function'+utils[name].toString().slice(name.length));
        }
    });

    js = js.replace(/import utils from[^;\n\r]*?[;\n\r]/g,'var utils = {\n'+Array.from(map.values()).join(',\n')+'\n}');

    fs.writeFileSync('./dist/index.js', js);
}

includeUtils();





