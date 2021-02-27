/**
 *
 * Processes .vue files to add vuetify components when
 * script tag has attribute lang="js"
 *
 * <script lang="js">
 */


/*=============================================>>>>>
=  Imports  =
===============================================>>>>>*/

global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}
import {processSfc} from './utils/vuetifySfcProcesser'
import config from './utils/loadConfig'

/*= End of Imports =*/
/*=============================================<<<<<*/

/*=============================================>>>>>
=  Export Vue Compiler as a global var  =
===============================================>>>>>*/

/**
 * 
 * Name: globalVueLangVuetify
 * Decription: akryum's vue-component package will use this variable
 * 'gobal.vue.lang.vuetify` if the script tag of the Single File Component 
 * has attribute lang="js".
 * 
 * <script lang="js">.
 * 
 * Reference: vue-component/plugin/tag-handler.js@79
 *  let compile = global.vue.lang[lang]
 *  let {script, map, useBabel} = compile(sourceContent)
 * 
 * So this function must return an object with the property script, that is, the
 * script content in the single File Component processed by this compiler and
 * that is going to be post-processed by babel. Its here where this
 * compiler inserts: e.g: `import {Vapp} from 'vuetify/lib/components/VApp' in
 * the script, Babel will do the rest.
 * 
 * And thats it!!, we must look for any vuetify component declared in the <template> tag,
 * such as <v-select> and insert its import statement in the script. 
 * Then return the processed script
 * 
 * @param  {String} {source  Content of <script lang="js"> tag without processing
 * @param  {Object} inputFile Object with source file info and methods
 * @param  {String} basePath Path where the source file is located
 * @param  {Object} dependencyManager} Object supplied by vue-meteor to add new Dependencies
 * 
 * @returns {String}  {source  <The script compiled>
 * @returns {Boolean} useBabel} Default to true
 * 
 * @author <a href="mailto:hernnanmog@gmail.com">Zer0th</a>
 * @version 0.1.0
 */
const globalVueLangVuetify = function ({
  source,
  inputFile,
  basePath,
  dependencyManager
}) {
  // Use process SFC to generate the script tag
  // console.log("input", source);
  const {script} = processSfc({
    source,
    basePath,
    inputFile,
    dependencyManager,
    config
  })
  // console.log("output:", script);
  return {
    script,
    useBabel:true
  }
  
}

// Now Set the global variable to be used by vue-component package
global.vue.lang.vuetify = globalVueLangVuetify
// In order to keep vetur working. We need to use lang="js"
global.vue.lang.js = globalVueLangVuetify
// ts as well
global.vue.lang.ts = globalVueLangVuetify

/*= End of Export Vue Compiler as a global var =*/
/*=============================================<<<<<*/