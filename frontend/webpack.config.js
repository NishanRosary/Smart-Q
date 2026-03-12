const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

class CopyPublicAssetsPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CopyPublicAssetsPlugin', () => {
      const publicDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, 'dist');

      if (!fs.existsSync(publicDir)) {
        return;
      }

      for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
        if (entry.name === 'index.html') {
          continue;
        }

        fs.cpSync(
          path.join(publicDir, entry.name),
          path.join(distDir, entry.name),
          { recursive: true }
        );
      }
    });
  }
}

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'auto',
    clean: true,
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },

      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },

      // allow images to load
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyPublicAssetsPlugin(),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },
};