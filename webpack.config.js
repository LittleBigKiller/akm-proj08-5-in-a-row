module.exports = {
    entry: "./src/app.ts",
    devtool: "source-map",
    output: {
        filename: './bundle.js'
    },
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    watchOptions: {
        ignored: ['node_modules', 'dist']
    },
    devServer: {
        port: 3000
    }
}