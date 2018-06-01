const pretreat = require('./pretreat');

const config = {
    output: {
        filename: '[name].min.js',
        path: __dirname
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },{
            test: /\.js$/,
            use: ['babel-loader']
        }]
    }
};
config.entry = pretreat(['PageSlide', 'Player']);

module.exports = config;

