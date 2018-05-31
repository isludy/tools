const fs = require('fs');
const path = require('path');
const utils = require('./utils/utils');

const config = {
    entry: {},
    output: {
        filename: '[name].min.js',
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },{
            test: /\.js$/,
            use: ['babel-loader']
        }]
    }
};
function factory(name){
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
            path.join(__dirname, name, name+'.js'),
            'const utils = {\n\t'+Array.from(fnMap.values()).join(',\n\t')+'\n};\n'+data.toString().replace(/(import\s+utils\s+from\s+\S+\s+)|((let|const)\s+utils\s*=\s*require\([^)]*?\)\s*[;]*\s+)/g,'')
        );
    }catch (err){
        throw err.message;
    }
}
factory('PageSlide');
/*
const utils = require('./utils/utils');
const PageSlide = require('./PageSlide/src/PageSlide');
const Player = require('./Player/src/Player');



function factory(obj, cfg){
    let code = [],
        name = obj.name,
        outils = obj.utils;
    for(let k in outils){
        if(utils.hasOwnProperty(k)){
            code.push(utils[k].toString());
        }
    }
    fs.writeFileSync('./'+name+'/factory/utils.js', 'export default {\n\t'+code.join(',\n\t')+'\n}');
    fs.writeFileSync('./'+name+'/factory/'+name+'.js', 'import utils from \'./utils\';\nwindow.'+name+'='+obj.fn.toString());
    cfg.entry[name] = __dirname+'/'+name+'/factory/'+name+'.js';
    cfg.output.path = __dirname + '/dist';
}

factory(PageSlide, config);
factory(Player, config);

module.exports = config;
*/
