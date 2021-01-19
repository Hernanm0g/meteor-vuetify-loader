// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by meteor-vuetify-loader.js.
import { name as packageName } from "meteor/meteor-vuetify-loader";

// Write your tests here!
// Here is an example.
Tinytest.add('meteor-vuetify-loader - example', function (test) {
  test.equal(packageName, "zer0th:meteor-vuetify-loader");
});
