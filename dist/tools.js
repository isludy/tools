window.utils={
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
window.Tools={};
/**----------- Rnav start line -------*/
(function(){
function Rnav(navbar, options) {
        var _ = this,
            o = {
                nav: 'nav',
                item: 'nav-item',
                more: 'nav-more',
                moreShow: 'nav-more-show',
                dropShow: 'nav-drop-show',
                active: 'nav-item-active',
                resize: true
            },
            items;

        utils.options(o, options);
        options = null;
        _.options = o;

        if(navbar.nodeType !== 1){
            navbar = document.getElementById(navbar);
            if(!navbar) throw 'Error: nav is null';
        }

        items = utils.elsByClass(o.item);

        _.navbar = navbar;
        _.nav = utils.elsByClass(o.nav, navbar)[0];
        _.more = utils.elsByClass(o.more, navbar)[0];
        _.navdrop = document.createElement('nav');
        _.length = items.length;
        _.items = [];

        _.navdrop.className = 'nav-drop';
        _.navbar.appendChild(_.navdrop);

        for(var i = 0; i<_.length; i++){
            _.items[i] = items[i];
            utils.addEvent(items[i], 'click', function(){
                for(var i = 0; i<_.length; i++) {
                    utils.removeClass(items[i], o.active);
                }
                utils.addClass(this, o.active);
            });
        }

        utils.addEvent(_.more, 'click', function(e){
            if(utils.hasClass(_.navdrop, o.dropShow)){
                utils.removeClass(_.navdrop, o.dropShow);
            }else{
                var dropItem,
                    count = 0;
                while(dropItem = _.more.nextSibling){
                    if(dropItem.nodeType === 1){
                        _.navdrop.appendChild(dropItem);
                    }else{
                        _.nav.removeChild(dropItem);
                    }
                    if(count >= 50) break;
                    count++;
                }

                utils.addClass(_.navdrop, o.dropShow);
            }
            if(typeof _.onDropMenu === 'function') _.onDropMenu.call(this, e);
        });


        utils.addEvent(window, 'resize',function(){
            if(o.resize) _.update();
        });

        _.update();
    }
Rnav.prototype = {
    onDropMenu: function(){},
    update: function(){
        var _ = this,
            count = 0,
            itemsWidth = 0,
            i = 0,
            bool = false,
            dropItem = _.navdrop.firstChild;

        utils.removeClass(_.navdrop, _.options.dropShow);

        while(dropItem){
            if(dropItem.nodeType === 1){
                _.nav.appendChild(dropItem);
            }
            dropItem = _.navdrop.firstChild;
        }

        for (; i < _.length; i++) {
            itemsWidth += _.items[i].offsetWidth;
            if (_.items[i].offsetTop > 0) {
                _.nav.insertBefore(_.more, _.items[i]);
                utils.addClass(_.more, _.options.moreShow);
                bool = true;
                break;
            }
        }
        if(!bool){
            utils.removeClass(_.more, _.options.moreShow);
        }

        while(_.more.offsetTop > 0) {
            _.nav.insertBefore(_.more, _.more.previousSibling);
            if(count >= _.length) break;
        }

    }
};


Tools.Rnav=Rnav;
})();

/**----------- Rnav end line -------*/

