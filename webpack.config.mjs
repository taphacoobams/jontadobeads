// Configuration React (Webpack + Babel), reprise de Senemaille et allégée (pas de PWA ni de GSAP).
//   (les tests compilent une version avec des données d'essai : voir playwright.config.js)
//   npm start        → serveur de développement sur http://localhost:3000
//   npm run build    → build de production dans dist/
//   npm run serve    → sert dist/ sur http://localhost:3000
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const root = path.dirname(fileURLToPath(import.meta.url));

export default (env, argv) => {
  const prod = argv.mode === 'production';
  return {
    mode: prod ? 'production' : 'development',
    entry: path.resolve(root, 'src/main.jsx'),
    output: {
      path: path.resolve(root, process.env.JDB_OUT || 'dist'),
      publicPath: '/',
      filename: prod ? 'assets/[name]-[contenthash:8].js' : 'assets/[name].js',
      chunkFilename: prod ? 'assets/[name]-[contenthash:8].js' : 'assets/[name].js',
      assetModuleFilename: 'assets/[name]-[contenthash:8][ext]',
      clean: true,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      // Données de la boutique. JDB_DATA permet aux tests d'utiliser des données d'essai.
      alias: { '@data': path.resolve(root, process.env.JDB_DATA || 'src/data') },
    },
    devtool: prod ? false : 'eval-cheap-module-source-map',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults, not ie 11' }],
                ['@babel/preset-react', { runtime: 'automatic', development: !prod }],
              ],
            },
          },
        },
        { test: /\.css$/, use: [prod ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'] },
        { test: /\.(woff2?|png|jpe?g|gif|svg|webp)$/i, type: 'asset/resource' },
      ],
    },
    optimization: {
      minimizer: [new TerserPlugin({ extractComments: false }), new CssMinimizerPlugin()],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          react: { test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, name: 'react', priority: 30 },
          icons: { test: /[\\/]node_modules[\\/]lucide-react[\\/]/, name: 'icons', priority: 10 },
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.resolve(root, 'index.html'), scriptLoading: 'defer' }),
      new CopyWebpackPlugin({ patterns: [{ from: path.resolve(root, 'public'), to: '.', noErrorOnMissing: true }] }),
      ...(prod ? [new MiniCssExtractPlugin({ filename: 'assets/[name]-[contenthash:8].css', chunkFilename: 'assets/[name]-[contenthash:8].css' })] : []),
    ],
    devServer: {
      port: 3000,
      host: 'localhost',
      historyApiFallback: true,
      hot: true,
      open: false,
      static: { directory: path.resolve(root, 'public') },
      client: { overlay: { warnings: false } },
    },
    performance: { hints: false },
    stats: 'errors-warnings',
  };
};
