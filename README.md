# Vuetify Loader for Meteor

## Idea 
1. Since Vuetify's A La Carte System is tightly bounded to Webpack bundler, if you want to use this UI framework in a serious project, you'll need to remove Meteor's default bundler and compiler and replace it with Webpack Bundler, probably using Ardatan's Meteor-Webpack package. But this change will impact the way you develop in Meteor (especially in Mobile) in such a way, that we need a different approach.
2. Meteor with Webpack is a good choice if you are an expert configuring webpack and babel and have time to experiment, but its a terrible choice for beginners or for rapid development.
3. fourseven:scss uses node-sass (a deprecated sass compiler), and will not work properly with Vuetify Sass files. So we need to create a SCSS compiler using dart-sass (similar to sass-loader).
4. .vue Single Component Files, must be compiled in such way, that if they find a vuetify component inside the template tag, they must load and import it's module, config and styles.
5. ¿Are we able to develop a Vuetify-Loader package with A la Carte System in Meteor Framework? Lets see... 