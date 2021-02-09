# Vuetify Loader for Meteor
This Meteor package loads the Vuetify components as you use them (TreeShaking), reducing the final bundle size and enhancing your RealTime App performance, also bringing a better development experience.

https://vuetifyjs.com/en/features/treeshaking/

Vuetify's A La Carte System and sass-loader based on dart-sass can work now in Meteor without replacing Meteor's default Bundler with Webpack.

## Idea 
1. Since Vuetify's A La Carte System is tightly bounded to Webpack bundler, if you want to use this UI framework in a serious project, you'll need to remove Meteor's default bundler and compiler and replace it with Webpack Bundler, probably using Meteor's ardatan:webpack package. But this change will impact the way you develop in Meteor (especially in Mobile) in such way, that we all need a different approach, based on Meteor's own Bundler.
2. meteor+webpack is a "good" choice if you are an expert configuring webpack and babel and have time to experiment with them, but its a terrible choice for beginners or for rapid development, or Cordova Integration (Meteor+Webpack breaks HMR on Cordova).
3. fourseven:scss (the default meteor's sass-loader) uses node-sass (a deprecated sass compiler), and will not work properly with Vuetify's Sass files. So we need to create a SCSS/SASS compiler using dart-sass (sass npm package).
4. The .vue Single File Components Compiler, recognizes any vuetify component inside the template tag of your .vue file, and imports it's module, config and styles on the fly...
5. I know there are a lot of developers in search of a decent Meteor-Vuetify integration ¿Are we able to develop a Vuetify-Loader package with A la Carte System and TreeShaking working in Meteor Framework? Lets see... 

## Credits
* [@akryum](https://github.com/Akryum) of course. thanks for all the effort bringing vue to Meteor.
* [@fourseven:scss](https://github.com/Meteor-Community-Packages/meteor-scss), i've tweaked your package a little bit to replace node-sass with dart-sass. Thanks!!
* [@johnleider](https://github.com/johnleider) We all love Vuetify!!

## Warning
This package is in an early development stage, use it at your own risk.

If you find any problem with it, dont hesitate to improve it and make a PR, or submit an issue.

If it works for you, great!!, enjoy...

## Installation

1. Remove fourseven:scss if you have it: 
   
   `meteor remove fourseven:scss`
2. Add this package:
   
   `meteor add zer0th:meteor-vuetify-loader`
3. Add ignore-styles npm module to your main app:
   
   `meteor npm i ignore-syles`

4. Add akryum vue-component package if you havent already: 
   
   `meteor add akryum:vue-component`

5. Go o to .meteor/packages file and make sure `zer0th:meteor-vuetify-loader` is above `akryum:vue-component`
6. Make sure you are importing vuetify/lib instead of vuetify

```javascript
  import Vue from 'vue'

  import Vuetify from 'vuetify/lib' // <-- The magic goes here

  Vue.use(Vuetify)

  const opts = {}
  export default new Vuetify(opts)
```
5. **Important !!!**: In order to load Vuetify Components on the fly in your .vue files, you must add a "lang" attribute to the 'script' tag. like this:
```html
  <template>
    <v-button> <!-- The VButton component will be loaded on the fly-->   
      Anything
    </v-button>    
  <template>    
  <script lang="js"> //  <--- the magic goes here, you can use 'ts' as well.
    export default {
      name:"ComponentName",
      data: ()=>({
        someData: ""
      })
    }
  </script>
```
6. Enjoy!!... Or improve it!!

## Importing SFC from packages
If you have your .vue Single File Components inside Meteor packages, check this out:

1. Ensure that vuetify module its installed in the app's node_modules. If not, use: 
   
   `meteor npm i vuetify`
2. You dont need to install Vuetify or Meteor-vuetify-loader (this package) in your Meteor packages, as the compilers will work anywhere.
3. Make sure your Meteor packages that are exporting SFCs use akryum's vue-component package
   
   ```javascript

    Package.onUse(function(api) {
      ...
      api.use('akryum:vue-component@0.15.2');
      ...
    });

   ```
4. Put the lang attribute inside the script of your package's SFC.
    ```html
    <script lang="js"> //  <--- the magic goes here, you can use 'ts' as well.
      export default {
        name:"YourPackageComponent",
        ...anythingElse
      }
    </script>
    ```

