module.exports = {
  el: el,
  extend: extend,
  elemsAsList: elemsAsList,
  toggle: toggle
}

function extend(destination, source) {
  for(var property in source)
    destination[property] = source[property]
  return destination
}

function el(tagName, properties, childNode) {
  var elem = document.createElement(tagName)
  for(var i in properties) elem[i] = properties[i]
  if(childNode) elem.appendChild(childNode)
  return elem
}

function elemsAsList(selector) {
  return Array.prototype.slice.call(selector)
}

function toggle(elem, show) {
  if(elem) elem.style.display = show ? '' : 'none'
}
