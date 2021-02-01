
/*=============================================>>>>>
=  Imports  =
===============================================>>>>>*/

import fs from 'fs'

/*= End of Imports =*/
/*=============================================<<<<<*/
/**
 * Name loadJSONFile
 * Description: Loads a json file from path and parses it
 * @param  {String} filePath
 */
export default function (filePath) {
  let content = fs.readFileSync(filePath);
  try {
    return JSON.parse(content);
  } catch (e) {
    console.log('Error: failed to parse ', filePath, ' as JSON');
    return {};
  }
}
