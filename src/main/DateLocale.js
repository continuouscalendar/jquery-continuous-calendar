define(function(require) {
  var AU = require('./locale/AU')
  var EN = require('./locale/EN')
  var ET = require('./locale/ET')
  var FI = require('./locale/FI')
  var LV = require('./locale/LV')
  var RU = require('./locale/RU')
  var SV = require('./locale/SV')
  var DateLocale = {
    AU: AU,
    EN: EN,
    ET: ET,
    FI: FI,
    LV: LV,
    RU: RU,
    SV: SV
  }

  DateLocale.fromArgument = function(stringOrObject) {
    if(typeof stringOrObject == 'string')
      return DateLocale[stringOrObject.toUpperCase()]
    else return stringOrObject
  }

  return DateLocale
})
