/**
 *
 * vuetifySfcProcesser
 * SinfleFileComponent processer for meteor's integration with vuetify A La Carte's System.
 * Load components as you use them.
 * 
 * strongly inspired in vuetify-loader: https://github.com/vuetifyjs/vuetify-loader
 * 
 * @author <a href="mailto:hernanmog@gmail.com">Zer0th</a>
 * @version 0.1.0
 */


/*=============================================>>>>>
=  Imports  =
===============================================>>>>>*/

import extractComponents                from './extractComponents'
import addComponentsToSfc               from './addComponentsToSfc'
import {components as componentsGroups} from './componentsGroups'


/*= End of Imports =*/
/*=============================================<<<<<*/
/**
 * Name: processSfc
 * Description: Receives a Sfc source, path and some methods,
 * and returns a processed Script that includes imports statements
 * for vuetify components and declaration of each one inside the components prop.
 * 
 * TODO: Vue3 Composition API??
 * 
 * @param  {String} {source   The Script Tag content of the SFC
 * @param  {String} basePath  The path of the SFC in the files System
 * @param  {Object} inputFile} Some file methods provided by the vue-component package and the Meteor compiler plugin
 *  
 */
const processSfc = async ({source, basePath, inputFile})=>{

  if(!basePath) {
    return source
  }

  // We need the entire content of the file, not only the <script> tag content.
  const fileContent = inputFile.getContentsAsString()
  // Lets extract Vuetify Alike components declared in the <template> tag
  let components = extractComponents(fileContent)

  if(components.length){
    // newContent is the string thats going to be inserted in the script tag.
    let newContent = `\n/***** START meteor-vuetify-loader *****/`

    components = components.filter(v=>v!=="V")

    for (const component of components) {

      // Discard components that are not in vuetify's dir
      if(!componentsGroups.has(component)) continue

      // Insert into the script tag the import declaration for each vuetify component
      newContent+= `\n import { ${component} }  from 'vuetify/lib/components/${componentsGroups.get(component)}'`
    }
    newContent += '\n/***** END meteor-vuetify-loader *****/\n'

    // Lets Add components declaration inside the components:{} prop of the SFC
    source = addComponentsToSfc(source, components)

    // Put the imports statements at the beggining of the script tag
    source = newContent + source
    
  }
  return source
}

export {
  processSfc
}