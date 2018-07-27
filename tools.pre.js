const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const uglifyjs = require('uglify-js');

// const utils = require('./utils/utils');
const config = require('./tools.config');

const importReg = /import([\s\S]+?)from[\s\n\r]+['"]([^'"]+?)['"][;\s\r\n]*|(?:const|let|var)([\s\S]+?)=\s*require\s*\(\s*['"]([^'"]*?)['"]\s*\)[;\s\r\n]*/g;
const exportReg = /export\s+default\s+|(module\.)*exports\s*=/g;
const utilsReg = /utils\.([\w\d_$]+)/g;

const map = new Map();


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

/**
 * 把用到的utils添加到map中
 * @param code
 */
function findUtilsFun(code){
    let arr, name;
    arr = code.match(utilsReg);
    if(arr){
        arr.forEach(val=>{
            name = val.slice(6);
            if(utils[name] && !map.has(name)){
                let tmpCode;
                if(typeof utils[name] === 'function'){
                    tmpCode = name + ': function'+utils[name].toString().slice(name.length);
                }else if(typeof utils[name] === 'object'){
                    tmpCode = name + ': '+JSON.stringify(utils[name]);
                }
                map.set(name, tmpCode);
                findUtilsFun(tmpCode);
            }
        });
    }
}

/**
 * 简单通过正则的把ES6转为ES5
 * @param code
 * @return {string}
 */
function babel(code) {
        //转换声明的关键字
    return code.replace(/(const|let)\s+/g,'var ')
        //转换箭头函数
        .replace(/(\(\s*[^()]*?\s*\))\s*=>\s*{/g,'function$1{').replace(/([\w\d_$]+?)\s*=>\s*{/g,'function($1){')
        //转换代默认值的参数
        .replace(/function\s*\(\s*([^)]+?)\s*\)\s*{/g, function ($0,$1) {
            if($1){
                let vars = [];

                $1 = $1.replace(/([\w\d_$]+?)\s*=\s*(.*?)(,|$)/g, function ($10, $11, $12,$13) {
                    vars.push($11+' = '+$11+' || '+($12 || '\'\''));
                    return $11+($13 || '');
                });

                return 'function('+$1+'){'+(vars.length ? ('\n        '+vars.join(';\n            ')+';') : '');
            }
        })
        //转换class构建类
        .replace(/class\s+([^{]+?)\s*({[\s\S]+})/g,function ($0, $1, $2) {
            let len1 = $2.length, len2, classMod;
            $2 = matchPair($2, '{', '}');
            $2 = $2[0];
            len2 = $2.length;

            $2 = $2.replace('constructor', '_constructor');
            classMod = eval('(class '+$1+$2+')');
            return babelClass(classMod) + (len1 === len2 ? '' : $0.substr(len1, len2));
        })
        //转换模板字符
        .replace(/`([^`]*?)`/g,function ($0, $1) {
            return '\''+$1.replace(/[\r\n]+/g,'\\\n').replace(/\${([^}])}/g,'\'+$1+\'')+'\'';
        });
}

fs.writeFileSync('t.js',babel(fs.readFileSync('./utils/utils.js', 'utf8')));
// console.log(cc);
/**
 * 把获取class构建的es5代码（如果class有自定义静态方法toString，必须把constructor构造器替换为普通方法_contructor）
 * @param mod 类对象
 * @return {string}
 */
function babelClass(mod) {
    let api = Object.getOwnPropertyNames(mod.prototype),
        staticApi = Object.getOwnPropertyNames(mod),
        classCode;

    classCode = 'function ' + mod.name + mod.prototype._constructor.toString().slice('_constructor'.length);

    staticApi.forEach(staticFn=>{
        if(!/^(prototype|length|name)$/g.test(staticFn)){
            classCode += '\n'+mod.name + '.' + staticFn + ' = function' + mod[staticFn].toString().slice(staticFn.length)+';';
        }
    });

    classCode += '\n'+mod.name+'.prototype = {';
    api.forEach(fnName=>{
        if(!/^_?constructor$/.test(fnName)){
            classCode += '\n    '+fnName+': function'+mod.prototype[fnName].toString().slice(fnName.length)+',';
        }
    });
    return  classCode.slice(0,-1)+'\n};\n';
}

/**
 * 查找多层嵌套的成对符号的最外层。
 * @param str   输入的字符串
 * @param start 符号左半边
 * @param end   符号右半边
 * @return {Array}
 */
function matchPair(str, start, end){
    let reg = new RegExp('['+start+']|['+end+']','g'),
        wait = true,
        starts = [],
        ends = [],
        n = 0,
        arr;
    while (arr = reg.exec(str)){
        if(wait && arr[0] === end) continue;
        if(arr[0] === start){
            wait = false;
            n++;
            if(n === 1){
                starts.push(arr.index);
            }
        }else{
            n--;
            if(n === 0){
                wait = true;
                ends.push(arr.index);
            }
        }
    }

    arr = [];

    starts.forEach((v, i)=>{
        if(i < ends.length){
            arr.push(str.slice(v, ends[i]+end.length));
        }
    });

    return arr;
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
            '(function(){\n'+ babel(code).replace(importReg,'').replace(exportReg, mount + '.' + tool + '=')+'\n})();\n'+
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
function production(callback){
    if(Array.isArray(config.tools)){
        let mount = config.mount || 'Tools',
            output = path.join(distPath, filename+'.js'),
            outputCss = path.join(distPath, filename+'.css'),
            argv3 = process.argv[3],
            code;

        if(!fs.existsSync(distPath)){
            childProcess.execSync('md '+distPath);
        }

        fs.writeFileSync(output,(mount === 'window' ? '' : 'window.'+mount+'={};\n'));
        fs.writeFileSync(outputCss, '');

        if(argv3 && config.tools.includes(argv3)){
            makeOne(argv3, output, outputCss, mount);
        }else{
            config.tools.forEach(tool=>{
                makeOne(tool, output, outputCss, mount);
            });
        }

        code = babel('window.utils={\n    '+Array.from(map.values()).join(',\n    ')+'\n};\n') + fs.readFileSync(output,'utf8');

        if(mode === 'build'){
            let uglify = uglifyjs.minify(code, {
                toplevel: true,
                ie8: true,
                mangle: true
            });
            if(uglify.error){
                console.log(uglify.error.message);
            }else{
                fs.writeFileSync(output, uglify.code, 'utf8');
            }

            compressCss(outputCss);
        }else{
            fs.writeFileSync(output, code);
        }

        makeIndexPage(output, outputCss);

        callback(null, output);
    }else{
        callback(new Error('config.tools 必须是数组'));
    }
}

// production((err, output)=>{
//     if(err){
//         throw err;
//     }
//     console.log(output);
// });
