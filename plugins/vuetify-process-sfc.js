/**
 *
 * Sets Vuetify Compiler for script tag
 *
 * <script lang="vuetify">
 */


/*=============================================>>>>>
=  Imports  =
===============================================>>>>>*/

import {Meteor} from 'meteor/meteor'
global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}
import {processSfc} from './utils/vuetifySfcProcesser'

/*= End of Imports =*/
/*=============================================<<<<<*/

/*=============================================>>>>>
=  Export Vue Compiler as a global var  =
===============================================>>>>>*/


/**
 * 
 * Name: globalVueLangVuetify
 * Decription: akryum's vue-component package will use this variable:
 * 'gobal.vue.lang.vuetify` if the script tag of the Single File Component 
 * has attribute lang="vuetify".
 * 
 * <script lang="vuetify">.
 * 
 * Ref: vue-component/plugin/tag-handler.js@79
 *  let compile = global.vue.lang[lang]
 *  let {script, map, useBabel} = compile(sourceContent)
 * 
 * So this function must return an object with prop script, that is the
 * script content in the single File Component processed by this compiler and
 * that is going to be post processed by babel. Its here where this
 * compiler inserts: e.g: `import {Vapp} from 'vuetify/lib/components/Vapp' in
 * the script, Babel will do the rest.
 * 
 * And thats it!!, we must look for any vuetify component declared in the <template> tag,
 * such as <v-select> aand insert its import statement in the script. 
 * Then return the processed script
 * 
 * @param  {String} {source  Content of <script lang="vuetify"> tag without processing
 * @param  {Object} inputFile Object with source file info and methods
 * @param  {String} basePath} Path where the source file is located
 * 
 * @returns {Object} { source: <The script compiled>, useBabel:true}
 * 
 * @author <a href="mailto:hernnanmog@gmail.com">Zer0th</a>
 * @version 0.1.0
 */
const globalVueLangVuetify = function ({
  source,
  inputFile,
  basePath,
  // dependencyManager
}, cb) {
  processSfc({
    source,
    basePath,
    inputFile
  })
    .then(source=>{
      cb(
        null, 
        {
          script:source,
          useBabel:true
        }
      )
    })
    .catch(error=>{
      console.error(error)
      cb(error, null)
    })
}

// Now Set the global variable to be used by vue-component package
global.vue.lang.vuetify = Meteor.wrapAsync(globalVueLangVuetify)

/*= End of Export Vue Compiler as a global var =*/
/*=============================================<<<<<*/