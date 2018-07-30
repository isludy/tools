const fs = require('fs');

const reg = {
    comment: /\/\*[\s\S]*?\*\/|\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]/g,
    string: /`[^`]*?`|'.*[\\']*.*?'|".*[\\"]*.*?"/g,
    classObj: /(?<![\w\d$_])class\s+([\w$_][\w\d$_]*)(\s+[\w$_][\w\d$_]*)*\s*(?={)/g,
};

class Babel{
    constructor(code){
        this.code = code;
        this.reg = reg;
        this.increase = 0;
        this.storege = new Map();
    }
    /**
     * 必免干扰，暂存注释
     */
    markComment(){
        this.code = this.code.replace(this.reg.comment, $0=>{
            let key = '/*____'+(this.increase++)+'____*/';
            this.storege.set(key,$0);
            return key;
        });
    }
    /**
     * 必免干扰，暂标记、替换字符串的位置
     */
    markString(){
        this.code = this.code.replace(this.reg.string, $0=>{
            let key = '`____'+(this.increase++)+'____`';
            this.storege.set(key,$0);
            return key;
        });
    }
    babelClasses(){
        let arr = [], mc, str, index = 0;

        this.markComment();
        this.markString();

        str = this.code;

        while(mc = /(?<![\w\d$_])class\s+([\w$_][\w\d$_]*)(\s+[\w$_][\w\d$_]*)*\s*{[\s\S]+}/g.exec(str)){
            let count = 0,
                code = mc[0];

            for(let i=0, len=code.length; i<len; i++){
                if(code[i] === '{'){
                    count++;
                }
                if(code[i] === '}'){
                    count--;
                    if(count === 0){
                        let key = '___CLASS'+(index++)+'____';
                        arr.push({
                            key,
                            code: code.slice(0, i+1)
                        });
                        this.code = this.code.replace(code.slice(0, i+1), key);
                        str = code.slice(i+1);
                        break;
                    }
                }
            }
        }
        arr.forEach(item=>{
            let newClassStr = 'class '+item.key+item.code.slice(item.code.indexOf('{'));
            let classO = eval('('+newClassStr+')');
            console.log(classO);
        });
        return arr;
    }
    /**
     * 查找多层嵌套的成对符号的最外层里的内容。
     * @param str   输入的字符串
     * @param start 符号左半边
     * @param end   符号右半边
     * @return {Array}
     */
    static matchPair(str, start, end){
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
}

let c = fs.readFileSync('t.js', 'utf8');
let bab = new Babel(c);
// bab.markComment();
// bab.markString();
let arr = bab.babelClasses();
// console.log(bab.code);
// console.log(arr);
