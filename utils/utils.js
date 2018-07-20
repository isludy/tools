module.exports = {
    indexOf(arr, item){
        if(arr.indexOf){
            return arr.indexOf(item);
        }else{
            for(let i=0, l=arr.length; i<l; i++)
                if(arr[i] === item) return i;
            return -1;
        }
    },
    elsByClass(cls, context){
        context = context || document;
       if(context.getElementsByClassName){
           return context.getElementsByClassName(cls);
       }else if(context.querySelector){
           return context.querySelectorAll('.'+cls);
       }else{
           let utils = this,
               els = context.getElementsByTagName('*'),
               len = els.length,
               i = 0,
               doms = [];

           for(; i<len; i++){
               if(utils.hasClass(els[i], cls)){
                   doms.push(els[i]);
               }
           }
           return doms;
       }
    },
    isTouch(){
        return 'ontouchstart' in document;
    },
    addClass(el, cls){
        if(el.classList){
            el.classList.add(cls);
        }else{
            let utils = this,
                list = el.className.split(/\s+/);
            if(utils.indexOf(list, cls) === -1){
                list.push(cls);
            }
            el.className = list.join(' ');
        }
    },
    removeClass(el, cls){
        if(el.classList){
            el.classList.remove(cls);
        }else{
            let utils = this,
                list = el.className.split(/\s+/),
                index;
            if((index = utils.indexOf(list, cls)) !== -1){
                list.splice(index, 1);
            }
            el.className = list.join(' ');
        }
    },
    hasClass(el, cls){
        if(el.classList){
            return el.classList.contains(cls);
        }else{
            let utils = this,
                list = el.className.split(/\s+/);
            return utils.indexOf(list, cls) !== -1;
        }
    },
    toggleClass(el, cls){
        if(el.classList){
            el.classList.toggle(cls);
        }else{
            let utils = this,
                list = el.className.split(/\s+/),
                index;

            if((index = utils.indexOf(list, cls)) !== -1){
                list.splice(index, 1);
            }else{
                list.push(cls);
            }
            el.className = list.join(' ');
        }
    },
    addEvent(el, evt, fn, capture=false){
        if(window.addEventListener){
            el.addEventListener(evt, fn, capture);
        }else if(window.attachEvent){
            el.attachEvent('on'+evt, fn);
        }
    },
    removeEvent(el, evt, fn){
        if(window.removeEventListener){
            el.removeEventListener(evt, fn);
        }else{
            el.detachEvent('on'+evt, fn);
        }
    },
    wheel(elem, callback, useCapture){
        let prefix = "", _addEventListener, support;
        // detect event model
        if ( window.addEventListener ) {
            _addEventListener = "addEventListener";
        } else {
            _addEventListener = "attachEvent";
            prefix = "on";
        }

        // detect available wheel event
        support = "onwheel" in document ? "wheel" :
            document.onmousewheel !== undefined ? "mousewheel" : // Webkit / IE
                "DOMMouseScroll"; // firefox

        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support === "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }


        function _addWheelListener( elem, eventName, callback, useCapture ) {
            elem[ _addEventListener ]( prefix + eventName, support === "wheel" ? callback : function( originalEvent ) {
                !originalEvent && ( originalEvent = window.event );

                // create a normalized event object
                let event = {
                    // keep a ref to the original event object
                    originalEvent: originalEvent,
                    target: originalEvent.target || originalEvent.srcElement,
                    type: "wheel",
                    deltaMode: originalEvent.type === "MozMousePixelScroll" ? 0 : 1,
                    deltaX: 0,
                    deltaZ: 0,
                    preventDefault: function() {
                        originalEvent.preventDefault ?
                            originalEvent.preventDefault() :
                            originalEvent.returnValue = false;
                    }
                };

                // calculate deltaY (and deltaX) according to the event
                if ( support === "mousewheel" ) {
                    event.deltaY = - 1/40 * originalEvent.wheelDelta;
                    // Webkit also support wheelDeltaX
                    originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
                } else {
                    event.deltaY = originalEvent.detail;
                }

                // it's time to fire the callback
                return callback( event );

            }, useCapture || false );
        }
    },
    toBottom(el, deviation) {
        if(!el)
            return false;
        return el.scrollHeight - el.offsetHeight - el.scrollTop <= deviation;
    },
    toTop(el, deviation){
        if(!el)
            return false;
        return el.scrollTop <= deviation;
    },
    setTransition(el, v) {
        el.style.webkitTransition =
            el.style.mozTransition =
                el.style.msTransition =
                    el.style.oTransition =
                        el.style.transition = v;
    },
    setTransformY(el, v, bool){
        if('transform' in document.documentElement.style){
            el.style.webkitTransform =
                el.style.mozTransform =
                    el.style.msTransform =
                        el.style.oTransform =
                            el.style.transform = 'translateY('+ (bool ? v+'px' : '-'+v+'00%') + ')';
        }else{
            el.style.top = bool ? v+'px' : '-'+v+'00%';
        }
    },
    fullscreen(el){
        if(el.requestFullscreen) {
            el.requestFullscreen();
        } else if(el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if(el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        }else if(el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    },
    exitFullscreen(){
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.webkitCancelFullScreen){
            document.webkitCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.msExitFullscreen){
            document.msExitFullscreen();
        }
    },
    isFullscreen() {
        return document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || false;
    },
    calced(node, attr){
        if(node && node.nodeType === 1 && window.getComputedStyle){
            return window.getComputedStyle(node)[attr];
        }else{
            return 0;
        }
    },
    parent(el, cls, context = document.documentElement){
        while (el !== context){
            if(!el) return false;
            if(el.className && (el.className.split(/\s+/).indexOf(cls) !== -1)){
                return el;
            }else{
                el = el.parentNode;
            }
        }
    },
    eventGroup(els, fn1, fn2, fn3){
        let utils = this,
            events = utils.isTouch() ? ['touchstart','touchmove','touchend'] : ['mousedown','mousemove','mouseup'],
            el1, el2, el3;
        if(!els || !fn1 || !fn2 || !fn3) return;
        el1 = els[0];
        el2 = els[1] || el1 || document;
        el3 = els[2] || document;
        utils.addEvent(el1, events[0], startFn);
        function startFn(e){
            fn1.call(this, e);
            utils.addEvent(el2, events[1], moveFn);
            utils.addEvent(el3, events[2], endFn);
        }
        function moveFn(e){
            fn2.call(this, e);
        }
        function endFn(e){
            utils.removeEvent(el2, events[1], moveFn);
            utils.removeEvent(el3, events[2], endFn);
            fn3.call(this, e);
        }
    },
    options(target, source, bool = true){
        for(let k in source) {
            if (source.hasOwnProperty(k)) {
                if ((bool && target.hasOwnProperty(k)) || !bool) {
                    target[k] = source[k];
                }
            }
        }
        source = null;
        return target;
    },
    contains(target, context){
        if(context.contains){
            return context.contains(target);
        }else{
            if(target === context){
                return true;
            }else{
                let children = context.getElementsByTagName('*'),
                    len = children.length,
                    i = 0;
                for(; i<len; i++){
                    if(target === children[i]) return true;
                }
            }
        }
        return false;
    },
    each(obj, fn){
        let len = obj.length, callback;
        if(len){
            for(let i=0; i<len; i++){
                callback = fn.call(obj[i], obj[i], i);
                if(callback === 'continue') continue;
                if(callback !== undefined) return callback;
                if(callback === 'break') break;
            }
        }else{
            for(let i in obj){
                callback = fn.call(obj[i], obj[i], i);
                if(callback === 'continue') continue;
                if(callback !== undefined) return callback;
                if(callback === 'break') break;
            }
        }
    },
    pageSlide(options){
        let utils = this,
            o = {
            view: '.page-view',
            wrapper: '.page-wrapper',
            slide: '.page-slide',
            scrollbar: 'page-scrollbar',
            deviation: 5,
            distance: 100,
            fireDistance: 0,
            duration: 1000,
            beforeSlide: null,
            afterSlide: null
        };
        if(typeof options === 'object')
            for(let k in options)
                if(o.hasOwnProperty(k))
                    o[k] = options[k];
        options = null;

        let view = document.querySelector(o.view);

        function main(){
            let wrapper = view.querySelector(o.wrapper),
                slides = view.querySelectorAll(o.slide),
                maxIndex = slides.length - 1,
                viewH = view.offsetHeight,
                timer = null,
                scrollEl = null,
                allowTurn = true,
                start = 0,
                delta = 0,
                page = 0;

            let style = document.createElement('style');
            style.innerText = o.view+'{position:relative;overflow:hidden;}'+
                o.wrapper+'{height:100%;position:relative;}'+
                o.slide+'{height:100%;}';
            document.head.appendChild(style);

            utils.eventGroup([view, view, document], function(e){
                if(e.button === 2) return false;
                start = utils.isTouch() ? e.touches[0].clientY : e.clientY;
                delta = 0;

                scrollEl = utils.parent(e.target, o.scrollbar, wrapper);
                utils.setTransition(wrapper, 'none');
            }, function(e){
                delta = (utils.isTouch() ? e.touches[0].clientY : e.clientY) - start;
                if(!scrollEl || (delta<0 &&  utils.toBottom(scrollEl, o.deviation)) || (delta>0 &&  utils.toTop(scrollEl, o.deviation))){
                    if(!o.fireDistance || Math.abs(delta) > o.fireDistance){
                        utils.setTransformY(wrapper, delta-page*viewH, true);
                        allowTurn = true;
                    }else{
                        allowTurn = false;
                    }
                }else{
                    allowTurn = false;
                }
            }, function(){
                utils.setTransition(wrapper, 'all ' + o.duration/1000 + 's');
                if( allowTurn && (Math.abs(delta) > o.distance) && ( (delta > 0 && page > 0) || (delta < 0 && page < maxIndex) ) ){
                    if(o.beforeSlide) o.beforeSlide(page, slides);
                    if(delta > 0) {
                        page--;
                    }else{
                        page++;
                    }
                    timer = setTimeout(function(){
                        clearTimeout(timer);
                        if(o.afterSlide) o.afterSlide(page, slides);
                    }, o.duration);
                }
                utils.setTransformY(wrapper, page);
                scrollEl = null;
            });
        }
        if(view) main();
    },
    time(timemat){
        let arr = timemat.split(/[:：]+/);
        if(arr.length === 3){
            return parseInt(arr[0])*3600 + parseInt(arr[1])*60 + parseFloat(arr[2]);
        }else{
            return parseInt(arr[0])*60 + parseFloat(arr[1]);
        }
    },
    timemat(time, type=0){
        let h = !type ? 0 : Math.floor(time/3600),
            i = Math.floor((time - h*3600) / 60),
            s = Math.floor(time - h*3600 - i*60);

        h = h < 10 ? '0' + h : h;
        i = i < 10 ? '0' + i : i;
        s = s < 10 ? '0' + s : s;
        return (!type ? '' : (h + ':')) + i + ':' + s;
    },
    weeks: ['日','一','二','三','四','五','六'],
    /**
     * 格式化时间
     * @param format 格式字符串，ymdhisc几个字母，大写表示不满10（毫秒1000）时前位填充0。 字符任意组合与排序，中间也可以放任意符号。
     * @param time 时间戳
     * @return {string}
     */
    datemat(format = 'Y/M/D H:I:S.C', time = -1){
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
        let utils = this,
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
            for(let k in opt){
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
    /**
     * 用于获取两个时间之间的日期，用于移动端竖向列表。比如滚动列表，不断加载新的日期会用到
     * @param start 起始时间或向前天数。 比如基于第二个参数的时期向前取5天，则输入5即可
     * @param end 终点时间或向后天数，同上。
     * @param format 可选参数，规定时间格式。默认'Y/M/D'
     */
    dateBetween(start, end, format='Y/M/D'){
        let list = [], utils = this;
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
            list.push(utils.datemat(format,start));
        }
        return list;
    },
	verControl(attr, version, exclude){
		let oSrc = document.querySelectorAll('['+attr+']'),
			len = oSrc.length,
			i = 0,
			uri;
		for(; i<len; i++){
		    uri = oSrc[i].getAttribute(attr);
		    if(exclude && exclude.test(uri)) continue;
        	uri = uri.replace(/[?&]v=[^&]+(&|$)/g,'');
            oSrc[i].setAttribute(attr, /\?/.test(uri) ? uri+'&v='+version : uri+'?v='+version);
		}
	}
};
