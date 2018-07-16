var utils={
    dateTable: function(year, month, opt){
        var year = year || -1,
            month = month || -1;
        var utils = this,
            date = new Date(),
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
            for(var k in opt){
                if(o.hasOwnProperty(k)){
                    o[k] = opt[k];
                }
            }
        }
        opt = null;

        last = utils.lastDate(date.getFullYear(), date.getMonth()+1);

        table = {
            year: date.getFullYear(),
            month: date.getMonth()+1,
            weeks: utils.weeks.slice(0),
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
            table.weeks.push(utils.weeks[0]);
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
            table.dates.unshift(utils.datemat(o.format, startTime+total*86400000));

        table.prevDates = table.dates.splice(0, beforeDays);
        table.nextDates = table.dates.splice(-afterDays, afterDays);
        return table;
    },
    lastDate: function(year, month){
        var year = year || -1,
            month = month || -1;
        var date = new Date();

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
    weeks: ["日","一","二","三","四","五","六"],
    datemat: function(format, time){
        var format = format || 'Y/M/D H:I:S.C',
            time = time || -1;
        var date = new Date();

        if(typeof format === 'number'){
            time = format;
            format = 'Y/M/D H:I:S.C';
        }

        if(time !== -1)
            date.setTime(time);

        var o = {
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
        for(var len=format.length; len--;){
            var k = format[len];
            if(o[k]) format[len] = o[k];
        }
        return format.join('');
    },
    options: function(target, source, bool){
        var bool = bool || true;
        for(var k in source) {
            if (source.hasOwnProperty(k)) {
                if ((bool && target.hasOwnProperty(k)) || !bool) {
                    target[k] = source[k];
                }
            }
        }
        source = null;
        return target;
    }
};
var todayDate = new Date();
var Rdate = {
    todayDate,
    year: todayDate.getFullYear(),
    month: todayDate.getMonth()+1,
    date: todayDate.getDate(),
    day: todayDate.getDay(),
    time: todayDate.getTime(),
    hour: todayDate.getHours(),
    minute: todayDate.getMinutes(),
    second: todayDate.getSeconds(),
    ms: todayDate.getMilliseconds()
};

function Calendar(year, month, options){
        var args = arguments,
            len = args.length;

        this.mode = 0;
        this.format = 'Y/M/D';
        this.limitRow = true;

        for(; len--; ){
            if(typeof args[len] === 'object'){
                for(var k in args[len]){
                    if(this.hasOwnProperty(k)){
                        this[k] = args[len][k];
                    }
                }
                break;
            }
        }

        this.dateTable = utils.dateTable(year, month, options);
    }
Calendar.abc = function(){
        return 'abc';
    };
   
Calendar.toString = function(){
        return '{ [ class Calendar] }';
    };
   
Calendar.prototype = {
    weeker: function(options){
        var o = {
            container: 'div',
            className: 'calendar-weeker',
            item: 'span',
            itemClass: 'calendar-weeker-item',
            activeClass: 'calendar-weeker-active',
            activeMode: 0
        };
        utils.options(o, options);
        options = null;

        var activeIndex,
            strictActive = false,
            html = '',
            box;

        activeIndex = Rdate.day;

        if(this.mode === 1){
            activeIndex--;
            if(activeIndex < 0)
                activeIndex = 6;
        }

        if(o.activeMode === 1){
            if(Rdate.year === this.dateTable.year && Rdate.month === this.dateTable.month)
                strictActive = true;
        }else{
            strictActive = true;
        }

        this.dateTable.weeks.forEach(function(item, index){
            html += '<'+o.item+' class="'+o.itemClass+(strictActive && index === activeIndex ? ' '+o.activeClass : '')+'">'+item+'</'+o.item+'>';
        });

        box = document.createElement(o.container);
        box.className = o.className;
        box.innerHTML = html;
        return box;
    },
    dater: function(options){
        var o = {
            container: 'div',
            className: 'calendar-dater',
            item: 'span',
            itemClass: 'calendar-dater-item',
            itemPrevClass: 'calendar-dater-prev',
            itemNextClass: 'calendar-dater-next',
            activeClass: 'calendar-dater-active',
            activeMode: 1
        };
        utils.options(o, options);
        options = null;

        var dates = this.dateTable,
            isCur = dates.year === Rdate.year && dates.month === Rdate.month,
            active = '',
            html = '',
            box;

        dates.prevDates.forEach(function(item){
            html += '<'+o.item+' class="'+o.itemClass+' '+o.itemPrevClass+'">'+item+'</'+o.item+'>';
        });
        dates.dates.forEach(function(item, index){
            index++;
            if( (o.activeMode === 0 && index === Rdate.date) || (isCur && index === Rdate.date)){
                active = ' '+o.activeClass;
            }else{
                active = '';
            }
            html += '<'+o.item+' class="'+o.itemClass+active+'">'+item+'</'+o.item+'>';
        });
        dates.nextDates.forEach(function(item){
            html += '<'+o.item+' class="'+o.itemClass+' '+o.itemNextClass+'">'+item+'</'+o.item+'>';
        });

        box = document.createElement(o.container);
        box.className = o.className;
        box.innerHTML = html;

        return box;
    }
};


window.Calendar = Calendar;