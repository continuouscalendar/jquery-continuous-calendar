({
  appDir       : "",
  baseUrl      : ".",
  name         : '../src/lib/almond',
  include      : ['playground'],
  insertRequire: ['playground'],
  out          : 'playground-min.js',
  urlArgs      : undefined,
  paths        : {
    jquery                : '../src/main/jqueryStub',
    'jquery.tinyscrollbar': '../src/main/jquery.tinyscrollbar-1.66/jquery.tinyscrollbar'
  }
})
