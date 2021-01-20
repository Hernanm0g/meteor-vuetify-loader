/**
 *
 * vuetifySfcProcesser
 * SinfleFileComponent processer for meteor's integration with vuetify A La Carte's System.
 * Loads components as are mounted by client.
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
import path from 'path'
import fs from 'fs'


/*= End of Imports =*/
/*=============================================<<<<<*/


const getFilePath = (inputFile, pathInPackage)=>{
  const sourceRoot = Plugin.convertToOSPath(inputFile._resourceSlot.packageSourceBatch.sourceRoot)
  const filePath = path.resolve(sourceRoot, pathInPackage)
  return filePath
}
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
const processSfc = ({source, basePath, inputFile, dependencyManager})=>{
  
  if(!basePath) {
    return source
  }

  // We need the entire content of the file, not only the <script> tag content.
  // Dont use inputFile.getContentsAsString as it will load the previous file,
  // which results in a wrong compiling. Better read the current content of the
  // file in the fiesystem
  const filePath = getFilePath(inputFile, inputFile.getPathInPackage())
  const fileContent = fs.readFileSync( filePath, {encoding:"utf-8"} );

  // Lets extract Vuetify Alike components declared in the <template> tag
  let components =    extractComponents(fileContent)

  if(components.length){
    
    components = components.filter(component=>componentsGroups.has(component))

    // newContent is the string thats going to be inserted in the script tag.
    let newContent = `\n/***** START meteor-vuetify-loader *****/`

    for (const component of components) {

      // Check if component its not already imported in script
      const regex1 =  `${component}+(?=[\\s\\}]+from)`
      if(source.match(regex1)) continue

      // Insert into the script tag the import declaration for each vuetify component
      newContent+= `\n import {${component}}  from 'vuetify/lib/components/${componentsGroups.get(component)}/index.js'`
      dependencyManager.addDependency(getFilePath(inputFile, `node_modules/vuetify/lib/components/${componentsGroups.get(component)}/index.js`))
      
    }
    newContent += '\n/***** END meteor-vuetify-loader *****/\n'

    // Lets Add components declaration inside the components:{} prop of the SFC
    source = addComponentsToSfc(source, components)

    // Put the imports statements at the beggining of the script tag
    source = newContent + source
    
  }
  return {
    script:source
  }
}

export {
  processSfc
}