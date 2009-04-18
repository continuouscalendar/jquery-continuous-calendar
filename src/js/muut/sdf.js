/* ==============================================================================
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/*
 * @author Igor Vaynberg (ivaynberg)
 * @author Karri-Pekka Laakso (kplaakso)
 */

if (Wicket == undefined) {
	var Wicket = {};
}

Wicket.SimpleDateFormat = function() {
	this.initialize.apply(this, arguments);
}

Wicket.SimpleDateFormat.pad = function(str, len) {
	var tmp = "" + str;
	while (tmp.length < len) {
		tmp = '0' + tmp;
	}
	return tmp;
}

Wicket.SimpleDateFormat.parseNumber = function(str, pos, parsed) {
	var BASE10 = 10;
	var number = parseInt(str.substr(pos), BASE10);
	if (isNaN(number)) {
		throw("Parse error: '"+str.substr(pos)+"' when parsing "+parsed+" in '"+
			str+"', start position "+pos);
	}

	while (pos < str.length && str[pos] >= '0' && str[pos] <= '9') {
		pos++;
	}
	
	return {pos:pos, value:number};		
}
	



Wicket.SimpleDateFormat.prototype = {
	initialize : function(expr, locale) {
		if (expr == undefined) {
			throw ("argument expr is required");
		}
		if (locale == undefined) {
			throw ("argument locale is required");
		}

		if (expr.length < 1) {
			throw ("argument expr cannot be an empty string");
		}

		this.formatters = {
			"y":this.formatYear,
			"M":this.formatMonth,
			"d":this.formatDayOfMonth,
			"W":this.formatWeekInYear,
			"D":this.formatDayOfYear,
			"F":this.formatDayOfWeek,
			"E":this.formatWeekday
		}

		this.parsers = {
			"y":this.parseYear,
			"M":this.parseMonth,
			"d":this.parseDayOfMonth
		}

		this.isParsingPossible = true;
			
		this.tokens = this.tokenize(expr);
		this.locale = locale;
	},
	
	tokenize : function(expr) {
		var tokens = [];

		var i = 0;
		while (i < expr.length) {
			var c = expr.charAt(i);
			
			if ((c >= 'A'&& c <= 'Z') || (c >= 'a'&& c <= 'z')) {
				var legal = (this.formatters[c] != undefined);
    			this.isParsingPossible &= (this.parsers[c] != undefined);
    			
				if (!legal) {
    				throw("expression [["+expr+"]] contains an illegal character [["+c+"]] at position [["+i+"]]");
				} else {
					var start = i;
					while (i<expr.length && expr.charAt(i)==c) {
						i++;
					}
					tokens.push([c, i-start]);
				}	
			}
			else if (c == '\'') {
				var quote = "";
				do {
					quote += expr.charAt(i);
					i++;
				} while (i < expr.length && expr.charAt(i) != '\'')
				
				if (i == expr.length) {
					throw("expression [["+expr+"]] contains an unclosed quote (')");
				}
				
				quote += "'";
				i++;
				
				if (quote.length == 2) {
					quote = "'";
				}
				tokens.push([quote]);
			}
			else {
				tokens.push([c]);
				i++;
			}
		}
		
		return tokens;
	},

	format : function(date) {
		var str = "";
		for (var i = 0;i<this.tokens.length;i++) {
		    var token = this.tokens[i];
		    if (token.length == 1) {
		        str+=token[0];
		    } else {
		        var c = token[0];
		        var rank = token[1];
		        var formatter = this.formatters[c];
		        str+=formatter(date, rank, this.locale);
		    }
		}
		return str;
	},

	tokensToFormat : function() {
		var format = '';
		for (var i=0; i<this.tokens.length; i++) {
			var token = this.tokens[i];
			if (token.length == 1) {
				format += token[0];
			} else {
				for (var j=0; j<token[1]; j++) {
					format += token[0];
				}
			}
		}
		return format;
	}, 
	
	parse : function(str) {
		if (!this.isParsingPossible) {
			throw("Parsing is not possible with the current format " + this.tokensToFormat());
		}
		
		var date = new Date();
		date.setMonth(0);
		date.setDate(1);
		date.stripTime();
		date.proposedDay = null;

		var pos = 0;
		for (var i=0; i<this.tokens.length; i++) {
			var token = this.tokens[i];
			if (token.length == 1) {
				pos = this.parseString(str, pos, token);
			} else {
				var parser = this.parsers[token[0]];
				pos = parser(str, pos, token[1], date);
			}
		}
		// Check validity as a whole (esp. day of month)
		if (date.proposedDay != null) {
			if (date.proposedDay > date.getDaysInMonth()) {
				throw("Illegal date "+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.proposedDay);
			}
			date.setDate(date.proposedDay);
		}
		return date;
	},
	
	parseString : function(str, pos, pattern) {
		if (str.indexOf(pattern, pos) != pos) {
			throw("Parse error: '"+str.substr(pos, pattern.length)+"' instead of '"+pattern+"' in '"+
				str+"', start position "+pos);
		}
		return pos + pattern.length;
	},
	
	formatYear : function(date, rank, locale) {
		var year = date.getFullYear();
		if (rank<=2) {
			return Wicket.SimpleDateFormat.pad(""+year-Math.floor(year/100)*100, 2);
		} else {
			return Wicket.SimpleDateFormat.pad(year, rank);
		}
	},

	parseYear : function(str, pos, rank, date) {
		var ret = Wicket.SimpleDateFormat.parseNumber(str, pos, 'year');		
		date.setFullYear(ret.value);
		return ret.pos;
	}, 
	
	formatMonth : function(date, rank, locale) {	
		var month = date.getMonth();
		
		if (rank<=2) {
		  return Wicket.SimpleDateFormat.pad(month+1, rank);
		} else if (rank == 3) {
	    return locale.getShortMonth(month);
		} else {
	    return locale.getMonth(month);
		}
	},
            
	parseMonth : function(str, pos, rank, date) {
		var ret = Wicket.SimpleDateFormat.parseNumber(str, pos, 'month');
		if (ret.value > 0 && ret.value < 13) {
			date.setMonth(ret.value-1);
		} else {
			throw("Illegal month value "+ret.value);
		}
		return ret.pos;
	}, 
	
	formatDayOfMonth : function(date, rank, locale) {
		var day = date.getDate();
		return Wicket.SimpleDateFormat.pad(day, rank);
	},
            
	parseDayOfMonth : function(str, pos, rank, date) {
		var ret = Wicket.SimpleDateFormat.parseNumber(str, pos, 'day of month');
		if (ret.value > 0 && ret.value < 32) {
			date.proposedDay = ret.value;
		} else {
			throw("Illegal day of month value "+ret.value);
		}
		return ret.pos;
	}, 
	
	formatWeekInYear : function(date, rank, locale) {
		return Wicket.SimpleDateFormat.pad(date.getWeekInYear(locale.getWeekNumbering()), rank);
	},

	formatDayOfYear : function(date, rank, locale) {
		return Wicket.SimpleDateFormat.pad(date.getDayInYear(), rank);
	},

	formatDayOfWeek : function(date, rank, locale) {
		return Wicket.SimpleDateFormat.pad(date.getDay(), rank);
	},

	formatWeekday : function(date, rank, locale) {
		if (rank<=3) {
			return locale.getShortWeekday(date.getDay());
		} else {
			return locale.getWeekday(date.getDay());
		}
	}
}


Wicket.ParseException = function() {
	this.initialize.apply(this, arguments);
}

Wicket.ParseException.prototype = {
	initialize : function(message) {
		this.className = "ParseException";
		this.message = message;
	}
}