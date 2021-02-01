/**
 *
 * extractComponents
 * 
 * Module to extract Vuetify alike components inside the <template> tag.
 * This means: Anything like <v-something> can be a Vuetify component.
 * So lets extract the possible Vuetify Components.
 * @author <a href="mailto:hernanmog@gmail.com">Zer0th</a>
 * @version 0.1.0
 */

 
/*=============================================>>>>>
=  Imports  =
===============================================>>>>>*/
 
import kebabToPascal from "./kebabToPascal"
const uniq = Npm.require("lodash/uniq")

/*= End of Imports =*/
/*=============================================<<<<<*/

/**
 * 
 * Name: extractComponents
 * Description: Returns an array of possible vuetify components inside source String
 * 
 * @param  {String} source The <template> tag content
 * @returns {String[]} All the components inside source that matches vuetify alike
 * 
 */
export default (source)=>{

  // First lets extract the <template> content from the source
  const len = source.length
  const templateIndex = source.indexOf("<template")
  let scriptIndex = source.indexOf("<script")
  if(scriptIndex == -1){
    scriptIndex = len
  }
  let styleIndex = source.indexOf("<style")
  if(styleIndex== -1){
    styleIndex = len
  }

  const endingIndex = Math.min(scriptIndex, styleIndex)
  let possibleComponents = source.slice(templateIndex, endingIndex)

  // Lets extract the matching components such as
  // <v-something>
  // <v-something attr="anything">
  // <v-something
  //    attr="anything"      
  // >
  possibleComponents = possibleComponents.match(/<v-.+?[\s,>]/g) || []
  
  possibleComponents = possibleComponents.map(v=> {
    // remove the opening <
    v= v.replace("<v-", "v-")
    // Remove closing > and spaces
    v= v.replace(">", "").trim()
    // Convert to Pascal: v-app-bar => VAppBar
    return kebabToPascal(v)
  })

  // Dont repeat components
  possibleComponents = uniq(possibleComponents)
  return possibleComponents

}