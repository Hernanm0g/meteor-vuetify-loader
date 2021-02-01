
/*=============================================>>>>>
=  Imports  =
===============================================>>>>>*/

import path from 'path'
import fs from 'fs'
import loadJSONFile from './loadJson'

/*= End of Imports =*/
/*=============================================<<<<<*/

const CONFIG_FILE_NAME = 'meteor-vuetify-loader.config.json';
const configFile = path.resolve(process.cwd(), CONFIG_FILE_NAME);
let config = {}
if (fs.existsSync(configFile)) {
  config = loadJSONFile(configFile) || {}
}

export default config