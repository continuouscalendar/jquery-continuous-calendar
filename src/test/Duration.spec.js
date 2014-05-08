define(function(require, exports, module) {
  var Duration = require('../main/Duration')
  with(Duration) {
    describe(module.id, function() {
      describe('creating durations with factory methods', function() {
        it('returns ms', function() { expect(fromMS(1000).toMS()).to.equal(1000) })
        it('returns seconds', function() { expect(fromSeconds(1).toMS()).to.equal(1000) })
        it('returns minutes', function() { expect(fromMinutes(1).toMS()).to.equal(60000) })
        it('returns hours', function() { expect(fromHours(1).toMS()).to.equal(60 * 60000) })
        it('returns days', function() { expect(fromDays(1).toMS()).to.equal(24 * 60 * 60000) })
      })
      describe('returns durations in as different units', function() {
        var day
        before(function() {
          day = fromDays(1)
        })
        it('returns days', function() { expect(day.asUnit(DAY)).to.equal(1) })
        it('returns hours', function() { expect(day.asUnit(HOUR)).to.equal(24) })
        it('returns minutes', function() { expect(day.asUnit(MIN)).to.equal(24 * 60) })
        it('returns seconds', function() { expect(day.asUnit(SECOND)).to.equal(24 * 60 * 60) })
        it('returns ms', function() { expect(day.asUnit(MS)).to.equal(24 * 60 * 60 * 1000) })
      })
    })
  }
})
