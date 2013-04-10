define(function() {
  var __ = {}

  Function.prototype.curry = function() {
    return curry(this, Array.prototype.slice.call(arguments))
  }

  Function.prototype.wrap = function() {
    var _this = this
    var _arguments = arguments
    return function() {
      return _this.apply(_this, _arguments)
    }
  }

  return {
    __               : __,
    sequence         : sequence
  }

  function sequence(start, end) {
    var list = []
    for(var i = start; i <= end; i++) list.push(i)
    return list
  }

  function curry(func, givenArguments) {
    var indexOf = givenArguments.indexOf(__)
    var givenArgsSize = givenArguments.length
    var requiredArgsSize = func.length
    if(givenArgsSize >= requiredArgsSize && (indexOf < 0 || indexOf >= requiredArgsSize))
      return func.apply(func, givenArguments)
    else
      return function() {
        return (function(givenArguments, remainingArguments) {
          for(var i = 0; i < givenArguments.length; i++)
            if(givenArguments[i] === __) givenArguments[i] = remainingArguments.shift()
          return curry(func, givenArguments.concat(remainingArguments))
        })(givenArguments.slice(0), Array.prototype.slice.call(arguments))
      }
  }
})