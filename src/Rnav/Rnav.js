import utils from '../../utils/utils';

class Rnav {
    constructor(nav, options) {
        let _ = this,
            o = {
                item: 'nav-item',
                more: 'nav-more',
                show: 'nav-show',
                active: 'nav-active'
            },
            items;

        utils.options(o, options);
        options = null;

        if(nav.nodeType !== 1){
            nav = document.getElementById(nav);
            if(!nav) throw 'Error: nav is null';
        }

        items = utils.elsByClass(o.item);

        _.nav = nav;
        _.more = utils.elsByClass(o.more)[0];
        _.length = items.length;
        _.items = [];
        _.dropItems = [];

        utils.addEvent(_.more, 'click', function(e) {
            utils.toggleClass(nav, o.show);
            if(typeof _.onClickMore === 'function') _.onClickMore.call(this, e);
        });

        for(let i = 0; i<_.length; i++){
            _.items[i] = items[i];
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
            bool = false,
            nextNode;

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
        _.dropItems.splice(0, _.dropItems.length);
        nextNode = _.more.nextSibling;
        while(nextNode){
            if(nextNode.nodeType === 1){
                _.dropItems.push(nextNode);
            }
            nextNode = nextNode.nextSibling;
        }
    }
}

export default Rnav;