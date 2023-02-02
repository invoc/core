const path = require("path");

module.exports = {
  // Entry points to the library
  entry: {
    index: "./src/index.ts",
  },
  // Rules for library file types
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: { configFile: "tsconfig.webpack.json" },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve("./lib"),
    filename: "[name].js",
    library: {
      name: "@invoc/core",
      type: "umd",
    },
    globalObject: "this",
  },
  // Devtool
  target: "web",
  mode: "production",
  optimization: {
    usedExports: true,
  },
};
