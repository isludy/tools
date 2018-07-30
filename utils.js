window.utils = {
    options: function(target, source, bool) {
        bool = bool || true;
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                if ((bool && target.hasOwnProperty(k)) || !bool) {
                    target[k] = source[k];
                }
            }
        }
        source = null;
        return target;
    },
    elsByClass: function(cls, context) {
        context = context || document;
        if (context.getElementsByClassName) {
            return context.getElementsByClassName(cls);
        } else if (context.querySelectorAll) {
            return context.querySelectorAll('.' + cls);
        } else {
            var utils = this,
                els = context.getElementsByTagName('*'),
                len = els.length,
                i = 0,
                doms = [];
            for (; i < len; i++) {
                if (utils.hasClass(els[i], cls)) {
                    doms.push(els[i]);
                }
            }
            return doms;
        }
    },
    removeClass: function(el, cls) {
        if (el.classList) {
            el.classList.remove(cls);
        } else {
            var utils = this,
                list = el.className.split(/\s+/),
                index;
            if ((index = utils.indexOf(list, cls)) !== -1) {
                list.splice(index, 1);
            }
            el.className = list.join(' ');
        }
    },
    addClass: function(el, cls) {
        if (el.classList) {
            el.classList.add(cls);
        } else {
            var utils = this,
                list = el.className.split(/\s+/);
            if (utils.indexOf(list, cls) === -1) {
                list.push(cls);
            }
            el.className = list.join(' ');
        }
    },
    hasClass: function(el, cls) {
        if (el.classList) {
            return el.classList.contains(cls);
        } else {
            var utils = this,
                list = el.className.split(/\s+/);
            return utils.indexOf(list, cls) !== -1;
        }
    },
    indexOf: function(arr, item) {
        if (arr.indexOf) {
            return arr.indexOf(item);
        } else {
            for (var i = 0, l = arr.length; i < l; i++)
                if (arr[i] === item) return i;
            return -1;
        }
    }
};