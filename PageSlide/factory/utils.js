export default {
	addEvent(el, evt, fn){
        if(window.addEventListener){
            el.addEventListener(evt, fn);
        }else if(window.attachEvent){
            el.addEventListener('on'+evt, fn);
        }
    },
	removeEvent(el, evt, fn){
        if(window.removeEventListener){
            el.removeEventListener(evt, fn);
        }else{
            el.detachEvent('on'+evt, fn);
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
	setTransform(el, v, bool){
        if('transform' in document.documentElement){
            el.style.webkitTransform =
                el.style.mozTransform =
                    el.style.msTransform =
                        el.style.oTransform =
                            el.style.transform = 'translateY('+ (bool ? v+'px' : '-'+v+'00%') + ')';
        }else{
            el.style.top = bool ? v+'px' : '-'+v+'00%';
        }
    }
}