define(function(require) {
  var FI = require('./locale/FI')
  var EN = require('./locale/EN')
  var AU = require('./locale/AU')
  var ET = require('./locale/ET')
  var RU = require('./locale/RU')
  var SV = require('./locale/SV')
  var LV = require('./locale/LV')
  var DateLocale = {
    FI: FI,
    EN: EN,
    AU: AU,
    ET: ET,
    RU: RU,
    SV: SV,
    LV: LV
  }

  DateLocale.fromArgument = function(stringOrObject) {
    if(typeof stringOrObject === 'string')
      return DateLocale[stringOrObject.toUpperCase()]
    else return stringOrObject
  }

  return DateLocale
})
