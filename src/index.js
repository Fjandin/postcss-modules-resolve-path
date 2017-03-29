import postcss from 'postcss';
import path from 'path';
import fs from 'fs';

const declFilter = /^composes$/;
const matchImports = /^(.+?\s+from\s+)(?:'([^']+)'|"([^"]+)"|(global))$/;

function processOptions(options) {
  const paths = options.paths;
  return paths;
}
  
function replacePaths(searchPath, searchPaths) {
  if(searchPath.indexOf('.') == 0 || searchPath.indexOf('/') == 0) {
    return searchPath;
}

  for(let i  = 0; i < searchPaths.length; i++) {
    let test = searchPaths[i];
    let fullPath = path.join(test, searchPath);

    if(fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return searchPath;
}

function processDecl(decl, searchPaths) {
  const matches = decl.value.match( matchImports );

  if (matches) {
    const [/*match*/, beforePath, singleQuotePath, doubleQuotePath] = matches;
    const pathQuote = doubleQuotePath ? '"' : '\'';
    const searchPath = singleQuotePath || doubleQuotePath;
    const newPath = replacePaths(searchPath, searchPaths);

    decl.value = `${beforePath}${pathQuote}${newPath}${pathQuote}`;
  }
}

export default postcss.plugin( 'postcss-modules-resolve-path', (options = {}) => {
  const searchPaths = processOptions(options);

  return css => {
    // find any declaration that looks like a 'composes'
    css.walkDecls(declFilter, decl => processDecl(decl, searchPaths));
  };
});
