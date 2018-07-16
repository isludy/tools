const utils = require('../../utils/utils.js');
class Rnav {
    constructor(nav, options) {
        let _ = this,
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

        utils.addEvent(_.more, 'click', function(e) {
            utils.toggleClass(nav, o.show);
            if(typeof _.onClickMore === 'function') _.onClickMore.call(this, e);
        });

        for(let i = 0; i<_.length; i++){
            utils.addEvent(_.items[i], 'click', function(){
                for(let i = 0; i<_.length; i++) {
                    utils.removeClass(_.items[i], o.active);
                }
                utils.addClass(this, o.active);
            });
        }
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
}
module.exports = Rnav;