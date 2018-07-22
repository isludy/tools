import utils from '../../utils/utils';

class Rnav {
    constructor(navbar, options) {
        let _ = this,
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

        for(let i = 0; i<_.length; i++){
            _.items[i] = items[i];
            utils.addEvent(items[i], 'click', function(){
                for(let i = 0; i<_.length; i++) {
                    utils.removeClass(items[i], o.active);
                }
                utils.addClass(this, o.active);
            });
        }

        utils.addEvent(_.more, 'click', function(e) {
            if(utils.hasClass(_.navdrop, o.dropShow)){
                utils.removeClass(_.navdrop, o.dropShow);
            }else{
                let dropItem,
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


        utils.addEvent(window, 'resize',()=>{
            if(o.resize) _.update();
        });

        _.update();
    }
    onDropMenu(){}
    update(){
        let _ = this,
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
}

export default Rnav;