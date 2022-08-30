console.log('Load babel config!');

module.exports = (api) => {
  api.cache(false);
  return {
    plugins: [['@babel/plugin-proposal-decorators', {
      version: 'legacy'
    }], 'babel-plugin-transform-typescript-metadata'],
    presets: [
      ['@babel/preset-env', { targets: { node: true } }],
      ['@babel/preset-typescript'],
    ],
  };
};
