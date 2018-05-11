import utils from './utils';
window.PageSlide=function (options){
        let o = {
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

        let view = document.querySelector(o.view),
            isTouch = 'ontouchstart' in document;

        function getScrollbar(target, cls, context){
            while (target !== context){
                if(!target) return false;
                if(target.className && (target.className.split(/\s+/).indexOf(cls) !== -1)){
                    return target;
                }else{
                    target = target.parentNode;
                }
            }
        }

        function main(){
            let wrapper = view.querySelector(o.wrapper),
                slides = view.querySelectorAll(o.slide),
                maxIndex = slides.length - 1,
                events = isTouch ? ['touchstart','touchmove','touchend'] : ['mousedown','mousemove','mouseup'],
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

            utils.addEvent(view, events[0], startFn);
            function startFn(e){
                if(e.button === 2) return false;
                start = isTouch ? e.touches[0].clientY : e.clientY;
                delta = 0;

                scrollEl = getScrollbar(e.target, o.scrollbar, wrapper);
                utils.setTransition(wrapper, 'none');

                utils.addEvent(view, events[1], moveFn);
                utils.addEvent(document, events[2], endFn);
            }
            function moveFn(e){
                delta = (isTouch ? e.touches[0].clientY : e.clientY) - start;
                if(!scrollEl || (delta<0 &&  utils.toBottom(scrollEl, o.deviation)) || (delta>0 &&  utils.toTop(scrollEl, o.deviation))){
                    if(!o.fireDistance || Math.abs(delta) > o.fireDistance){
                        utils.setTransform(wrapper, delta-page*viewH, true);
                        allowTurn = true;
                    }else{
                        allowTurn = false;
                    }
                }else{
                    allowTurn = false;
                }
            }
            function endFn(){
                utils.removeEvent(view, events[1], moveFn);
                utils.removeEvent(document, events[2], endFn);
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
                utils.setTransform(wrapper, page);
                scrollEl = null;
            }
        }
        if(view) main();
    }