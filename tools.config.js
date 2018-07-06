module.exports = {
    group: {
        Player: {
            name: 'Player',
            entry: 'main'
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
            entry: 'main'
        },
        ScaleControl: {
            name: 'ScaleControl',
            entry: 'main'
        },
        Rscrollbar: {
            name: 'Rscrollbar',
            entry: 'main'
        },
        Rnav: {
            name: 'Rnav',
            entry: 'main'
        }
    },
    merge: {
        name: 'Tools.min',
        path: './dist'
    },
    mount: 'window'
};