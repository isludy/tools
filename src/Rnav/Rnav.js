import utils from '../../utils/utils';

class Rnav {
    constructor(navbar, options) {
        let _ = this,
            o = {
                nav: 'nav',
                item: 'nav-item',
                more: 'nav-more',
                show: 'nav-show',
                active: 'nav-active'
            },
            items;

        utils.options(o, options);
        options = null;

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
        _.items = items;

        _.navdrop.className = 'nav-drop';
        _.navbar.appendChild(_.navdrop);

        utils.addEvent(_.more, 'click', function(e) {
            utils.toggleClass(navbar, o.show);
            if(typeof _.onClickMore === 'function') _.onClickMore.call(this, e);
        });

        for(let i = 0; i<_.length; i++){
            let dropItem = items[i].cloneNode(true);
            dropItem.className = 'nav-drop-item';
            _.navdrop.appendChild(dropItem);

            utils.addEvent(items[i], 'click', function(){
                for(let i = 0; i<_.length; i++) {
                    utils.removeClass(items[i], o.active);
                }
                utils.addClass(this, o.active);
            });
        }
        _.update();
    }
    onClickMore(){}
    update(){
        let _ = this,
            count = 0,
            itemsWidth = 0,
            i = 0,
            bool = false;

        for (; i < _.length; i++) {
            itemsWidth += _.items[i].offsetWidth;
            if (_.items[i].offsetTop > 0) {
                _.nav.insertBefore(_.more, _.items[i]);
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
}

export default Rnav;