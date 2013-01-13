({
  appDir  : "",
  baseUrl : ".",
  name    : '../lib/almond',
  include: ['jquery.continuousCalendar'],
  insertRequire: ['jquery.continuousCalendar'],
  out     : '../../build/jquery.continuousCalendar-latest.js',
  urlArgs : undefined,
  paths   : {
    jquery                : 'jqueryStub',
    'jquery.tinyscrollbar': 'jquery.tinyscrollbar-1.66/jquery.tinyscrollbar'
  },
  wrap:{
    startFile:'wrapStart.js',
    endFile:'wrapEnd.js'
  }
})
