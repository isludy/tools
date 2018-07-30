const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const uglifyjs = require('uglify-js');

const {babel, matchPair, obj2Array} = require('./tools.babel');
const config = require('./tools.config');

const importReg = /import([\s\S]+?)from[\s\n\r]+['"]([^'"]+?)['"][;\s\r\n]*|(?:const|let|var)([\s\S]+?)=\s*require\s*\(\s*['"]([^'"]*?)['"]\s*\)[;\s\r\n]*/g;
const exportReg = /export\s+default\s+|(module\.)*exports\s*=/g;

const utils = utils2Map(path.join(__dirname, 'utils','utils.js'));
const utilsUsedMap = new Map();

let mode = process.argv[2],
    distPath = path.join(__dirname, (config.output || 'dist')),
    filename = (config.filename || 'tools')+(mode === 'build' ? '.min' : ''),
    indexPage = path.join(distPath, 'index.html'),
    templateReg = /<template[^>]*?>([\s\S]*?)<\/template>/g,
    styleReg = /<style[^>]*?>([\s\S]*?)<\/style>/g,
    scriptReg = /<script[^>]*?>([\s\S]*?)<\/script>/g,
    templates = [],
    styles = [],
    scripts = [];

function utils2Map(utilsPath){
    let map = new Map(),
        utilsObj = matchPair(fs.readFileSync(utilsPath, 'utf8'), '{', '}'),
        utilsArr = obj2Array(utilsObj[0]);

    utilsArr.forEach(item=>{
        item = item.trim();
        let match;
        if(match = /^(["']?)([\w\d$_]+)\1\s*[:(,}]/g.exec(item)){
            map.set(match[2], item);
        }
    });
    return map;
}
/**
 * 把用到的utils添加到map中
 * @param code
 */
function findUtilsFun(code){
        let reg = /utils(?:\.([\w$_][\w\d$_]*)|\[\s*(['"]?)(.*?)\2\s*])/g,
            matchKey;

    while(matchKey = reg.exec(code)){
        matchKey = matchKey[1] || matchKey[3];
        if(!utilsUsedMap.has(matchKey) && utils.has(matchKey) ) {
            utilsUsedMap.set(matchKey, utils.get(matchKey));
        }
    }
    utilsUsedMap.forEach(item=>{
        while (matchKey = reg.exec(item)){
            matchKey = matchKey[1] || matchKey[3];
            if(!utilsUsedMap.has(matchKey)){
                findUtilsFun(item);
            }
        }
    });
}

/**
 * 解析组件html模板，分别存到styles, templates, scripts数组
 * @param input
 * @param mount
 * @param name
 */
function paseDemo(input, mount, name){
    if(fs.existsSync(input)){
        let code = fs.readFileSync(input,'utf8'),
            arr;

        while(arr = styleReg.exec(code)){
            styles.push(arr[1]);
        }
        while(arr = templateReg.exec(code)){
            templates.push(arr[1]);
        }
        while(arr = scriptReg.exec(code)){
            scripts.push(arr[1].replace(/\(\s*this\s*\)/g, '('+mount+'.'+name+')'));
        }
    }
}

/**
 * 处理一个文件的结果生产
 * @param tool
 * @param output
 * @param outputCss
 * @param mount
 */
function makeOne(tool, output, outputCss, mount){
    let input = path.join(__dirname, 'src', tool, tool+'.js'),
        inputCss = path.join(__dirname, 'src', tool, tool+'.css'),
        commentStart = '/**----------- '+tool+' start line -------*/\n',
        commentEnd = '\n/**----------- '+tool+' end line -------*/\n\n',
        code,
        cssCode;
    if(fs.existsSync(input)){
        code = fs.readFileSync(input,'utf8');
        findUtilsFun(code);
        fs.appendFileSync(output,
            commentStart+
            babel('(function(){'+ code.replace(importReg, '').replace(exportReg, mount + '.' + tool + '=')+'})();')+
            commentEnd);
    }
    if(fs.existsSync(inputCss)){
        cssCode = fs.readFileSync(inputCss,'utf8');
        fs.appendFileSync(outputCss, commentStart+cssCode+commentEnd);
    }

    paseDemo(path.join(__dirname, 'src', tool, tool+'.html'), mount, tool);
}

/**
 * 生成index.html
 */
function makeIndexPage() {
    let ver = new Date().getTime(),
        html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <title>常用工具组件</title>
    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->
    <link rel="stylesheet" href="${filename}.css?ver=${ver}">
    <script src="${filename}.js?ver=${ver}"></script>
    <style>${styles.join('\n')}</style>
</head>
<body>
    ${templates.join('\n')}
    <script>
        ${scripts.join('\n')}
    </script>
</body>
</html>`;
    fs.writeFileSync(indexPage, html);
}

/**
 * 压缩css
 * @param outputCss
 */
function compressCss(outputCss) {
    let cssCode = fs.readFileSync(outputCss, 'utf8');
    fs.writeFileSync(outputCss,
        cssCode.replace(/[\r\n]+/g,'')
            .replace(/\/\*([\s\S]+?)\*\//g,'')
            .replace(/([{}:;,])\s+/g,'$1')
            .replace(/\s+/g,' ')
    );
}
/**
 * 生产输出
 */
function main(callback){
    if(Array.isArray(config.tools)){
        let mount = config.mount || 'Tools',
            output = path.join(distPath, filename+'.js'),
            outputCss = path.join(distPath, filename+'.css'),
            argv3 = process.argv[3],
            argv4 = process.argv[4],
            utilsOutput,
            code;

        if(!fs.existsSync(distPath)){
            childProcess.execSync('md '+distPath);
        }

        fs.writeFileSync(output, (mount === 'window' ? '' : 'window.'+mount+'={};\n'));
        fs.writeFileSync(outputCss, '');

        if(argv3 === 'utils'){
            utilsOutput = path.join(distPath, (config.outUtils && config.outUtils.filename ? config.outUtils.filename : 'utils'));
            if(config.outUtils && Array.isArray(config.outUtils.items)){
                config.outUtils.items.forEach(item=>{
                    if(!utilsUsedMap.has(item) && utils.has(item)){
                        utilsUsedMap.set(item, utils.get(item));
                    }
                });
            }else{
                if(argv4 && config.tools.includes(argv4)){
                    findUtilsFun(fs.readFileSync(path.join(__dirname, 'src', argv4, argv4+'.js'), 'utf8'));
                }else{
                    config.tools.forEach(tool=>{
                        findUtilsFun(fs.readFileSync(path.join(__dirname, 'src', tool, tool+'.js'), 'utf8'));
                    });
                }
            }
            code = babel('window.utils={'+Array.from(utilsUsedMap.values()).join(',')+'};');

        }else{
            if(argv3 && config.tools.includes(argv3)){
                makeOne(argv3, output, outputCss, mount);
            }else {
                config.tools.forEach(tool => {
                    makeOne(tool, output, outputCss, mount);
                });
            }
            code = babel('window.utils={'+Array.from(utilsUsedMap.values()).join(',')+'};') +'\n'+ fs.readFileSync(output,'utf8');
        }

        if(mode === 'build'){
            let uglify = uglifyjs.minify(code, {
                toplevel: true,
                ie8: true,
                mangle: true
            });
            if(uglify.error){
                console.log(uglify.error.message);
            }else{
                if(argv3 === 'utils'){
                    fs.writeFileSync(utilsOutput+'.min.js', uglify.code, 'utf8');
                }else{
                    fs.writeFileSync(output, uglify.code, 'utf8');
                }
            }
            compressCss(outputCss);
        }else{
            if(argv3 === 'utils'){
                fs.writeFileSync(utilsOutput+'.js', code, 'utf8');
            }else{
                fs.writeFileSync(output, code, 'utf8');
            }
        }

        makeIndexPage(output, outputCss);

        callback(null, output);
    }else{
        callback(new Error('config.tools 必须是数组'));
    }
}

main((err, output)=>{
    if(err){
        throw err;
    }
    console.log(output);
});
