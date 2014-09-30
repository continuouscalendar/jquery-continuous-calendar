({
  appDir  : "",
  baseUrl: "../main",
  name    : 'jquery.continuousCalendar',
  include: [
    'jquery.tinyscrollbar-1.66/jquery.tinyscrollbar',
    'DateLocale',
    'DateFormat'
  ],
  out     : '../../build/jquery.continuousCalendar-latest-min.js',
  urlArgs : undefined,
  paths   : {
    jquery                : '../build/jqueryStub'
  },
  optimize:'none',
  onModuleBundleComplete: function (data) {
    var fs = module.require('fs'),
      amdclean = module.require('amdclean'),
      outputFile = data.path,
      cleanedCode = amdclean.clean({
        'filePath': outputFile,
        transformAMDChecks: false
      });

    fs.writeFileSync(outputFile, cleanedCode);
  }
})
