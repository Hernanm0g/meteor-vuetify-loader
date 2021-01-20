/**
 * Name addComponentsToScf
 * Description: This function inserts into the SCF components prop, each of the
 * components imported by the script.
 * 
 * For instance:
 * components = ["VApp", "VAlert"]
 *  source = `
 *    export default {
 *      name: "SomeComponent"
 *    }
 * `
 * Results in
 * export default {
 *    components: {
 *      VApp,
 *      VAlert
 *    },
 *    name:"SomComponent"   
 * }
 * 
 * @param  {String} source Stript tag contents
 * @param  {String[]} components Components Names, to be imported
 * 
 * @return {String} The processed Stript tag content
 */
export default (source, components)=>{

  // First, lets see if the script already has the components prop setted
  let componentsPropMatch =  source.match(/components.+?{/g)

  if(!componentsPropMatch){
    // Lets insert the components prop to module exports

    // ¿Where is export default?
    const exportMatch = source.match(/export.+?default.+?{/g)[0]
    const exportIndex = source.indexOf(exportMatch) + exportMatch.length

    // Add `components: {},` to the module content
    source = [source.slice(0, exportIndex), `\ncomponents: {\n},` , source.slice(exportIndex)].join('');
    componentsPropMatch = source.match(/components.+?{/g)
  }
  componentsPropMatch = componentsPropMatch[0]

  let componentsPropIndex = source.indexOf(componentsPropMatch) + componentsPropMatch.length

  // Discard components already declared in components Object
  components = components.filter(v=>{
    const regex2 =  `${v}+(?=[\\:,\\,,\\s])`
    return !source.slice(componentsPropIndex).match(regex2)
  })
  // Insert each component Name into the components Object
  source = [
    source.slice(0, componentsPropIndex), 
    ...components.map(v=>`\n${v},`) , 
    source.slice(componentsPropIndex)
  ].join('');
  return source

}