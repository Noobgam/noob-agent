const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production', // Add this line
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    target: 'node',
    output: {
        filename: 'bundle.cjs',
        path: path.resolve(__dirname, 'dist'),
    },
};
