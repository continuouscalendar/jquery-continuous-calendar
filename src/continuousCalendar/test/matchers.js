var DateTime = window.DateTime
var DateFormat = window.DateFormat

window.matchers = function(chai, utils) {
  var flag = utils.flag
  var matchers = {
    toHaveLength:              function(length) {
      this.assert(
        $(flag(this, 'object')).length === length
        , 'expected #{this} to have length #{exp}'
        , 'expected #{this} not to have length #{exp}'
        , length
      )
    },
    toHaveDate:                function(isoDate) {
      this.assert(
        flag(this, 'object').hasDate(DateTime.fromIsoDate(isoDate))
        , 'expected #{this} to have date #{exp}'
        , 'expected #{this} not to have date #{exp}'
        , isoDate
      )
    },
    toBeInside:                function(range) {
      this.assert(
        flag(this, 'object').isInside(range)
        , 'expected #{this} to be inside range #{exp}'
        , 'expected #{this} not to inside range #{exp}'
        , range
      )
    },
    toBeValidRange:            function() {
      this.assert(
        flag(this, 'object').isValid()
        , 'expected #{this} to be valid range'
        , 'expected #{this} not to be valid range'
      )
    },
    toPrintDefiningDurationOf: function(duration_str, locale) {
      this.assert(
        DateFormat.formatDefiningRangeDuration(flag(this, 'object'), locale) == duration_str
        , 'expected #{this} to print default duration of #{exp}'
        , 'expected #{this} not to print default duration of #{exp}'
        , duration_str
      )
    },
    toCompareWith:             function(expected) {
      this.assert(
        flag(this, 'object').compareTo(expected) === 0
        , 'expected #{this} to compare with #{exp}'
        , 'expected #{this} not to compare with #{exp}'
        , expected
      )
    },
    toEqualRoughly:            function(expected, tolerance) {
      this.assert(
        flag(this, 'object') <= expected + tolerance && flag(this, 'object') >= expected - tolerance
        , 'expected #{this} to equal roughly #{exp}'
        , 'expected #{this} not to equal roughly #{exp}'
        , expected
      )
    }
  }

  $.each(matchers, function(name, fn) {
    chai.Assertion.addMethod(name, fn)
  })
}
