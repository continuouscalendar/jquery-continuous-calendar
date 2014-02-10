({
  appDir       : "",
  baseUrl      : ".",
  name         : '../node_modules/almond/almond',
  include      : ['playground'],
  insertRequire: ['playground'],
  out          : 'playground-min.js',
  urlArgs      : undefined,
  paths        : {
    jquery                : '../src/build/jqueryStub',
    'jquery.tinyscrollbar': '../src/main/jquery.tinyscrollbar-1.66/jquery.tinyscrollbar'
  }
})
