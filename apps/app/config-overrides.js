const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
  webpack: (config) => {
    // Remove guard against importing modules outside of `src`.
    // Needed for workspace projects.
    config.resolve.plugins = config.resolve.plugins.filter(
      (plugin) => !(plugin instanceof ModuleScopePlugin)
    );

    // Add support for importing workspace projects.
    config.resolve.plugins.push(
      new TsConfigPathsPlugin({
        configFile: path.resolve(__dirname, 'tsconfig.json'),
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        mainFields: ['module', 'main']
      })
    );

    // Replace include option for babel loader with exclude
    // so babel will handle workspace projects as well.
    config.module.rules.forEach((r) => {
      if (r.oneOf) {
        const babelLoader = r.oneOf.filter((rr) => {
          return rr.loader && rr.loader.indexOf('babel-loader') !== -1;
        });
        babelLoader.forEach((b) => {
          b.exclude = /node_modules/;
          delete b.include;
        });
      }
    });

    // Add Datadog source map upload code
    config.plugins.push(
      new webpack.SourceMapDevToolPlugin({
        noSources: false,
        filename: '[file].map'
      })
    );

    // Get git commit hash
    const commitHash = childProcess.execSync('git rev-parse --short HEAD').toString().trim();

    // Define __COMMIT_HASH__
    config.plugins.push(
      new webpack.DefinePlugin({
        __COMMIT_HASH__: JSON.stringify(commitHash)
      })
    );

    return config;
  },
  paths: (paths) => {
    // Rewrite dist folder to where Nx expects it to be.
    paths.appBuild = path.resolve(__dirname, '../../dist/apps/app');
    return paths;
  },
  jest: (config) => {
    config.resolver = '@nrwl/jest/plugins/resolver';
    return config;
  }
};
