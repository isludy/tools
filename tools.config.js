module.exports = {
    group: {
        Player: {
            name: 'Player',
            entry: 'main',
            css: 'Player'
        },
        PageSlide: {
            name: 'PageSlide',
            entry: 'main'
        },
        Rdate: {
            name: 'Rdate',
            entry: 'main'
        },
        Calendar: {
            name: 'Calendar',
            entry: 'main',
            css: 'Calendar'
        },
        ScaleControl: {
            name: 'ScaleControl',
            entry: 'main',
            css: 'ScaleControl'
        },
        Scrollbar: {
            name: 'Scrollbar',
            entry: 'main',
            css: 'Scrollbar'
        },
        Rnav: {
            name: 'Rnav',
            entry: 'main',
            css: 'Rnav'
        }
    },
    merge: {
        name: 'Tools.min',
        path: './dist'
    },
    mount: 'window'
};