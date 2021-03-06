const path = require('path');

module.exports = {
    entry: {
        app:'../react-reporting/src/index.js',
    },
    output: {
        path: path.join(__dirname,'../public/js'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude : /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
}