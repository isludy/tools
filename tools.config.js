module.exports = {
    group: {
        PageSlide: {
            name: 'PageSlide',
            entry: 'main'
        },
        Player: {
            name: 'Player',
            entry: 'main'
        }
    },
    merge: {
        name: 'Tools.min',
        path: './dist'
    },
    mount: 'window'
};