var utils={
    options: function(target, source, bool){
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
    elsByClass: function(cls, context){
        context = context || document;
       if(context.getElementsByClassName){
           return context.getElementsByClassName(cls);
       }else if(context.querySelector){
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
    hasClass: function(el, cls){
        if(el.classList){
            return el.classList.contains(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/);
            return utils.indexOf(list, cls) !== -1;
        }
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
    addEvent: function(el, evt, fn, capture){
        capture = capture || false;
        if(window.addEventListener){
            el.addEventListener(evt, fn, capture);
        }else if(window.attachEvent){
            el.attachEvent('on'+evt, fn);
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
    }
};
var Tools={};
/**----------- Rnav start line -------*/
(function(){
function Rnav(nav, options) {
        var _ = this,
            o = {
                item: 'nav-item',
                more: 'nav-more',
                show: 'nav-show',
                active: 'nav-active'
            };

        utils.options(o, options);
        options = null;

        if(nav.nodeType !== 1){
            nav = document.getElementById(nav);
            if(!nav) throw 'Error: nav is null';
        }

        _.nav = nav;
        _.items = utils.elsByClass(o.item);
        _.more = utils.elsByClass(o.more)[0];
        _.length = _.items.length;

        _.update();

        utils.addEvent(_.more, 'click', function(e){
            utils.toggleClass(nav, o.show);
            if(typeof _.onClickMore === 'function') _.onClickMore.call(this, e);
        });

        for(var i = 0; i<_.length; i++){
            utils.addEvent(_.items[i], 'click', function(){
                for(var i = 0; i<_.length; i++) {
                    utils.removeClass(_.items[i], o.active);
                }
                utils.addClass(this, o.active);
            });
        }
    }
Rnav.prototype = {
    onClickMore: function(){},
    update: function(){
        var _ = this,
            count = 0,
            itemsWidth = 0,
            i = 0,
            bool = false;

        for (; i < _.length; i++) {
            itemsWidth += _.items[i].offsetWidth;
            if (this.items[i].offsetTop > 0) {
                _.nav.insertBefore(_.more, this.items[i]);
                utils.addClass(_.more, 'nav-more-show');
                bool = true;
                break;
            }
        }
        if(!bool){
            utils.removeClass(_.more, 'nav-more-show');
        }
        (function recycle(){
            if (_.more.offsetTop > 0) {
                _.nav.insertBefore(_.more, _.more.previousSibling);
                if (_.more.offsetTop > 0 && count < _.length) {
                    recycle();
                    count++;
                }
            }
        })();
    }
};

Tools.Rnav= Rnav;
})();

/**----------- Rnav end line -------*/

