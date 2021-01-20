/**
 *
 * Get All Components Groups
 * 
 * Description: Not all Vuetify components are in separated Modules, for instance, 
 * the VAppBarNavIcon has not a module for its own, it is inside VAppBar module, 
 * so this module exports a Map called components, like:
 * 
 * {
 *  // ComponentName    =>  ModuleName
 *    "VAppBar"         => "VAppBar"
 *    "VAppBarNavIcon"  => "VAppBar"
 * }
 * 
 * So basically, it declares in which module is every component, so you can 
 * do things like: 
 * import {ComponentName} from 'vuetify/lib/components/ModuleName'
 *
 * 
 * Strongly inspired by vuetify-loader npm package
 * All credits go to them: https://github.com/vuetifyjs/vuetify-loader
 */

/*=============================================>>>>>
=  Imports  =
===============================================>>>>>*/

import {readdirSync, statSync}  from 'fs'
import {join, resolve}          from 'path'
import 'ignore-styles' // We dont need to import Styles, the absence of this line will cause problems
/*= End of Imports =*/
/*=============================================<<<<<*/
const components =  new Map()
const path =        resolve("")

// Just load components from app's node_modules.
if(!path.includes("meteor-vuetify-loader")){

  let dir = 'vuetify/es5/components'; // As we use require, we need to look up inside es5 dir
  dir     = `node_modules/${dir}`

  // Lets list all components directories
  readdirSync(dir).forEach(group => {

    // Exclude anything but directories
    if (!statSync(join(dir, group)).isDirectory()) return

    // Require the default module, where all the subModules will be listed
    // Here's why ignore-styles is important
    const component = Npm.require(`vuetify/es5/components/${group}`).default

    // $_vuetify_subcomponents tells as which subComponents this module includes
    // eslint-disable-next-line no-prototype-builtins
    if (component.hasOwnProperty('$_vuetify_subcomponents')) {

      Object.keys(component.$_vuetify_subcomponents)
        .forEach(name => {
          // Attach every subComponent to its group reference
          components.set(name, group)
        })

    } else {

      // Its a single Component Module, lets include it too.
      components.set(group, group)

    }

    // TODO: Honestly, i dont know if i should include de decache here. Lets see what happens

    // This is required so that groups picks up dependencies they have to other groups.
    // For example VTabs depends on the style from VSlideGroup (VSlideGroup.sass).
    // As VSlideGroup will be loaded before (alphabetically), `Module._load` wouldn't be called for it when processing VTabs (as it would be already in the require cache).
    // By busting the require cache for each groups we unsure that when loading VTabs we do call `Module._load` for `VSlideGroup.sass` and it gets added to the dependencies.

    // decache(`vuetify/es5/components/${group}`)
  })
}

export {
  components
}


