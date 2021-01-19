Package.describe({
  name: 'zer0th:meteor-vuetify-loader',
  version: '0.1.12',
  // Brief, one-line summary of the package.
  summary: 'Vuetify`s TreeShaking System and Sass-loader working on Meteor Default Bundler',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/Hernanm0g/meteor-vuetify-loader.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});


// Npm Dependencies
Npm.depends({
  vuetify: '2.4.2',
  vue: '2.6.12',
});

/**
 *
 * RegisterBuildPlugin
 * 
 *
 */

Package.registerBuildPlugin({
  name: 'meteorVuetifyLoader',
  use: ['caching-compiler@1.2.2', 'ecmascript@0.14.4'],
  sources: [
    // Compiles .sass files using dart-sass
    'plugins/vuetify-compile-sass.js',
    // Loads Vuetify Components on the fly
    'plugins/vuetify-process-sfc.js'
  ],
  npmDependencies: {
    'sass': '1.27.0',
    'ignore-styles': '5.0.1',
  },
});

Package.onUse(function(api) {
  api.versionsFrom('1.8');
  // We need this to call Package.registerBuildPlugin
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('akryum:vue-component@0.15.2');
});

// TODO: Unit testing
Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('zer0th:meteor-vuetify-loader');
  api.mainModule('meteor-vuetify-loader-tests.js');
});
