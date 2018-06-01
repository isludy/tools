const fs = require('fs');
const path = require('path');
const utils = require('./utils/utils');

function doItem(name, writePath){
    try{
        let data = fs.readFileSync(path.join(__dirname, name, 'main.js'));
        let fns = data.toString().match(/utils\.\w+/g);
        let fnMap = new Map();
        fns.forEach(v=>{
            let name = v.slice(6);
            if(utils[name]){
                fnMap.set(name, utils[name]);
            }
        });
        fs.writeFileSync(
            writePath,
            'const utils = {\n\t'+Array.from(fnMap.values()).join(',\n\t')+'\n};\n'+data.toString().replace(/(import\s+utils\s+from\s+\S+\s+)|((let|const)\s+utils\s*=\s*require\([^)]*?\)\s*[;]*\s+)/g,'')
        );
    }catch (err){
        throw err.message;
    }
}

module.exports = arr=>{
    let entry = {};
    arr.forEach(name=>{
        let writePath = path.join(__dirname, name, name+'.js');
        entry[path.join('/'+name, 'dist', name)] = writePath;
        doItem(name, writePath);
    });
    return entry;
};