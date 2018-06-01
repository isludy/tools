const fs = require('fs');
const path = require('path');
const utils = require('./utils/utils');

const config = {
    entry: {},
    output: {
        filename: '[name].min.js',
        path: __dirname
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
        let writePath = path.join(__dirname, name, name+'.js');
        fs.writeFileSync(
            writePath,
            'const utils = {\n\t'+Array.from(fnMap.values()).join(',\n\t')+'\n};\n'+data.toString().replace(/(import\s+utils\s+from\s+\S+\s+)|((let|const)\s+utils\s*=\s*require\([^)]*?\)\s*[;]*\s+)/g,'')
        );
        config.entry['/'+name+'/dist/'+name] = writePath;
    }catch (err){
        throw err.message;
    }
}
factory('PageSlide');
factory('Player');

module.exports = config;

