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
    }
};
