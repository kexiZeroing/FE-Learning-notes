const HTMLWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const config = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  devServer: {
    hot: true,
  },
  // it supports source map in build mode
  devtool: "inline-source-map",
  plugins: [new HTMLWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
};

module.exports = config;
