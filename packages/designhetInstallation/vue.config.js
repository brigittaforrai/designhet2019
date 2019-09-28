const production = process.env.NODE_ENV === "production"
const path = require('path');

module.exports = {
  publicPath: production ? '/designhet2019' : '/' ,
  outputDir: './../../docs',
  chainWebpack: config => {
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .tap(options => {
        options.configFile = path.resolve(__dirname, ".eslintrc.js");
        return options;
    })
  }
}
