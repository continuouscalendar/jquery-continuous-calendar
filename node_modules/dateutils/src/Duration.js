var Duration = function (durationMs) {
  this.durationMs = durationMs
}

Duration.MS = 1
Duration.SECOND = 1000
Duration.MIN = 60 * Duration.SECOND
Duration.HOUR = 60 * Duration.MIN
Duration.DAY = 24 * Duration.HOUR

Duration.fromMS = function (milliSeconds) { return new Duration(milliSeconds) }
Duration.fromSeconds = function (seconds) { return Duration.fromMS(seconds * Duration.SECOND) }
Duration.fromMinutes = function (minutes) { return Duration.fromMS(minutes * Duration.MIN) }
Duration.fromHours = function (hours) { return Duration.fromMS(hours * Duration.HOUR) }
Duration.fromDays = function (days) { return Duration.fromMS(days * Duration.DAY) }

Duration.prototype.toMS = function () { return this.durationMs }
Duration.prototype.asUnit = function (unit) { return Number(this.durationMs / unit) }
module.exports = Duration
