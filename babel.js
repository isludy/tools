const fs = require('fs');

const reg = {
    comment: /\/\*[\s\S]*?\*\/|\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]/g,
    string: /(['"`])[^\1]*?\1/g,
    classObj: /(?<![\w$])class\s+([a-zA-Z$_][\w$]*)(\s+[a-zA-Z$_][\w$]*)*(?=\s*{)/g,
};

class Babel{
    constructor(code){
        this.code = code;
        this.reg = reg;
        this.increase = 0;
        this.storege = new Map();
    }

    /**
     * 替换并暂存被替换部分，以防干扰一些其他的处理
     * @param regName
     * @param prefix
     * @param postfix
     */
    replaceStorage(regName, prefix, postfix){
        this.code = this.code.replace(this.reg[regName], $0=>{
            let key = prefix+(this.increase++)+postfix;
            this.storege.set(key,$0);
            return key;
        });
    }
    static saveToStorage(code, test, prefix, postfix){
        let map = new Map(), id = 0, key;
        code = code.replace(test, $0=>{
            key = prefix+(id++)+postfix;
            map.set(key,$0);
            return key;
        });
        return {
            code,
            storage: map
        }
    }
    /**
     * 转换所有class（类）对象
     */
    babelClasses(){
        let _this = this,
            reg = /(?<![\w$])class\s+([a-zA-Z$_][\w$]*)(?:\s+extends\s+([a-zA-Z$_][\w$]*))*\s*{[\s\S]+}/,
            arr = [],
            mc,
            str,
            index = 0,
            mark,
            count,
            code,
            start;

        _this.replaceStorage('comment', '/*____', '____*/');
        _this.replaceStorage('string', '`____', '____`');

        str = _this.code;

        while(mc = reg.exec(str)){
            count = 0;
            code = mc[0];
            start = 0;

            for(let i=0, len=code.length; i<len; i++){
                if(code[i] === '{'){
                    count++;
                }
                if(count === 0){
                    start++;
                }
                if(code[i] === '}'){
                    count--;
                    if(count === 0){
                        mark = '____CLASS'+(index++)+'____';
                        arr.push({
                            mark,
                            extend: mc[2],
                            name: mc[1],
                            code: code.slice(start, i+1)
                        });
                        _this.code = _this.code.replace(code.slice(0, i+1), mark);
                        str = code.slice(i+1);
                        break;
                    }
                }
            }
        }
        let exclude = /^(name|length|prototype)$/,
            newClassStr, classObj, staticApi, api;
        arr.forEach(item=>{
            newClassStr = 'class '+item.name+item.code.replace(/(?<![\w$])constructor(\s*\([^)]*?\))/, '_constructor$1')
                .replace(/(?<![\w$])(super\([^)]*?\))/,'/*____$1*/');

            classObj = eval('('+newClassStr+')');
            staticApi = Object.getOwnPropertyNames(classObj);
            api = Object.getOwnPropertyNames(classObj.prototype);

            str = 'function '+item.name+classObj.prototype['_constructor'].toString().slice(12);

            staticApi.forEach(staticFn=>{
                if(!exclude.test(staticFn)) {
                    str += item.name + '.' + staticFn + ' = function' + classObj[staticFn].toString().slice(staticFn.length)+';';
                }
            });

            let tmpArr = [];
            api.forEach(fn=>{
                if(fn !== '_constructor' && fn !== 'constructor'){
                    tmpArr.push(fn+': function'+classObj.prototype[fn].toString().slice(fn.length));
                }
            });
            str += item.name + '.prototype = {' + tmpArr.join(',') + '};';

            if(item.extend) {
                str = str.replace(/\/\*____super\(([^)]*?)\)\*\//, ($0, $1) => {
                    return item.extend + '.call(this' + ($1.trim() ? ',' + $1 : '') + ')';
                });
                str += 'var ' + item.name + 'PROTO = Object.create(' + item.extend + '.prototype);\n' +
                    'for(var proto in ' + item.name + 'PROTO){\n' +
                    item.name + '.prototype[proto] = ' + item.name + 'PROTO[proto];\n' +
                    '}\n' +
                    item.name + 'PROTO = null;';
            }
            _this.code = _this.code.replace(item.mark, str);
        });
    }

    /**
     * 处理 object{ item, fn(){}, ... } 为 array[ 'item: item', 'item: function(){}', ...]
     * 返回数组给下一步处理
     * @param code
     * @returns {Array}
     */
    static obj2Array(code){
        let regKeyValue = /(?<=(\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]|\/\*[\s\S]*?\*\/[\r\n\u2028\u2029]*|^)\s*)[a-zA-Z$_][\w$]*$/,
            regFunc = /(?<=(\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]|\/\*[\s\S]*?\*\/[\r\n\u2028\u2029]*|^)\s*)[a-zA-Z$_][\w$]*(?=\s*\([^()]*?\))/,
            split = [],
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
            }else if(code[i] === end){
                count--;
            }
            if(count === 0){
                start = '';
            }
            isLast = i === len-1;
            if(!start && (code[i] === ',' || isLast) ){
                let v = code.slice(pre, (isLast ? i+1 : i)).trim(),
                    match;
                if(match = regKeyValue.exec(v)){
                    v = v + ': ' + match[0];
                }else if(match = regFunc.exec(v)){
                    v = v.slice(0, match.index)+match[0] + ': function' + v.slice(match.index+match[0].length);
                }
                split.push(v);
                pre = i+1;
            }
        }
        return split;
    }

    /**
     * 转换object
     */
    babelObj(){
        let _this = this,
            reg = /(?<!\)\s*|=>\s*){[\s\S]+}/,
            str,
            mc,
            count = 0,
            code,
            objCode;

        str = _this.code;

        while(mc = reg.exec(str)){
            count = 0;
            code = mc[0];

            for(let i=0, len=code.length; i<len; i++){
                if(code[i] === '{'){
                    count++;
                }else if(code[i] === '}'){
                    count--;
                    if(count === 0){
                        objCode = code.slice(0, i+1);
                        let objArr = Babel.obj2Array(objCode);
                        _this.code = _this.code.replace(objCode, '{\n'+objArr.join(',\n')+'\n}');
                        str = code.slice(1);
                        break;
                    }
                }
            }
        }
    }
    static getPairOf(code, start, end, bool=false){
        let len = code.length,
            i = 0,
            count = 0,
            pre = 0,
            index = 0,
            space = 0;
        for(; i<len; i++){
            index = bool ? (len-i): i;
            if(code[index] === start){
                count++;
                if(count === 1){
                    pre = index;
                    space = i;
                }
            }else if(code[index] === end){
                count--;
                if(count === 0){
                    return {
                        space,
                        code : bool ? code.slice(len-i, pre+1) : code.slice(pre, i+1)
                    };
                }
            }

        }
    }
    static getArgs(code){
        let reg = /(?<=(\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]|\/\*[\s\S]*?\*\/[\r\n\u2028\u2029]*|^)\s*)([a-zA-Z$_][\w$]*)(?:\s*=\s*(.*?)$|$)/,
            chars = code.slice(1,-1),
            len = chars.length,
            i = 0,
            count = 0,
            start,
            end,
            sliceStart,
            arr = [],
            args = [],
            map = [];

        if(!/[\[({]/.test(chars)){
            args = chars.split(',');
        }else{
            for(; i<len; i++){
                if(!start && (chars[i] === '{' || chars[i] === '(' || chars[i] === '[')){
                    start = chars[i];
                    sliceStart = i;
                    switch (start){
                        case '[': end = ']';break;
                        case '{': end = '}';break;
                        case '(': end = ')';break;
                    }
                }
                if(chars[i] === start){
                    count++;
                }else if(chars[i] === end){
                    count--;
                    if(count === 0){
                        arr.push({
                            start: sliceStart,
                            end: i+1,
                            code: chars.slice(sliceStart, i+1)
                        });
                        sliceStart = i+1;
                        start = end = null;
                    }
                }
            }
            arr.forEach((item, k)=>{
                if(k===0){
                    args.push(chars.slice(0, item.start), '____ARGS'+k+'____');
                }else{
                    args.push(chars.slice(arr[k-1].end, item.start), '____ARGS'+k+'____');
                }
            });
            args = args.join('').split(',');
        }

        args.forEach(item=>{
            let m = reg.exec(item);
            if(m){
                map.push({
                    comment: m[1] || '',
                    key: m[2],
                    value: (m[3] ? m[3].replace(/____ARGS(\d+)____/g, function ($0,$1) {
                        return arr[$1].code;
                    }) : undefined)
                });
            }
        });
        return map;
    }
    babelArrowFn(){
        let _this = this,
            reg = /=>(?=\s*{)/g,
            mc,
            arg;
        while(mc = reg.exec(_this.code)){
            arg = Babel.getPairOf(_this.code.slice(0, mc.index), ')', '(', true);
            _this.code = _this.code.slice(0, mc.index-arg.code.length-arg.space+1)+'function'+arg.code+_this.code.slice(mc.index+2);
        }
    }
    babelFunParams(){
        let _this = this,
            reg = /(?<=(?:function(?:\s+[a-zA-Z$_][\w$]*)*\s*))\(/g,
            mc,
            arg,
            args;
        while(mc = reg.exec(_this.code)){
            arg = Babel.getPairOf(_this.code.slice(mc.index), '(', ')');
            if(!/^\(\s*\)$/.test(arg.code)){
                args = Babel.getArgs(arg.code);
                console.log(args);
            }
        }
    }
}


let c = fs.readFileSync('t.js', 'utf8');
let bab = new Babel(c);
bab.babelClasses();
bab.babelObj();
bab.babelArrowFn();
bab.babelFunParams();
// console.log(bab.code);
