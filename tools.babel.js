const beautify = require('js-beautify').js_beautify;

/**
 * 清除注释
 * @param code
 * @return {string | * | void}
 */
function clearComment(code){
    return code.replace(/(\/\*[\s\S]*?\*\/)|(\/\/[\s\S]*?[\r\n])/g,'');
}
/**
 * 执行转换的主函数
 * @param code
 * @param opt
 * @return {string}
 */
function babel(code, opt) {
        //去掉注释
    code = clearComment(code)
        //处理class
        .replace(/class\s+([\w$_][\w\d$_]*?)\s*({[\s\S]+})/g, function ($0, $1, $2) {
            let totalLen = $2.length, classLen;
            $2 = matchPair($2, '{', '}')[0];
            classLen = $2.length;
            return babelClass('class '+$1+$2) + (totalLen === classLen ? '' : $0.substr(classLen - totalLen));
        })
        //转换模板字符
        .replace(/`([^`]*?)`/g,function ($0, $1) {
            return '\''+$1.replace(/[\r\n]+/g,'\\\n').replace(/\${([^}])}/g,'\'+$1+\'')+'\'';
        })
        //处理const和let
        .replace(/(const|let)\s+/g,'var ')
        //处理省略function定义的函数
        .replace(/(?<!function)([{=\s,]+)([\w$_][\w\d$_]*)(\s*\([^()]*?\)\s*)(?={)/g, ($0, $1, $2, $3)=>{
            if(!/^(for|if|while|switch|function)$/.test($2.trim())){
                return $1+$2+': function'+$3;
            }
            return $0;
        })
        //处理箭头函数
        .replace(/(?:\(([^()]*?)\)|([\w$_][\w\d$_]*))\s*=>\s*(?={)/g, ($0, $1, $2)=>{
            $1 = $1 || $2;
            return 'function('+($1 || '')+')';
        })
        //处理写在形参里的默认值
        .replace(/(?<=function)\s*\(\s*([^()]*?=[^()]*?)\s*\)\s*{/g, ($0,$1)=>{
            let defs = '';
            $1 = $1.replace(/\s+/g,'').replace(/([\w$_][\w\d$_]*?)=([\s\S]*?)(,|$)/g, ($10, $11, $12)=>{
                defs += $11 + ' = ' + $11 + ' || ' + $12+';';
                return $11+',';
            }).replace(/,$/g,'');
            return '('+$1+'){'+defs;
        });
    code = beautify(babelObj(code), opt).split(/[\r\n]/);
    code = code.filter(item=>{
        return item.trim();
    });
    return code.join('\n');
}

/**
 * 查找多层嵌套的成对符号的最外层里的内容。
 * @param str   输入的字符串
 * @param start 符号左半边
 * @param end   符号右半边
 * @return {Array}
 */
function matchPair(str, start, end){
    str = clearComment(str);
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
            if(n === 1) starts.push(arr.index);
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
 * 处理 class Name{
 *     constructor(){}
 *     fn(){}
 *     static staticFn(){}
 * }
 * 为 array[ 'constructor(){}', 'fn(){}', 'static staticFn(){}' ]
 * @param code
 * @returns {Array}
 */
function class2Array(code){
    code = clearComment(code);
    let split = [],
        count = 0,
        pre = 0,
        start,
        end,
        len;

    code = code.trim().slice(code.indexOf('{')+1);
    len = code.length;

    for(let i=0; i<len; i++){
        if(code[i] === ' ') continue;
        if(!start && code[i] === '{'){
            start = code[i];
            end = '}';
        }
        if(code[i] === start){
            count++;
        }
        if(code[i] === end){
            count--;
        }
        if(count === 0 && start){
            split.push(code.slice(pre, i+1).trim());
            pre = i+1;
            start = '';
        }
    }
    return split;
}
/**
 * 利用 class2Array 处理
 * class Name{
 *     constructor(){}
 *     fn(){}
 *     static staticFn(){}
 * }
 * 为
 * function Name(){}
 * Name.staticFn = function(){}
 * Name.prototype = {
 *     fn: function(){}
 * }
 * @param code
 * @return {string}
 */
function babelClass(code) {
    code = clearComment(code);
    let reg = /^class\s+([\w$_][\w\d$_]*?)\s*({[\s\S]+})$/g,
        api = [],
        constructorName,
        match,
        classArr,
        fn;
    if(match = reg.exec(code.trim())){
        constructorName = match[1];
        classArr = class2Array(match[2]);
        classArr.forEach((item, k)=>{
            item = item.trim();
            if(/^constructor\s*\(/.test(item)){
                classArr[k] = 'function '+constructorName + item.slice('constructor'.length);
            }else if(fn = /^(static\s*([\w$_][\w\d$_]*?)\s*)\(/.exec(item)){
                classArr[k] = '\n'+constructorName + '.'+fn[2] + ' = function'+item.slice(fn[1].length)+';';
            }else if(fn = /^([\w$_][\w\d$_]*?)\s*\(/.exec(item)){
                api.push(fn[1]+': function'+item.slice(fn[1].length));
                classArr[k] = '';
            }
        });
    }
    return  classArr.join('') + constructorName+ '.prototype = {'+api.join(',')+'};';
}
/**
 * 处理 object{ item1, item2, ... } 为 array[ 'item1: item1', 'item2: item', ...]
 * @param code
 * @returns {Array}
 */
function obj2Array(code){
    code = clearComment(code);
    let split = [],
        count = 0,
        pre = 0,
        start,
        end,
        len,
        isLast;

    code = code.trim().slice(1,-1);
    len = code.length;

    for(let i=0; i<len; i++){
        if(!start && (code[i] === '{' || code[i] === '(' || code[i] === '[')){
            start = code[i];
            switch (start){
                case '{': end = '}'; break;
                case '[': end = ']'; break;
                case '(': end = ')'; break;
            }
        }
        if(code[i] === start){
            count++;
        }
        if(code[i] === end){
            count--;
        }
        if(count === 0){
            start = '';
        }
        isLast = i === len-1;
        if(!start && (code[i] === ',' || isLast) ){
            let v = code.slice(pre, (isLast ? i+1 : i)).trim();
            if(/^[\w$_][\w\d$_]*$/.test(v)){
                v = v + ': '+v;
            }
            split.push(v);
            pre = i+1;
        }
    }
    return split;
}

/**
 * 利用obj2Array递归，深度处理所有object{ item } 为 object{ item: item }
 * @param code
 * @returns {string}
 */
function babelObj(code){
    code = clearComment(code);
    let reg = /(?<=[(,=]\s*){[\s\S]+}/,
        result = [],
        match,
        obj;
    while(match = reg.exec(code)){
        result.push(code.slice(0, match.index+1));
        obj = matchPair(match[0], '{', '}')[0];
        let after = code.slice(match.index + obj.length);

        obj = obj2Array(obj);
        code = obj.join(',')+'}'+after;
    }
    result.push(code);
    return result.join('');
}


module.exports = {babel, matchPair, babelClass, obj2Array, class2Array};