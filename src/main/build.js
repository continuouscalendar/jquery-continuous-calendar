({
  appDir  : "",
  baseUrl : ".",
  name    : '../../node_modules/almond/almond',
  include: ['jquery.continuousCalendar'],
  insertRequire: ['jquery.continuousCalendar'],
  out     : '../../build/jquery.continuousCalendar-latest-min.js',
  urlArgs : undefined,
  paths   : {
    jquery                : 'jqueryStub'
  },
  wrap:{
    startFile:'wrapStart.frag',
    endFile:'wrapEnd.frag'
  }
})
