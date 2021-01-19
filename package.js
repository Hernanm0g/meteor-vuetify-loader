Package.describe({
  name: 'zer0th:meteor-vuetify-loader',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Vuetify`s A La Carte System and Vuetify-loader working on Meteor Default Bundler',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

/**
 *
 * RegisterBuildPlugin -> sassCompiler
 * 
 * Needed to put vuetify's .sass into disk-cache.
 * That way, styles resources will only be added once
 * and on the fly (as the client request it).
 * 
 * Uses dart-sass (sass) instead of node-sass (deprecated and unmantained)
 *
 */

Package.registerBuildPlugin({
  name: 'meteorVuetifyLoader',
  use: ['caching-compiler@1.2.2', 'ecmascript@0.14.4'],
  sources: [
    'plugins/vuetify-compile-sass.js',
    'plugins/vuetify-process-sfc.js'
  ],
  npmDependencies: {
    'sass': '1.27.0',
    'vuetify': '2.4.2',
    'ignore-styles': '5.0.1'
  },
});

Package.onUse(function(api) {
  api.versionsFrom('1.8');
  // We need this to call Package.registerBuildPlugin
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('akryum:vue-component@0.15.2');
  api.use('typescript');
});

// TODO: Unit testing
Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('meteor-vuetify-loader');
  api.mainModule('meteor-vuetify-loader-tests.js');
});
