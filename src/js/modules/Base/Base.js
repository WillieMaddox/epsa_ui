const result = (function () {
  function getBaseModule () {
    if (typeof jQuery !== 'undefined') {
      return jQuery
    } else {
      return null
    }
  }
  return {
    getBaseModule: getBaseModule
  }
})()

export default result
