import OSMFire_Core from 'MainCore'

// using simple sub-module augmentation
OSMFire_Core.Utilities = (function () {
  const self = {}

  self.clone = function clone (deep) {
    // create an instance of the object
    let newClonedObj = new this.constructor()
    //copy all properties from the original object
    for (let property in this) {
      // if deep flag is not set, just do a shallow copy of properties
      if (!deep) {
        if (this.hasOwnProperty(property)) {
          newClonedObj[property] = this[property]
        }
        // to make a deep copy, call the function recursively
      } else if (typeof this[property] === 'object' && this.hasOwnProperty(property)) {
        newClonedObj[property] = this[property].clone(deep)
      } else if (this.hasOwnProperty(property)) {
        //Just copy properties for non objects
        newClonedObj[property] = this[property]
      }
    }
    return newClonedObj
  }
  // not used?
  self.getFileNameFromPath = function (filePath) {
    let slashIndex = filePath.indexOf('/')
    if (slashIndex > -1) {
      let theLastIndex = filePath.lastIndexOf('/')
      let fileName = filePath.slice(theLastIndex + 1)
      return fileName
    } else {
      // if there is no path in the filePath, then return the filePath, since it only holds the file name
      return filePath
    }
  }
  // not used?
  self.mergePropertiesOfObjects = function (obj1, obj2) {
    let tempObj = {}
    for (let propName in obj1) {
      tempObj[propName] = obj1[propName]
    }
    for (let propName in obj2) {
      tempObj[propName] = obj2[propName]
    }
    return tempObj
  }
  // attach the clone function to Object prototype
  self.initialize = function () {
    // clone messes up new ol.Map in openlayers.
    // Might need to find an alternative.
    // Object.prototype.clone = self.clone;
    OSMFire_Core.log(1, 'Utilities Module has been initialized...', 'blue')
  }
  self.Load_JS_CSS = function (filename, filetype, filePath) {
    let fileElem
    if (filetype === 'js') { //if filename is a external JavaScript file
      fileElem = document.createElement('script')
      fileElem.setAttribute('type', 'text/javascript')
      fileElem.setAttribute('src', (filePath + filename))
    } else if (filetype === 'css') { //if filename is an external CSS file
      fileElem = document.createElement('link')
      fileElem.setAttribute('rel', 'stylesheet')
      fileElem.setAttribute('type', 'text/css')
      fileElem.setAttribute('href', (filePath + filename))
    }
    // attach the file to the page
    if (typeof fileElem !== 'undefined') {
      document.getElementsByTagName('head')[0].appendChild(fileElem)
    }
  }
  self.checkIfArray = function (objToCheck) {
    // if not supported isArray is not supported natively, then use the old fashion way of checking
    Array.isArray = Array.isArray || function (obj) {
      Object.prototype.toString.call(obj) === '[object Array]'
    }
    return Array.isArray(objToCheck)
  }
  self.Remove_JS_CSS = function (fileName, fileType) {
    let foundFile = this.getFileInHead(fileName, fileType)
    if (foundFile) {
      foundFile.parentNode.removeChild(foundFile) //remove element
    } else {
      OSMFire_Core.log(2, 'File could not be found in the head; from Remove_JS_CSS')
    }
  }
  self.getFileInHead = function (filename, filetype) {
    let theElem, theAttr, files
    //determine element type to create nodelist from
    theElem = (filetype === 'js') ? 'script' : (filetype === 'css') ? 'link' : 'none'
    //determine corresponding attribute to test for
    theAttr = (filetype === 'js') ? 'src' : (filetype === 'css') ? 'href' : 'none'
    files = document.getElementsByTagName(theElem)
    //search backwards within nodelist for matching elements to remove
    for (let i = files.length; i >= 0; i--) {
      if (files[i] && files[i].getAttribute(theAttr) !== null && files[i].getAttribute(theAttr).indexOf(filename) !== -1) {
        return files[i] //return file
      }
    }
  }
  self.testLocalStorage = function () {
    let test = 'testing local storage'
    try {
      localStorage.setItem(test, 'some Value')
      localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  }
  // add localstorage check to all methods based on anti-pattern by Nicholas C. Zakas
  self.addLocalStorageCheck = function (object) {
    for (let name in object) {
      let method = object[name]
      if (typeof method === 'function') {
        object[name] = function (name, method) {
          return function () {
            if (self.testLocalStorage()) {
              return method.apply(this, arguments)
            } else {
              OSMFire_Core.log(3, 'LocalStorage is not availble!, from ' + name, 'orange')
              return false
            }
          }
        }(name, method)
      }
    }
  }
  // register with MainCore
  self.register = (function () {
    OSMFire_Core.registerModule(self)
  })()
  //TODO: Clean this up with ES6 object literals.
  // return {
  //   initialize,
  //   Load_JS_CSS,
  //   ...

  return {
    initialize: self.initialize,
    Load_JS_CSS: self.Load_JS_CSS,
    checkIfArray: self.checkIfArray,
    Remove_JS_CSS: self.Remove_JS_CSS,
    getFileInHead: self.getFileInHead,
    testLocalStorage: self.testLocalStorage,
    addLocalStorageCheck: self.addLocalStorageCheck
  }
})()
