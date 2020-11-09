require("dotenv").config();
const webpack = require("webpack");
const ManifestPlugin = require("webpack-manifest-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const getClientEnv = (nodeEnv) => {
  return {
    "process.env": JSON.stringify(
      Object.keys(process.env)
        .filter((key) => /^REACT_APP/i.test(key))
        .reduce(
          (env, key) => {
            env[key] = process.env[key];
            return env;
          },
          { NODE_ENV: nodeEnv }
        )
    ),
  };
};
const path = require("path");
const appIndex = path.resolve(__dirname, "src", "index.tsx");
const appBuild = path.resolve(__dirname, "build");
const appSrc = path.resolve(__dirname, "src");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appHtml = path.resolve(__dirname, "public", "index.html");
const appPublic = path.resolve(__dirname, "public");

module.exports = (webpackEnv) => {
  const isEnvDevelopment = webpackEnv === "development";
  const isEnvProduction = webpackEnv === "production";
  const clientEnv = getClientEnv(webpackEnv);
  return {
    entry: appIndex,
    mode: webpackEnv,
    output: {
      path: appBuild,
      filename: isEnvProduction
        ? "static/js/[name].[contenthash:8].js"
        : "static/js/bundle.js",
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            "cache-loader",
            {
              loader: "ts-loader",
              options: {
                transpileOnly: isEnvDevelopment,
              },
            },
          ],
        },
        {
          loader: "file-loader",
          exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
          options: {
            outputPath: "static/media",
            name: "[name].[hash:8].[ext]",
            esModule: false,
          },
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: "url-loader",
          options: {
            limit: 10000,
            outputPath: "static/media",
            name: "[name].[hash:8].[ext]",
          },
        },
        {
          test: /\.(ts|tsx)$/,
          enforce: "pre",
          exclude: /node_modules/,
          loader: "eslint-loader",
          options: {
            cache: true,
            formatter: isEnvProduction ? "codeframe" : "stylish",
          },
          include: appSrc,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: appHtml }),
      new webpack.DefinePlugin(clientEnv),
      new ForkTsCheckerWebpackPlugin({
        eslint: {
          files: "./src/**/*.{ts,tsx,js,jsx}",
        },
      }),
    ],
    cache: {
      type: isEnvDevelopment ? "memory" : "filesystem",
    },
    devServer: {
      port: 3000,
      contentBase: appPublic,
      open: true,
      historyApiFallback: true,
      overlay: true,
      stats: true,
    },
  };
};
