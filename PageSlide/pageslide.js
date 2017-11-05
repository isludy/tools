!function(){
    function Page(options){
        var o = {
            view: '.page-view',
            wrapper: '.page-wrapper',
            slide: '.page-slide',
            scrollClass: 'page-scroll',
            deviation: 5,
            distance: 100,
            time: 1,
            viewHeight: 'auto',
            beforeChange: null,
            afterChange: null
        };
        if(typeof options === 'object'){
            for(var k in options){
                o[k] = options[k];
            }
        }
        options = null;

        //check view
        var view = document.querySelector(o.view);
        if(!view) return;

        //初始化必要的style
        if(!document.getElementById('page-slide-id')){
            var style = document.createElement('style'),
                head = document.head,
                headChildren = head.childNodes,
                childrenLen = headChildren.length,
                firstCss = null;
            for(var i=0; i<childrenLen; i++){
                if(headChildren[i].nodeType === 1 && (headChildren[i].nodeName === 'STYLE' || headChildren[i].nodeName === 'LINK') ){
                    firstCss = headChildren[i];
                    break;
                }
            }
            style.id = 'page-slide-id';
            style.innerText = o.view+'{position:relative; overflow:hidden;}'+
                o.wrapper+'{height: 100%;}'+
                o.slide+'{height: 100%;}';

            if(firstCss){
                head.insertBefore(style, firstCss);
            }else{
                head.appendChild(style);
            }
        }

        var wrapper = view.querySelector(o.wrapper),
            slide = view.querySelectorAll(o.slide),
            maxIndex = slide.length - 1,
            isTouch = 'ontouchstart' in document,
            events = isTouch ? ['touchstart','touchmove','touchend'] : ['mousedown','mousemove','mouseup'],
            scrollClass = o.scrollClass,
            deviation = o.deviation,
            distance = o.distance,
            viewHeight = o.viewHeight === 'auto' ?  wrapper.offsetHeight : o.viewHeight,
            time = o.time,
            timer = null,
            scrollBody = null,
            isTurnPage = true,
            start = 0,
            end = 0,
            delta = 0,
            curScrollTop = 0,
            wrapperTop = 0,
            index = 0;

        view.addEventListener(events[0], startFn, false);
        function startFn(e){
            if(e.button === 2) return false;
            var that = this;
            start = isTouch ? e.targetTouches[0].clientY : e.clientY;
            end = start;
            delta = 0;
            wrapperTop = getTranslateY(wrapper);
            wrapper.style.transition = 'none';
            scrollBody = getScrollElement(e.target, that, scrollClass);
            curScrollTop = !scrollBody ? 0 : scrollBody.scrollTop;
            view.addEventListener(events[1], moveFn, false);
            document.addEventListener(events[2], endFn, false);
        }
        function moveFn(e){
            e.preventDefault();
            end = isTouch ? e.targetTouches[0].clientY : e.clientY;
            delta = end - start;
            //不触发transform的三大条件如下：满足下方“条件一”和“条件二中的【1】或【2】”即不触发
            //条件一： 当scrollBody存在时
            if( scrollBody &&
                (
                    //条件二：1.当delta小于0，并且滚动条距离底部小于deviation（误差值）时
                    (delta < 0 && (Math.abs(scrollBody.scrollHeight - scrollBody.scrollTop - scrollBody.offsetHeight) > deviation) )
                    //条件二：2.或，当delta大于0，并且滚动条在顶部时
                    || (delta>0 && scrollBody.scrollTop !== 0)
                )
            ){
                //只触发滚动条
                scrollBody.scrollTop = -delta + curScrollTop;
                isTurnPage = false;
            }
            //否则触发transform
            else{
                wrapper.style.transform = 'translate3d(0,' + (delta+wrapperTop) + 'px,0)';
                isTurnPage = true;
            }
        }
        function endFn(e){
            view.removeEventListener(events[1], moveFn, false);
            document.removeEventListener(events[2], endFn, false);
            var direction = delta < 0 ? -1 : 1;
            wrapper.style.transition = 'all '+time+'s';
            //触发切换页面的条件：transform被激活，并且delta要大于规定的距离distance，并且当前页面不是第一个或最后一个
            if( isTurnPage && (Math.abs(delta) > distance) && ( (delta > 0 && index > 0) || (delta < 0 && index < maxIndex) ) ){
                var newTop = wrapperTop + direction * viewHeight;
                index = Math.abs(newTop/viewHeight);
                if(o.beforeChange) o.beforeChange(index);
                wrapper.style.transform = 'translate3d(0,' + newTop + 'px,0)';
                timer = setTimeout(function(){
                    clearTimeout(timer);
                    if(o.afterChange) o.afterChange(index);
                },time*1000);
            }else{
                wrapper.style.transform = 'translate3d(0,' + Math.round(wrapperTop / viewHeight) * viewHeight + 'px,0)';
            }
            scrollBody = null;
        }
    }
    function getTranslateY(node){
        return ~~parseInt(node.style.transform.split(/,\s*/)[1]);
    }
    function getScrollElement(eventTarget,container,classname) {
        while (eventTarget !== container){
            if(hasClass(eventTarget,classname)){
                return eventTarget;
            }else{
                eventTarget = eventTarget.parentNode;
            }
        }
        return null;
    }
    function hasClass(node, classname) {
        if(!node.className) return false;
        return (node.className+'').split(/\s+/).indexOf(classname) !== -1;
    }
    window.Page = Page;
}();



