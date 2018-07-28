module.exports ={
    isTouch: 'ontouchstart' in document,
    elsByClass: function(cls,context){
        context = context || document;
       if(context.getElementsByClassName){
           return context.getElementsByClassName(cls);
       }else if(context.querySelectorAll){
           return context.querySelectorAll('.'+cls);
       }else{
           var utils = this,
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
    $: function(selector,context){
        context = context || document;
        return context.querySelectorAll(selector);
    },
    contains: function(target, context){
        if(context.contains){
            return context.contains(target);
        }else{
            if(target === context){
                return true;
            }else{
                var children = context.getElementsByTagName('*'),
                    len = children.length,
                    i = 0;
                for(; i<len; i++){
                    if(target === children[i]) return true;
                }
            }
        }
        return false;
    },
    includes: function(arr, item){
        if(arr.includes){
            return arr.includes(item);
        }else{
            for(var i=0, l=arr.length; i<l; i++){
                if(arr[i] === item) return true;
            }
        }
        return false;
    },
    indexOf: function(arr, item){
        if(arr.indexOf){
            return arr.indexOf(item);
        }else{
            for(var i=0, l=arr.length; i<l; i++)
                if(arr[i] === item) return i;
            return -1;
        }
    },
    addClass: function(el, cls){
        if(el.classList){
            el.classList.add(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/);
            if(utils.indexOf(list, cls) === -1){
                list.push(cls);
            }
            el.className = list.join(' ');
        }
    },
    removeClass: function(el, cls){
        if(el.classList){
            el.classList.remove(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/),
                index;
            if((index = utils.indexOf(list, cls)) !== -1){
                list.splice(index, 1);
            }
            el.className = list.join(' ');
        }
    },
    hasClass: function(el, cls){
        if(el.classList){
            return el.classList.contains(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/);
            return utils.indexOf(list, cls) !== -1;
        }
    },
    toggleClass: function(el, cls){
        if(el.classList){
            el.classList.toggle(cls);
        }else{
            var utils = this,
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
    switchClass(el, oldCls, newCls){
        var utils = this;
        utils.removeClass(el, oldCls);
        utils.addClass(el, newCls);
    },
    classes: function(els, type, cls){
        var utils = this,
            arg3 = arguments[3];
        if(els.nodeType === 1){
            utils[type+'Class'](els, cls, arg3);
        }else{
            try{
                for(var i=0, l=els.length; i<l; i++){
                    if(els[i].nodeType === 1){
                        utils[type+'Class'](els[i], cls, arg3);
                    }
                }
            }catch(err){
                console.error(err);
            }
        }
    },
    on: function(el,evt,fn,capture){
        capture = capture || false;
        var listen1 = window.addEventListener,
            listen2 = window.attachEvent,
            els = (el.nodeType === 1 || el === document || el === window) ? [el] : el,
            len = els.length;

        for(var i=0; i<len; i++){
            if(els[i].nodeType === 3) continue;
            if(listen1){
                els[i].addEventListener(evt, fn, capture);
            }else if(listen2){
                els[i].attachEvent('on'+evt, fn);
            }
        }
    },
    off: function(el, evt, fn){
        var listen1 = window.removeEventListener,
            listen2 = window.detachEvent,
            els = (el.nodeType === 1 || el === document || el === window) ? [el] : el,
            len = els.length;

        for(var i=0; i<len; i++){
            if(els[i].nodeType === 3) continue;
            if(listen1){
                els[i].removeEventListener(evt, fn, capture);
            }else if(listen2){
                els[i].detachEvent('on'+evt, fn);
            }
        }
    },
    wheel: function(elem, callback, useCapture){
        var prefix = "", _addEventListener, support;
        
        if ( window.addEventListener ) {
            _addEventListener = "addEventListener";
        } else {
            _addEventListener = "attachEvent";
            prefix = "on";
        }

        
        support = "onwheel" in document ? "wheel" :
            document.onmousewheel !== undefined ? "mousewheel" : 
                "DOMMouseScroll"; 

        _addWheelListener( elem, support, callback, useCapture );

        
        if( support === "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }


        function _addWheelListener( elem, eventName, callback, useCapture ) {
            elem[ _addEventListener ]( prefix + eventName, support === "wheel" ? callback : function( originalEvent ) {
                !originalEvent && ( originalEvent = window.event );

                
                var event = {
                    
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

                
                if ( support === "mousewheel" ) {
                    event.deltaY = - 1/40 * originalEvent.wheelDelta;
                    
                    originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
                } else {
                    event.deltaY = originalEvent.detail;
                }

                
                return callback( event );

            }, useCapture || false );
        }
    },
    toBottom: function(el,deviation){
        deviation = deviation || 2;
        if(!el)
            return false;
        return el.scrollHeight - el.offsetHeight - el.scrollTop <= deviation;
    },
    toTop: function(el,deviation){
        deviation = deviation || 0;
        if(!el)
            return false;
        return el.scrollTop <= deviation;
    },
    transition: function(el, v) {
        el.style.webkitTransition =
            el.style.mozTransition =
                el.style.msTransition =
                    el.style.oTransition =
                        el.style.transition = v;
    },
    transform(el, val){
        if('transform' in document.documentElement.style){
            el.style.webkitTransform =
                el.style.mozTransform =
                    el.style.msTransform =
                        el.style.oTransform =
                            el.style.transform = val;
        }else{
            if(/translateY/.test(val)){
                el.style.top = val;
            }else if(/translateX/.test(val)){
                el.style.left = val;
            }else if(/scaleY/.test(val)){
                var h = el.offsetHeight;
                el.style.height = h * parseFloat(val)+'px';
            }else if(/scaleX/.test(val)){
                var w = el.offsetWidth;
                el.style.width = w * parseFloat(val) + 'px';
            }
        }
    },
    fullscreen: function(el){
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
    exitFullscreen: function(){
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
    isFullscreen: function() {
        return document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || false;
    },
    calced: function(el, attr){
        if(el && el.nodeType === 1){
            if(window.getComputedStyle){
                return window.getComputedStyle(node)[attr];
            }else{
                return el.currentStyle[attr];
            }
        }else{
            return 0;
        }
    },
    parent: function(el,cls,context){
        context = context || document.documentElement;
        var utils = this;
        while (el !== context){
            el = el.parentNode;
            if(!el) return false;
            if(utils.hasClass(el, cls)){
                return el;
            }
        }
    },
    parents: function(el,cls,context){
        context = context || document.documentElement;
        var utils = this, els = [];
        while (el !== context){
            el = el.parentNode;
            if(!el) return false;
            if(utils.hasClass(el, cls)){
                els.push(el);
            }
        }
        return els;
    },
    eventGroup: function(els, fn1, fn2, fn3){
        var utils = this,
            events = utils.isTouch ? ['touchstart','touchmove','touchend'] : ['mousedown','mousemove','mouseup'],
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
    options: function(target,source,bool){
        bool = bool || true;
        for(var k in source) {
            if (source.hasOwnProperty(k)) {
                if ((bool && target.hasOwnProperty(k)) || !bool) {
                    target[k] = source[k];
                }
            }
        }
        source = null;
        return target;
    },
    each: function(obj, fn){
        var len = obj.length, callback;
        if(len){
            for(var i=0; i<len; i++){
                callback = fn.call(obj[i], obj[i], i);
                if(callback === 'continue') continue;
                if(callback !== undefined) return callback;
                if(callback === 'break') break;
            }
        }else{
            for(var i in obj){
                callback = fn.call(obj[i], obj[i], i);
                if(callback === 'continue') continue;
                if(callback !== undefined) return callback;
                if(callback === 'break') break;
            }
        }
    },
    pageSlide: function(options){
        var utils = this,
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
        utils.options(o, options);
        options = null;

        var view = document.querySelector(o.view);

        function main(){
            var wrapper = view.querySelector(o.wrapper),
                slides = view.querySelectorAll(o.slide),
                maxIndex = slides.length - 1,
                viewH = view.offsetHeight,
                timer = null,
                scrollEl = null,
                allowTurn = true,
                start = 0,
                delta = 0,
                page = 0;

            var style = document.createElement('style');
            style.innerText = o.view+'{position:relative;overflow:hidden;}'+
                o.wrapper+'{height:100%;position:relative;}'+
                o.slide+'{height:100%;}';
            document.head.appendChild(style);

            utils.eventGroup([view, view, document], function(e){
                if(e.button === 2) return false;
                start = utils.isTouch ? e.touches[0].clientY : e.clientY;
                delta = 0;

                scrollEl = utils.parent(e.target, o.scrollbar, wrapper);
                utils.transition(wrapper, 'none');
            }, function(e){
                delta = (utils.isTouch ? e.touches[0].clientY : e.clientY) - start;
                if(!scrollEl || (delta<0 &&  utils.toBottom(scrollEl, o.deviation)) || (delta>0 &&  utils.toTop(scrollEl, o.deviation))){
                    if(!o.fireDistance || Math.abs(delta) > o.fireDistance){
                        utils.transform(wrapper, 'translateY('+delta-page*viewH+')', true);
                        allowTurn = true;
                    }else{
                        allowTurn = false;
                    }
                }else{
                    allowTurn = false;
                }
            }, function(){
                utils.transition(wrapper, 'all ' + o.duration/1000 + 's');
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
                utils.transform(wrapper, 'translateY('+page+')');
                scrollEl = null;
            });
        }
        if(view) main();
    },
    time: function(timemat){
        var arr = timemat.split(/[:：]+/);
        if(arr.length === 3){
            return parseInt(arr[0])*3600 + parseInt(arr[1])*60 + parseFloat(arr[2]);
        }else{
            return parseInt(arr[0])*60 + parseFloat(arr[1]);
        }
    },
    timemat: function(time,type){
        type = type || 0;
        var h = !type ? 0 : Math.floor(time/3600),
            i = Math.floor((time - h*3600) / 60),
            s = Math.floor(time - h*3600 - i*60);

        h = h < 10 ? '0' + h : h;
        i = i < 10 ? '0' + i : i;
        s = s < 10 ? '0' + s : s;
        return (!type ? '' : (h + ':')) + i + ':' + s;
    },
    weeks: ['日','一','二','三','四','五','六'],
    datemat: function(format,time){
        format = format || 'Y/M/DH:I:S.C';
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
    lastDate: function(year,month){
        year = year || -1;
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
    dateTable: function(year,month,opt){
        year = year || -1;
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

        
        
        if(o.mode === 1){
            
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
        
        
        if(o.limitRow && total < 42){
            
            if(42 - total >= 14){
                startTime -= 7 * 86400000;
                beforeDays += 7;
                afterDays += 7;
            }else{
                
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
    dateBetween: function(start,end,format){
        format = format || 'Y/M/D';
        var list = [], utils = this;
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
    }
};
