/*
 * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, version 2.1.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 */

DateTime.parseFunctions = {count: 0}
DateTime.parseRegexes = []
DateTime.formatFunctions = {count: 0}

//TODO refactor next three functions
DateTime.prototype.format = function(format) {
  if(DateTime.formatFunctions[format] == null) {
    this.createNewFormat(format)
  }
  var func = DateTime.formatFunctions[format]
  return this[func]()
}

DateTime.prototype.createNewFormat = function(format) {
  var funcName = "format" + DateTime.formatFunctions.count++
  DateTime.formatFunctions[format] = funcName
  var code = "DateTime.prototype." + funcName + " = function(){return "
  var special = false
  var ch = ''
  for(var i = 0; i < format.length; ++i) {
    ch = format.charAt(i)
    if(!special && ch == "\\") {
      special = true
    } else {
      if(special) {
        special = false
        code += "'" + String.escape(ch) + "' + "
      } else {
        code += this.getFormatCode(ch)
      }
    }
  }
  eval(code.substring(0, code.length - 3) + ";}")
}

DateTime.prototype.getFormatCode = function(character) {
  switch(character) {
    case "d":
      return "String.leftPad(this.getDate(), 2, '0') + "
    case "D":
      return "this.locale.dayNames[this.getDay()].substring(0, 3) + "
    case "j":
      return "this.getDate() + "
    case "l":
      return "this.locale.dayNames[this.getDay()] + "
    case "S":
      return "this.getSuffix() + "
    case "w":
      return "this.getDay() + "
    case "z":
      return "this.getDayOfYear() + "
    case "W":
      return "this.getWeekOfYear() + "
    case "F":
      return "this.locale.monthNames[this.getMonth()] + "
    case "m":
      return "String.leftPad(this.getMonth() + 1, 2, '0') + "
    case "M":
      return "this.locale.monthNames[this.getMonth()].substring(0, 3) + "
    case "n":
      return "(this.getMonth() + 1) + "
    case "t":
      return "this.getDaysInMonth() + "
    case "L":
      return "(this.isLeapYear() ? 1 : 0) + "
    case "Y":
      return "this.getFullYear() + "
    case "y":
      return "('' + this.getFullYear()).substring(2, 4) + "
    case "a":
      return "(this.getHours() < 12 ? 'am' : 'pm') + "
    case "A":
      return "(this.getHours() < 12 ? 'AM' : 'PM') + "
    case "g":
      return "((this.getHours() %12) ? this.getHours() % 12 : 12) + "
    case "G":
      return "this.getHours() + "
    case "h":
      return "String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + "
    case "H":
      return "String.leftPad(this.getHours(), 2, '0') + "
    case "i":
      return "String.leftPad(this.getMinutes(), 2, '0') + "
    case "s":
      return "String.leftPad(this.getSeconds(), 2, '0') + "
    case "O":
      return "this.getGMTOffset() + "
    case "T":
      return "this.getTimezone() + "
    case "Z":
      return "(this.getTimezoneOffset() * -60) + "
    default:
      return "'" + String.escape(character) + "' + "
  }
}

DateTime.parse = function(input, format, localeOrEmpty) {
  var locale = Locale.fromArgument(localeOrEmpty)
  if(input == 'today') {
    return DateTime.NOW.withLocale(locale)
  }
  if(DateTime.parseFunctions[format + locale.id] == null) {
    DateTime.createParser(format, locale)
  }
  var func = DateTime.parseFunctions[format + locale.id]
  return DateTime[func](input)
}

DateTime.createParser = function(format, locale) {
  var funcName = "parse" + DateTime.parseFunctions.count++
  var regexNum = DateTime.parseRegexes.length
  var currentGroup = 1
  DateTime.parseFunctions[format + locale.id] = funcName

  var code = "DateTime." + funcName + " = function(input){\n" +
    "var y = -1, m = -1, d = -1, h = -1, i = -1, s = -1;\n" +
    "var d = DateTime.NOW.withLocale(locale);\n" + "y = d.getFullYear();\n" +
    "m = d.getMonth();\n" +
    "d = d.getDate();\n" +
    "var results = input.match(DateTime.parseRegexes[" + regexNum + "]);\n" +
    "if (results && results.length > 0) {"
  var regex = ""

  var special = false
  var ch = ''
  for(var i = 0; i < format.length; ++i) {
    ch = format.charAt(i)
    if(!special && ch == "\\") {
      special = true
    } else {
      if(special) {
        special = false
        regex += String.escape(ch)
      } else {
        var obj = DateTime.formatCodeToRegex(ch, currentGroup, locale)
        currentGroup += obj.g
        regex += obj.s
        if(obj.g && obj.c) {
          code += obj.c
        }
      }
    }
  }

  code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n" +
    "{return new DateTime(new Date(y, m, d, h, i, s));}\n" +
    "else if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n" +
    "{return new DateTime(new Date(y, m, d, h, i));}\n" +
    "else if (y > 0 && m >= 0 && d > 0 && h >= 0)\n" +
    "{return new DateTime(new Date(y, m, d, h));}\n" +
    "else if (y > 0 && m >= 0 && d > 0)\n" +
    "{return new DateTime(new Date(y, m, d));}\n" +
    "else if (y > 0 && m >= 0)\n" +
    "{return new DateTime(new Date(y, m));}\n" +
    "else if (y > 0)\n" +
    "{return new DateTime(new Date(y));}\n" +
    "}return null;}"

  DateTime.parseRegexes[regexNum] = new RegExp("^" + regex + "$")
  eval(code)
}

DateTime.formatCodeToRegex = function(character, currentGroup, locale) {
  switch(character) {
    case "D":
      return {g: 0,
        c: null,
        s: "(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"}
    case "j":
    case "d":
      return {g: 1,
        c: "d = parseInt(results[" + currentGroup + "], 10);\n",
        s: "(\\d{1,2})"}
    case "l":
      return {g: 0,
        c: null,
        s: "(?:" + locale.dayNames.join("|") + ")"}
    case "S":
      return {g: 0,
        c: null,
        s: "(?:st|nd|rd|th)"}
    case "w":
      return {g: 0,
        c: null,
        s: "\\d"}
    case "z":
      return {g: 0,
        c: null,
        s: "(?:\\d{1,3})"}
    case "W":
      return {g: 0,
        c: null,
        s: "(?:\\d{2})"}
    case "F":
      return {g: 1,
        c: "m = parseInt(DateTime.monthNumbers[results[" + currentGroup + "].substring(0, 3)], 10);\n",
        s: "(" + locale.monthNames.join("|") + ")"}
    case "M":
      return {g: 1,
        c: "m = parseInt(DateTime.monthNumbers[results[" + currentGroup + "]], 10);\n",
        s: "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"}
    case "n":
    case "m":
      return {g: 1,
        c: "m = parseInt(results[" + currentGroup + "], 10) - 1;\n",
        s: "(\\d{1,2})"}
    case "t":
      return {g: 0,
        c: null,
        s: "\\d{1,2}"}
    case "L":
      return {g: 0,
        c: null,
        s: "(?:1|0)"}
    case "Y":
      return {g: 1,
        c: "y = parseInt(results[" + currentGroup + "], 10);\n",
        s: "(\\d{4})"}
    case "y":
      return {g: 1,
        c: "var ty = parseInt(results[" + currentGroup + "], 10);\n" + "y = ty > DateTime.y2kYear ? 1900 + ty : 2000 + ty;\n",
        s: "(\\d{1,2})"}
    case "a":
      return {g: 1,
        c: "if (results[" + currentGroup + "] == 'am') {\n" + "if (h == 12) { h = 0; }\n" + "} else { if (h < 12) { h += 12; }}",
        s: "(am|pm)"}
    case "A":
      return {g: 1,
        c: "if (results[" + currentGroup + "] == 'AM') {\n" + "if (h == 12) { h = 0; }\n" + "} else { if (h < 12) { h += 12; }}",
        s: "(AM|PM)"}
    case "g":
    case "G":
    case "h":
    case "H":
      return {g: 1,
        c: "h = parseInt(results[" + currentGroup + "], 10);\n",
        s: "(\\d{1,2})"}
    case "i":
      return {g: 1,
        c: "i = parseInt(results[" + currentGroup + "], 10);\n",
        s: "(\\d{2})"}
    case "s":
      return {g: 1,
        c: "s = parseInt(results[" + currentGroup + "], 10);\n",
        s: "(\\d{2})"}
    case "O":
      return {g: 0,
        c: null,
        s: "[+-]\\d{4}"}
    case "T":
      return {g: 0,
        c: null,
        s: "[A-Z]{3}"}
    case "Z":
      return {g: 0,
        c: null,
        s: "[+-]\\d{1,5}"}
    case ".":
      return {g: 0,
        c: null,
        s: "\\."}
    default:
      return {g: 0,
        c: null,
        s: String.escape(character)}
  }
}
