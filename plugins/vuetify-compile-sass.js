/**
 *
 * Sets Sass Compiler for Integration with Vuetify
 *
 * This compiler is strongly inspired by fourseven:scss
 * 
 * Credits goes for: 
 * fourseven:scss. https://github.com/Meteor-Community-Packages/meteor-scss
 * Firfi: https://github.com/Meteor-Community-Packages/meteor-scss/pull/296
 * 
 * Basically, fourseven is using node-sass (deprecated )as the sass-compiler, and Vuetify
 * is tightly bounded to dart-sass (maintained) compiler
 * 
 * This package is using dart-sass as the sass-compiler and did a few tweaks fo
 * fourseven:scss
 * 
 * !important: run `meteor remove fourseven:scss` before adding this package
 * 
 */



/*=============================================>>>>>
=  Imports  =
===============================================>>>>>*/

import sass from 'sass';
import nodeSass from 'node-sass';
import { promisify } from 'util';
const path = Plugin.path;
const fs = Plugin.fs;
const nodeFs = require("fs")


/*= End of Imports =*/
/*=============================================<<<<<*/

var done = false;

// const compileSass = promisify(sass.render); 
// We will use sass.renderSync as its 3 times faster than sass.render
const compileSass = sass.renderSync

// To keep fourseven:scss compatibility, we must use alse
// node-sass for non-vuetify .scss
const compileNodeSass = promisify(nodeSass.render)
let _includePaths;


/*--------  Register Plugin as Meteor demands  --------*/
Plugin.registerCompiler(
  {
    extensions: ['scss', 'sass'], // Will compile .sass and .scss files
  }, 
  () => new SassCompiler()
);



/*=============================================>>>>>
=  Windows helper funs  =
===============================================>>>>>*/

// If you are using Windows, you'll probably want to use this funs: 

/**
 * Name: toPosixPath
 * Description: Converts partial path to Windows alike path: C:\...
 * 
 * @param  {} p
 * @param  {} partialPath
 */
// const toPosixPath = function toPosixPath(p, partialPath) {
//   // Sometimes, you can have a path like \Users\IEUser on windows, and this
//   // actually means you want C:\Users\IEUser
//   if (p[0] === "\\" && (!partialPath)) {
//     p = process.env.SystemDrive + p;
//   }

//   p = p.replace(/\\/g, '/');
//   if (p[1] === ':' && !partialPath) {
//     // transform "C:/bla/bla" to "/c/bla/bla"
//     p = `/${p[0]}${p.slice(2)}`;
//   }

//   return p;
// };

// const convertToStandardPath = function convertToStandardPath(osPath, partialPath) {
//   if (process.platform === "win32") {
//     return toPosixPath(osPath, partialPath);
//   }

//   return osPath;
// }

/*= End of Windows helper funs =*/
/*=============================================<<<<<*/


/*=============================================>>>>>
=  SassCompiler  =
===============================================>>>>>*/


/**
 *
 * Name: SassCompiler
 * Description: Convert .sass and .scss file contents to .css. It also resolves @import
 * statements inside .sass files
 * 
 */

// eslint-disable-next-line no-undef
class SassCompiler extends MultiFileCachingCompiler {
  constructor() {
    super({
      compilerName: 'sass',
      defaultCacheSize: 1024*1024*10,
    });
  }

  getCacheKey(inputFile) {
    return inputFile.getSourceHash();
  }

  compileResultSize(compileResult) {
    return compileResult.css.length +
      this.sourceMapSize(compileResult.sourceMap);
  }

  // The heuristic is that a file is an import (ie, is not itself processed as a
  // root) if it matches _*.sass, _*.scss
  // This can be overridden in either direction via an explicit
  // `isImport` file option in api.addFiles.
  isRoot(inputFile) {
    const fileOptions = inputFile.getFileOptions();

    // eslint-disable-next-line no-prototype-builtins
    if (fileOptions.hasOwnProperty('isImport')) {
      return !fileOptions.isImport;
    }

    const pathInPackage = inputFile.getPathInPackage();
    return !this.hasUnderscore(pathInPackage);
  }

  // Check if file must be processed with dart sass
  processWithDartSass(inputFile){
    return inputFile.getPathInPackage().includes("node_modules/vuetify") 
    // || inputFile.getPathInPackage().includes("/styles/vuetify/") 
  }

  // Overrides MultiFileCachingCompile
  // Motivation: Integration with relative imports paths, such as 
  // those used in Vuetify
  getAbsoluteImportPath(inputFile) {
    // If Vuetify...
    if(this.processWithDartSass(inputFile)){
      return inputFile.getPathInPackage();
    } else {
      return super.getAbsoluteImportPath(inputFile)
    }
  }

  hasUnderscore(file) {
    return path.basename(file).startsWith('_');
  }

  compileOneFileLater(inputFile, getResult) {
    // console.log("file Later", inputFile.getDisplayPath(), "FOR:", inputFile.getArch())
    inputFile.addStylesheet({
      path: inputFile.getPathInPackage(),
    }, async () => {
      try {
        // console.log("Async Compiling",inputFile.getDisplayPath(), "FOR:", inputFile.getArch())
        const result = await getResult();
        return result && {
          data: result.css,
          sourceMap: result.sourceMap,
        };
      } catch (error) {
        throw error
      }
      
    });
  }

  // async compileOneFile(inputFile, allFiles) {
  async compileOneFile(inputFile, allFiles) {
    const referencedImportPaths = [];

    var totalImportPath = [];
    var sourceMapPaths = [`.${inputFile.getDisplayPath()}`];

    const addUnderscore = (file) => {
      if (!this.hasUnderscore(file)) {
        file = path.join(path.dirname(file), `_${path.basename(file)}`);
      }
      return file;
    }

    const getRealImportPath = (importPath) => {
      const isAbsolute = importPath.startsWith('/');

      //SASS has a whole range of possible import files from one import statement, try each of them
      const possibleFiles = [];

      //If the referenced file has no extension, try possible extensions, starting with extension of the parent file.
      let possibleExtensions = ['scss','sass','css'];

      if(! importPath.match(/\.s?(a|c)ss$/)){
        possibleExtensions = [
          inputFile.getExtension(),
          ...possibleExtensions.filter(e => e !== inputFile.getExtension())
        ]
        for (const extension of possibleExtensions){
          possibleFiles.push(`${importPath}.${extension}`);
        }
      }else{
        possibleFiles.push(importPath);
      }

      //Try files prefixed with underscore
      for (const possibleFile of possibleFiles) {
        if (! this.hasUnderscore(possibleFile)) {
          possibleFiles.push(addUnderscore(possibleFile));
        }
      }

      //Try if one of the possible files exists
      for (const possibleFile of possibleFiles) {
        if ((isAbsolute && fileExists(possibleFile)) || (!isAbsolute && allFiles.has(possibleFile))) {
          return { absolute: isAbsolute, path: possibleFile };
        }
      }

      //Nothing found...
      return null;

    };

    //Handle import statements found by the sass compiler, used to handle cross-package imports
    const importer = function(url, prev) {
      if (!totalImportPath.length) {
        totalImportPath.push(prev);
      }

      if (totalImportPath[totalImportPath.length] !== prev) {
        //backtracked, splice of part we don't need anymore
        // (XXX: this might give problems when multiple parts of the path have the same name)
        totalImportPath.splice(totalImportPath.indexOf(prev) + 1, totalImportPath.length);
      }

      let importPath = url;
      for (let i = totalImportPath.length - 1; i >= 0; i--) {
        if (importPath.startsWith('/') || importPath.startsWith('{')) {
          break;
        }
        importPath = path.join(path.dirname(totalImportPath[i]),importPath);
      }
      totalImportPath.push(url);

      let accPosition = importPath.indexOf('{');
      if (accPosition > -1) {
        importPath = importPath.substr(accPosition,importPath.length);
      }

      let parsed = getRealImportPath(importPath);
        if (!parsed) {
          parsed = _getRealImportPathFromIncludes(url, getRealImportPath);
        }
        if (!parsed) {
          //Nothing found...
          throw new Error(`File to import: ${url} not found in file: ${totalImportPath[totalImportPath.length - 2]}`);
        }

        if (parsed.absolute) {
          sourceMapPaths.push(parsed.path);
 
          return { contents: fs.readFileSync(parsed.path, 'utf8') } 
        } else {
          referencedImportPaths.push(parsed.path);
          sourceMapPaths.push(decodeFilePath(parsed.path));

          return { contents: allFiles.get(parsed.path).getContentsAsString() }
        }

    }

    //Start compile sass (async)
    const options = {
      sourceMap: true,
      sourceMapContents: true,
      sourceMapEmbed: false,
      sourceComments: false,
      omitSourceMapUrl: true,
      sourceMapRoot: '.',
      indentedSyntax : inputFile.getExtension() === 'sass',
      outFile: `.${inputFile.getBasename()}`,
      importer,
      includePaths: [],
      precision: 10,
      outputStyle: "compressed"
    };

    
    options.data = inputFile.getContentsAsBuffer().toString('utf8');

    // Add user variables if exists file and current file is _variables
    // console.log(inputFile.getPathInPackage());

    _prepareNodeSassOptions()
    if(this.processWithDartSass(inputFile) && _includePaths && _includePaths.length){

      let userVariablesPath = _includePaths.find(v=>{
        const possiblePath = process.env.PWD + (v.replace("{}", "")) + "user_variables.scss"
        return fileExists(possiblePath) 
      })

      if(userVariablesPath){
        options.data = [
          `@import 'user_variables.scss'\n` , 
          options.data
        ].join('');
      }
    }
    
    options.file = this.getAbsoluteImportPath(inputFile);


    //If the file is empty, options.data is an empty string
    // In that case options.file will be used by node-sass,
    // which it can not read since it will contain a meteor package or app reference '{}'
    // This is one workaround, another one would be to not set options.file, in which case the importer 'prev' will be 'stdin'
    // However, this would result in problems if a file named stdín.scss would exist.
    // Not the most elegant of solutions, but it works.
    if (!options.data.trim()) {
      options.data = '$fakevariable_ae7bslvbp2yqlfba : blue;';
    }
    let output;
    try {
      // if is vuetify
      //use sass-loader
      if(this.processWithDartSass(inputFile)){
        // console.log("DartSass Processing:", inputFile.getDisplayPath(), inputFile.getArch());
        output = compileSass(options);
      } else{
        // console.log("NodeSass Processing:", inputFile.getDisplayPath(), "FOR:", inputFile.getArch());
        output = await compileNodeSass(options)
      }
    } catch (e) {
      inputFile.error({
        message: `Scss compiler error: ${e.formatted},\n`,
        sourcePath: inputFile.getDisplayPath()
      });
      return null;
    }
    //End compile sass

    //Start fix sourcemap references
    if (output.map) {
      const map = JSON.parse(output.map.toString('utf-8'));
      map.sources = sourceMapPaths;
      output.map = map;
    }
    //End fix sourcemap references
    
    if (!done){
      done=true
    }
    const compileResult = { css: output.css.toString('utf-8'), sourceMap: output.map };
    return { compileResult, referencedImportPaths };
  }

  addCompileResult(inputFile, compileResult) {
    inputFile.addStylesheet({
      data: compileResult.css,
      path: `${inputFile.getPathInPackage()}.css`,
      sourceMap: compileResult.sourceMap,
    });
  }
}

/*= End of SassCompiler =*/
/*=============================================<<<<<*/


function _getRealImportPathFromIncludes(importPath, getRealImportPathFn){
  _prepareNodeSassOptions();
  
  let possibleFilePath, foundFile;
  
  for (let includePath of _includePaths) {
    possibleFilePath = path.join(includePath, importPath);
    foundFile = getRealImportPathFn(possibleFilePath);
    if (foundFile) {
      return foundFile;
    }
  }

  return null;
}

/**
 * If not loaded yet, load configuration and includePaths.
 * @private
 */
function _prepareNodeSassOptions() {
  const config = _loadConfigurationFile();
  if (typeof _includePaths === 'undefined' && config.includePaths) {
    _loadIncludePaths(config);
  }
}

/**
 * Extract the 'includePaths' key from specified configuration, if any, and
 * store it into _includePaths.
 * @param config
 * @private
 */
function _loadIncludePaths(config) {
  // Extract includePaths, if any
  const includePaths = config['includePaths'];

  if (includePaths && Array.isArray(includePaths)) {
    _includePaths = includePaths;
  } else {
    _includePaths = [];
  }
}

/**
 * Read the content of 'scss-config.json' file (if any)
 * @returns {{}}
 * @private
 */
function _loadConfigurationFile() {
  return _getConfig('scss-config.json') || {};
}

/**
 * Build a path from current process working directory (i.e. meteor project
 * root) and specified file name, try to get the file and parse its content.
 * @param configFileName
 * @returns {{}}
 * @private
 */
function _getConfig(configFileName) {
  const appdir = process.env.PWD || process.cwd();
  const custom_config_filename = path.join(appdir, configFileName);
  let userConfig = {};

  if (fileExists(custom_config_filename)) {
    userConfig = fs.readFileSync(custom_config_filename, {
      encoding: 'utf8'
    });
    userConfig = JSON.parse(userConfig);
  } else {
    //console.warn('Could not find configuration file at ' + custom_config_filename);
  }
  return userConfig;
}

function decodeFilePath (filePath) {
  const match = filePath.match(/{(.*)}\/(.*)$/);
  if (!match) {
    throw new Error(`Failed to decode sass path: ${filePath}`);
  }

  if (match[1] === '') {
    // app
    return match[2];
  }

  return `packages/${match[1]}/${match[2]}`;
}

function fileExists(file) {
  if (fs.statSync){
    try {
      fs.statSync(file);
    } catch (e) {
      return false;
    }
    return true;
  } else if (fs.existsSync) {
    return fs.existsSync(file);
  }
}