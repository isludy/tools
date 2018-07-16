let todayDate = new Date();
module.exports = {
    todayDate,
    year: todayDate.getFullYear(),
    month: todayDate.getMonth()+1,
    date: todayDate.getDate(),
    day: todayDate.getDay(),
    time: todayDate.getTime(),
    hour: todayDate.getHours(),
    minute: todayDate.getMinutes(),
    second: todayDate.getSeconds(),
    ms: todayDate.getMilliseconds(),
    weeks: ['日','一','二','三','四','五','六'],
    /**
     * 格式化时间
     * @param format 格式字符串，ymdhisc几个字母，大写表示不满10（毫秒1000）时前位填充0。 字符任意组合与排序，中间也可以放任意符号。
     * @param time 时间戳
     * @return {string}
     */
    format(format = 'Y/M/D H:I:S.C', time = -1){
        let date = new Date();

        if(typeof format === 'number'){
            time = format;
            format = 'Y/M/D H:I:S.C';
        }

        if(time !== -1)
            date.setTime(time);

        let o = {
            Y: date.getFullYear(),
            m: date.getMonth()+1,
            d: date.getDate(),
            h: date.getHours(),
            i: date.getMinutes(),
            s: date.getSeconds(),
            c: date.getMilliseconds()
        };
        o.y = (o.Y+'').slice(2);
        o.M = (o.m+100+'').slice(1);
        o.D = (o.d+100+'').slice(1);
        o.H = (o.h+100+'').slice(1);
        o.I = (o.i+100+'').slice(1);
        o.S = (o.s+100+'').slice(1);
        o.C = (o.c+1000+'').slice(1);

        format = format.split('');
        for(let len=format.length; len--;){
            let k = format[len];
            if(o[k]) format[len] = o[k];
        }
        return format.join('');
    },
    /**
     * 获取某个月的最后一天的日期，这是为了方便获取当月的天数
     * @param year 年
     * @param month 月
     * @return {number}
     */
    lastDate(year = -1, month = -1) {
        let date = new Date();

        switch (arguments.length) {
            case 1:
                if(year > 0 && year <= 12)
                    date.setMonth(year);
                break;
            case 2:
                if(year >= 0)
                    date.setFullYear(year);
                if(month > 0 && month <= 12)
                    date.setMonth(month);
                break;
            default:
                date.setMonth(date.getMonth()+1);
        }

        date.setDate(0);

        return date.getDate();
    },
    /**
     * 获取某个月的日期，以数组形式返回
     * @param year 年份，如果输入为number时当作年份，但输入object时，则取当前年份和月份
     * @param month 月份，如果第一个参数输入是object，此参数被忽略
     * @param opt 可选参数，用于配置一些模式。格式如：
     *  {
	 *      mode: {number}  默认0，即周日在首，周六在末。 为1时，周一在首，周日在末
     *      format: {String} 规定输出的日期格式，默认"Y/M/D"
     *      limitRow: {boolean} 日期布局，默认true, 即保持7x6格布局，如2月份如果不满6行，则会取前一个月或后一个月的天数来补齐整行。为false时，不保持7x6格布局，例如2月份天数少，可能只有5行，即输出7x5天的日期。
     *  }
     * @return {object}
     */
    dateTable(year=-1, month=-1, opt) {
        let date = new Date(),
            last,
            beforeDays,
            afterDays,
            startTime,
            total,
            table,
            o = {
                format: 'Y/M/D',
                mode: 0,
                limitRow: true
            };

        if(typeof year === 'object'){
            opt = year;
        }else{
            if(year !== -1)
                date.setFullYear(year);
            if(month !== -1)
                date.setMonth(month-1);
        }
        if(typeof opt === 'object'){
            for(let k in opt){
                if(o.hasOwnProperty(k)){
                    o[k] = opt[k];
                }
            }
        }
        opt = null;

        last = this.lastDate(date.getFullYear(), date.getMonth()+1);

        table = {
            year: date.getFullYear(),
            month: date.getMonth()+1,
            weeks: this.weeks.slice(0),
            dates: [],
            prevDates: [],
            nextDates: []
        };

        date.setDate(1);
        beforeDays = date.getDay();
        date.setTime(date.getTime() - beforeDays * 86400000);
        startTime = date.getTime();
        afterDays = (beforeDays + last) % 7;
        afterDays = afterDays ? 7-afterDays : 0;
        total = beforeDays + last + afterDays;

        //mode: 0 或 默认，周日在首，周六在末
        //mode: 1，周一在首，周日在末
        if(o.mode === 1){
            //前月填充部分大于0时，整个列队前移1位后，起始时间戳加1天，前部减1天，尾部加1天，如果原本是6天，加1天之后为7天，刚好一行，删除它，total减7
            if(beforeDays){
                startTime += 86400000;
                beforeDays--;
                if(afterDays < 6)
                    afterDays++;
                else{
                    afterDays = 0;
                    total -= 7;
                }
            }else{
                //前月填充为0时，整个列队前移1位后，前面需要六个填补，起始时间戳往前6天，尾部如果大于等于6，则减去6天，
                //前后抵销total不变，否则尾部加一天，加上前部添的6天，total加7天，其实就相当添了一行。
                startTime -= 6*86400000;
                beforeDays += 6;
                if(afterDays >= 6)
                    afterDays -= 6;
                else{
                    afterDays++;
                    total += 7;
                }
            }
            table.weeks.splice(0, 1);
            table.weeks.push(this.weeks[0]);
        }
        //limitRow: 默认true, 保持7x6格布局
        //limitRow: false, 不保持7x6格布局
        if(o.limitRow && total < 42){
            //如果天数只有四行，比如2月份有可能，则分别添加到前、后各一行
            if(42 - total >= 14){
                startTime -= 7 * 86400000;
                beforeDays += 7;
                afterDays += 7;
            }else{
                //比较前后部分填充的量，补一行在较少部分
                if(beforeDays < afterDays){
                    startTime -= 7 * 86400000;
                    beforeDays += 7;
                }else{
                    afterDays += 7;
                }
            }
            total = 42;
        }

        for(; total--;)
            table.dates.unshift(this.format(o.format, startTime+total*86400000));

        table.prevDates = table.dates.splice(0, beforeDays);
        table.nextDates = table.dates.splice(-afterDays, afterDays);
        return table;
    },
    /**
     * 用于获取两个时间之间的日期，用于移动端竖向列表。比如滚动列表，不断加载新的日期会用到
     * @param start 起始时间或向前天数。 比如基于第二个参数的时期向前取5天，则输入5即可
     * @param end 终点时间或向后天数，同上。
     * @param format 可选参数，规定时间格式。默认'Y/M/D'
     */
    dateBetween(start, end, format='Y/M/D'){
        let list = [];
        if(typeof start === 'string' && typeof end === 'string'){
            start = new Date(start).getTime();
            end = new Date(end).getTime()+86400000;
        }else if(typeof start === 'number' && typeof end === 'string'){
            end = new Date(end).getTime()+86400000;
            start = end - start*86400000;
        }else if(typeof start === 'string' && typeof end === 'number'){
            start = new Date(start).getTime();
            end = start + end*86400000;
        }else{
            return list;
        }
        for(; start < end; start += 86400000){
            list.push(this.format(format,start));
        }
        return list;
    }
};