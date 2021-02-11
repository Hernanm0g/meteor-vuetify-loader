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


/**
 * Name: getFilePath
 * Description: Utility to get the system path for any file inside app.
 * @param  {Object} inputFile The inputFile provided by vue-meteor package
 * @param  {String} pathInPackage The file's path inside App's root dir
 */
const getFilePath = (inputFile, pathInPackage)=>{


  // Get file's sourceRoot
  let sourceRoot = Plugin.convertToOSPath(inputFile._resourceSlot.packageSourceBatch.sourceRoot)

  // if component is a Vuetify Component and is inside a Meteor package
  if(sourceRoot.includes("/packages/") && pathInPackage.includes("node_modules/vuetify")){

    // Look for it in apps node_modules
    sourceRoot = Plugin.convertToOSPath(process.env.PWD)
  } 
  
  const filePath = path.resolve(sourceRoot, pathInPackage)
  return filePath
}
/**
 * Name: getFilePath
 * Description: Utility to get the system path for any file inside app.
 * @param  {Object} inputFile The inputFile provided by vue-meteor package
 * @param  {String} pathInPackage The file's path inside App's root dir
 */
const getComponentPath = (component, group, config)=>{
  let componentPath = `vuetify/lib/components/${group}/index.js`
  const importStatement =  ` import {${component}}  from '${componentPath}'`
  return importStatement
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
const processSfc = ({source, basePath, inputFile, dependencyManager, config})=>{
  if(!basePath || !source || !dependencyManager) {
    return {
      script:source
    }
  }
  // console.log("processing sfc", inputFile.getPathInPackage(), inputFile.getArch());

  // We need the entire content of the file, not only the <script> tag content.
  const filePath =    getFilePath(inputFile, inputFile.getPathInPackage())
  const fileContent = fs.readFileSync( filePath, {encoding:"utf-8"} );
  // const fileContent = inputFile.getContentsAsString();
  // Lets extract Vuetify Alike components declared in the <template> tag
  let components =    extractComponents(fileContent)

  if(components.length){
    
    components =      components.filter(component=>componentsGroups.has(component))

    // newContent is the string thats going to be inserted in the script tag.
    let newContent = `\n/***** START meteor-vuetify-loader *****/`

    // ignore styles (only .sass) from 'vuetify-src'
    // if(inputFile.getPackageName()){
      newContent += `
        import MeteorVuetifyLoaderRegister from 'ignore-styles'
        import MeteorVuetifyLoaderPath from 'path'
        MeteorVuetifyLoaderRegister(
          ['.sass'], 
          (_, filename)=>{
            if(!filename.includes("/vuetify/src/")){
              module.exports = MeteorVuetifyLoaderPath.basename(filename)
            }
          }
        )\n`
    // }
    // console.log("components", components);
    for (const component of components) {

      // Check if component its not already imported in script
      const regex1 =  `${component}+(?=[\\s\\}]+from)`
      if(source.match(regex1)) continue

      // Insert into the script tag the import declaration for each vuetify component
      newContent+=    ` \n  ${getComponentPath(component, componentsGroups.get(component), config)}`

      // Add dependency So vue-component can track its cache
      dependencyManager.addDependency(
        getFilePath(
          inputFile, 
          `node_modules/vuetify/lib/components/${componentsGroups.get(component)}/index.js`,
          config
        )
      )
      
    }
    newContent += '\n/***** END meteor-vuetify-loader *****/\n'

    // Lets Add components declaration inside the components:{} prop of the SFC
    source = addComponentsToSfc(source, components, )

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