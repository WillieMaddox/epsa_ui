'use strict'
let OSMFire_Core = (function(mainCore) {
  let $ = null,
    registeredModules = [],
    registeredComponents = [],
    fileLoadDelayTime = 300,
    timerCounter = 0,
    recursiveMaxCounter = 3,
    // loadedComponentName,
    loadedComponentcallbackFunc

  mainCore.registeredComponents = registeredComponents
  mainCore.jQuery;
  //core initializing itsself
  (function Core_initialize() {
    mainCore.debug = true
    try {
      // get jQuery from the base module loader
      mainCore.jQuery = $ = OSMFire_Base.getBaseModule()
    } catch (e) {
      if (mainCore.debug) {
        console.error('Base Module has not been defined!!!')
      }
    }
    if (mainCore.debug) {
      console.log('%c Core Module has been initialized...', 'color:blue')
    }
  })()
  mainCore.toggleDebug = function() {
    mainCore.debug = !mainCore.debug
    if (mainCore.debug) {
      mainCore.log(1, 'Application debug has been turned on...', 'blue')
    } else {
      console.log('%c Application debug has been turned off...', 'color:orange')
    }
  }
  mainCore.getDebugFlag = function() {
    return mainCore.debug
  }
  //progressive enhancement
  mainCore.log = function(severity, msg, color) {
    // if the logging module has been loaded, then use its full functionality
    // otherwise just log a simple message
    if (mainCore.LoggingHandler && mainCore.LoggingHandler.log) {
      mainCore.LoggingHandler.log(severity, msg, color)
    } else {
      if (severity === 3) {
        color = 'color:red;font-weight:bold'
      }
      console['log']('%c Severity: ' + severity + ' ---> ' + msg + ' (From Core!)', color)
    }
  }
  mainCore.checkIfArray = function(value) {
    if (mainCore.Utilitizes && mainCore.Utilitizes.checkIfArray) {
      return mainCore.Utilitizes.checkIfArray(value)
    } else {
      mainCore.log(3, 'cannot check if array; from mainCore.checkIfArray')
    }
  }
  // modules
  mainCore.registerModule = function(module) {
    registeredModules.push(module)
  }
  mainCore.getAppModulesCount = function() {
    return registeredModules.length
  }
  mainCore.initializeAllModules = function() {
    for (let module in registeredModules) {
      registeredModules[module].initialize()
    }
  }
  mainCore.removeRegisteredModule = function(index) {
    registeredModules.splice(index, 1)
  }
  // components
  mainCore.registerComponent = function(containerID, componentID, createFunc) {
    let containerElem, componentObj
    //setting context for the sandbox
    if ($) {
      containerElem = $('#' + containerID)[0]
    } else {
      containerElem = document.getElementById(containerID)
    }
    if (createFunc && typeof createFunc === 'function') {
      componentObj = createFunc(new SandBox(this, containerElem, componentID))
      //checking for required methods in component
      if (componentObj.init && typeof componentObj.init === 'function' && componentObj.destroy && typeof componentObj.destroy === 'function') {
        componentObj.id = componentID
        registeredComponents.push(componentObj)
      } else {
        this.log(3, 'Component does not have necessary methods, thus not registered')
      }
    } else {
      this.log(3, 'no creator function on component, component not registered')
    }
  }
  mainCore.unregisterComponentByName = function(name) {
    for (let component in registeredComponents) {
      if (component.name === name) {
        component = null
      }
    }
  }
  mainCore.resetComponentInfo = function() {
    timerCounter = 0
    loadedComponentcallbackFunc = null
  }
  mainCore.destroyAllComponents = function(removeFromDom) {
    this.log(1, 'Destroying all components...', 'orange')
    let lastIndex = registeredComponents.length - 1
    try {
      for (let i = lastIndex; i >= 0; i--) {
        registeredComponents[i].destroy(removeFromDom)
      }
    } catch (e) {
      this.log(3, 'APPLICATION Destroy error!' + e.name + ': ' + e.message)
    }
    this.log(1, 'All components have been destroyed...', 'orange')
  }
  mainCore.getComponentByID = function(componentID) {
    for (let i = 0; i < this.registeredComponents.length; i++) {
      if (this.registeredComponents[i].id === componentID) {
        return this.registeredComponents[i]
      }
    }
    return false
  }
  mainCore.getComponentObjAndCallback = function(ComponentObjID, callbackFunc) {
    try {
      // load Component object definition from storage
      mainCore.loadPageDefinitionFromStorageAndCallBack(ComponentObjID, callbackFunc)
    } catch (e) {
      mainCore.log(3, 'Component definition was not found; from mainCore.getComponentObjAndCallback ' + e.message)
    }
  }
  mainCore.initializeComponent = function(componentID, callbackFunc) {
    let args = arguments
    try {
      timerCounter++
      // see if the Component has been loaded
      mainCore.getComponentByID(componentID).init()
      callbackFunc()
      mainCore.resetComponentInfo()
    } catch (e) {
      if (timerCounter < recursiveMaxCounter) {
        window.setTimeout(function() {
          mainCore.initializeComponent.apply(null, args)
        }, fileLoadDelayTime)
      } else {
        mainCore.resetComponentInfo()
        mainCore.log(3, ' could not initialize the loaded Component')
      }
    }
  }
  mainCore.initializeAllComponents = function() {
    this.log(1, 'Initializing all components...', 'orange')
    try {
      for (let i = 0; i < registeredComponents.length; i++) {
        registeredComponents[i].init()
      }
    } catch (e) {
      this.log(3, 'APPLICATION CATASTROPHIC ERROR!' + e.name + ': ' + e.message)
    }
    this.log(1, 'All components have been initialized...', 'orange')
  }
  mainCore.loadComponentAndCallback = function(ComponentDefID, callbackFunc) {
    // get the value of Component object definition from storage
    let ComponentDef = mainCore.getValueForKeyAsObjectFromStorage(ComponentDefID)
    loadedComponentcallbackFunc = callbackFunc
    if (!ComponentDef) {
      // if Component definition is not in the storage then the page object definitions probably needs to be loaded
      mainCore.loadPageDefinitionsFileAndCallBack(function() {
        mainCore.getComponentObjAndCallback(ComponentDefID,
          mainCore.loadComponentFilesAndInitializeWithCallBack)
      })
    } else {
      mainCore.loadComponentFilesAndInitializeWithCallBack(ComponentDef)
    }
  }
  mainCore.loadComponentFilesAndInitializeWithCallBack = function(pageDefinitionObj, callbackFunc) {
    loadedComponentcallbackFunc = callbackFunc || loadedComponentcallbackFunc
    if (pageDefinitionObj && typeof pageDefinitionObj === 'object') {
      if (pageDefinitionObj.scriptFile && pageDefinitionObj.scriptPath) {
        mainCore.loadJSfileFromObjDefAndCallBack(
          pageDefinitionObj.scriptFile,
          pageDefinitionObj.scriptPath, function() {
            mainCore.initializeComponent(
              pageDefinitionObj.componentID,
              loadedComponentcallbackFunc)
          })
      } else {
        mainCore.log(2, 'Could not load Component script file; from mainCore.loadComponentFilesAndInitializeWithCallBack')
        return
      }
      if (pageDefinitionObj.cssFile && pageDefinitionObj.cssPath) {
        mainCore.loadCSSfileFromObjDef(pageDefinitionObj.cssFile, pageDefinitionObj.cssPath)
      } else {
        mainCore.log(2, 'Could not load Component script file; from mainCore.loadComponentFilesAndInitializeWithCallBack')
      }
    } else {
      mainCore.log(3, 'Component definition was not found, cannot render page; from mainCore.loadComponentFilesAndInitializeWithCallBack')
    }
  }
  mainCore.loadComponent = function(ComponentDefID) {
    // get the value of Component object definition from storage
    let ComponentDef = mainCore.getValueForKeyAsObjectFromStorage(ComponentDefID)
    if (!ComponentDef) {
      // if Component definition is not in the storage then the page object definitions probably needs to be loaded
      mainCore.loadPageDefinitionsFileAndCallBack(function() {
        mainCore.getComponentObjAndCallback(ComponentDefID, mainCore.loadComponentFiles)
      })
    } else {
      mainCore.loadComponentFiles(ComponentDef)
    }
  }
  mainCore.loadComponentFiles = function(pageDefinitionObj) {
    if (pageDefinitionObj && typeof pageDefinitionObj === 'object') {
      if (pageDefinitionObj.scriptFile && pageDefinitionObj.scriptPath) {
        mainCore.loadJSfileFromObjDef(pageDefinitionObj.scriptFile, pageDefinitionObj.scriptPath)
      } else {
        mainCore.log(2, 'Could not load Component script file; from mainCore.loadComponentFiles')
        return
      }
      if (pageDefinitionObj.cssFile && pageDefinitionObj.cssPath) {
        mainCore.loadCSSfileFromObjDef(pageDefinitionObj.cssFile, pageDefinitionObj.cssPath)
      } else {
        mainCore.log(2, 'Could not load Component script file; from mainCore.loadComponentFiles')
      }
    } else {
      mainCore.log(3, 'Component definition was not found, cannot render page; from mainCore.loadComponentFiles')
    }
  }
  mainCore.loadCSSfileFromObjDef = function(fileName, filePath) {
    // if file has already been loaded, then nothing to do
    if (mainCore.confirmFileLoad(fileName, 'css')) {
      return true
    } else {
      mainCore.loadFile(fileName, 'css', filePath)
    }
  }
  mainCore.loadJSfileFromObjDef = function(fileName, filePath) {
    // if file has already been loaded, then nothing to do
    if (mainCore.confirmFileLoad(fileName, 'js')) {
      return true
    } else {
      mainCore.loadFile(fileName, 'js', filePath)
    }
  }
  mainCore.loadJSfileFromObjDefAndCallBack = function(fileName, filePath, callbackFunc) {
    // if file has already been loaded, then nothing to do
    if (mainCore.confirmFileLoad(fileName, 'js')) {
      return true
    } else {
      mainCore.loadFileAndCallBack(fileName, 'js', filePath, callbackFunc)
    }
  }
  mainCore.confirmFileLoad = function(fileName, fileType) {
    let fileLoaded
    if (mainCore.Utilitizes && mainCore.Utilitizes.getFileInHead) {
      fileLoaded = mainCore.Utilitizes.getFileInHead(fileName, fileType)
      if (!fileLoaded && timerCounter < recursiveMaxCounter) {
        timerCounter++
        window.setTimeout(mainCore.confirmFileLoad, fileLoadDelayTime, fileName, fileType)
      } else if (timerCounter >= recursiveMaxCounter) {
        mainCore.log(3, 'Page has not been loaded; from confirmFileLoad')
        timerCounter = 0
        return false
      } else {
        timerCounter = 0
        return true
      }
    } else {
      console.log(3, 'Cannot look for file in loaded page; confirmFileLoad')
      return false
    }
  }
  mainCore.loadFile = function(fileName, fileType, filePath) {
    if (mainCore.Utilitizes && mainCore.Utilitizes.Load_JS_CSS) {
      mainCore.Utilitizes.Load_JS_CSS(fileName, fileType, filePath)
    } else {
      mainCore.log(3, 'Cannot load file; from mainCore.loadFile')
    }
  }
  mainCore.removeFile = function(fileName, fileType) {
    if (mainCore.Utilitizes && mainCore.Utilitizes.Load_JS_CSS) {
      mainCore.Utilitizes.Remove_JS_CSS(fileName, fileType)
    } else {
      mainCore.log(3, 'Cannot remove file; from mainCore.removeFile')
    }
  }
  mainCore.loadFileAndCallBack = function(fileName, fileType, filePath, callbackFunc) {
    mainCore.loadFile(fileName, fileType, filePath)
    if (mainCore.confirmFileLoad(fileName, fileType)) {
      callbackFunc()
    } else {
      mainCore.log(3, 'Cannot load file; from mainCore.loadFileAndCallBack')
    }
  }
  mainCore.loadPageDefinitions = function() {
    let pageDefinitionsFileName = OSMFire_GlobalData.getPageDefinitionsFileName(),
      pageDefinitionsFilePath = OSMFire_GlobalData.getPageDefinitionsFilePath()
    if (pageDefinitionsFileName && pageDefinitionsFilePath) {
      mainCore.loadFile(pageDefinitionsFileName, 'js', pageDefinitionsFilePath)
      mainCore.removeFile(pageDefinitionsFileName, 'js')
    } else {
      mainCore.log(3, 'Cannot load file; from mainCore.loadPageDefinitions')
    }
  }
  mainCore.loadPageDefinitionsFileAndCallBack = function(callbackFunc) {
    let pageDefinitionsFileName = OSMFire_GlobalData.getPageDefinitionsFileName(),
      pageDefinitionsFilePath = OSMFire_GlobalData.getPageDefinitionsFilePath()
    if (pageDefinitionsFileName && pageDefinitionsFilePath) {
      mainCore.loadFile(pageDefinitionsFileName, 'js', pageDefinitionsFilePath)
      if (mainCore.confirmFileLoad(pageDefinitionsFileName, 'js')) {
        callbackFunc()
        mainCore.removeFile(pageDefinitionsFileName, 'js')
      } else {
        mainCore.log(3, 'Cannot load file; from mainCore.loadPageDefinitionsFileAndCallBack')
      }
    } else {
      mainCore.log(3, 'Cannot load file; from mainCore.loadPageDefinitionsFileAndCallBack')
    }
  }
  mainCore.loadPageDefinitionFromStorageAndCallBack = function(pageObjDefName, callbackFunc) {
    let pageDefinitionObj, args = arguments
    pageDefinitionObj = mainCore.getValueForKeyAsObjectFromStorage(pageObjDefName)
    if (!pageDefinitionObj && timerCounter < recursiveMaxCounter) {
      timerCounter++
      window.setTimeout(function() {
        mainCore.loadPageDefinitionFromStorageAndCallBack.apply(null, args)
      }, fileLoadDelayTime)
    } else if (timerCounter >= recursiveMaxCounter) {
      timerCounter = 0
      throw new Error('Page definition Object was not found')
    } else {
      timerCounter = 0
      callbackFunc(pageDefinitionObj)
    }
  }
  mainCore.testLocalStorage = function() {
    if (mainCore.Utilitizes && mainCore.Utilitizes.testLocalStorage) {
      return mainCore.Utilitizes.testLocalStorage()
    } else {
      mainCore.log(3, 'cannot check if array; from mainCore.testLocalStorage')
    }
  }
  mainCore.getValueForKeyAsObjectFromStorage = function(ObjName) {
    if (mainCore.StorageHandler && mainCore.StorageHandler.getValueForKeyAsObject) {
      return mainCore.StorageHandler.getValueForKeyAsObject(ObjName)
    } else {
      mainCore.log(3, 'Cannot get Value as object from storage; from mainCore.getValueForKeyAsObjectFromStorage')
    }
  }
  mainCore.saveValueToLocalStorage = function(key, value, encode) {
    if (mainCore.StorageHandler && mainCore.StorageHandler.saveValueToLocalStorage && key && typeof key === 'string' && value) {
      mainCore.StorageHandler.saveValueToLocalStorage(key, value, encode)
    } else {
      mainCore.log(3, 'Cannot set value in local storage; from mainCore.saveValueToLocalStorage')
    }
  }
  mainCore.getCookieValueAsArray = function(cookieName) {
    if (mainCore.CookieHandler && mainCore.CookieHandler.getCookieValueAsArray) {
      return mainCore.CookieHandler.getCookieValueAsArray(cookieName)
    } else {
      mainCore.log(3, 'Cannot get Value for cookie; from mainCore.getCookieValueAsArray')
    }
  }
  mainCore.populateCookie =function(cookieName, value) {
    if (mainCore.CookieHandler && mainCore.CookieHandler.populateCookie) {
      mainCore.CookieHandler.populateCookie(cookieName, value)
    } else {
      mainCore.log(3, 'Cannot populate cookie; from mainCore.populateCookie')
    }
  }
  mainCore.removeValueByValueFromCookie = function(cookieName, value) {
    if (mainCore.CookieHandler && mainCore.CookieHandler.removeValueByValue) {
      mainCore.CookieHandler.removeValueByValue(cookieName, value)
    } else {
      mainCore.log(3, 'Cannot remove Value from cookie; from mainCore.removeValueByValue')
    }
  }
  //unit tests can still run even if the application fails catastrophically
  mainCore.runAllUnitTests = function() {
    if (typeof OSMFire_Core.AppTester !== 'undefined') {
      try {
        OSMFire_Core.AppTester.runAllUnitTests()
      } catch (e) {
        mainCore.log(3, 'AppTester ERROR! ' + e.name + ': ' + e.message)
      }
    } else {
      mainCore.log(3, 'AppTester not available!')
    }
  }
  return mainCore
})(OSMFire_Core || {}) // using loose augmentation of OSMFire_Core

// DOM related functionality
OSMFire_Core = (function(Core) {
  let $ = Core.jQuery
  let insertHTMLTxt = function(containerID, newStructure) {
    let containerElem
    if (typeof containerID === 'string') {
      containerElem = Core.getElement(containerID)
    } else if (typeof containerID === 'object') {
      containerElem = containerID
    }
    if (containerElem) {
      Core.setInnerHTML(containerElem, newStructure)
    } else {
      Core.log(3, 'Cannot set the innerHTML of an unfound element; insertHTMLTxt')
    }
  }
  let applyElementCSSClass = function(elementID, className) {
    let elem
    if (!className) {
      Core.log(3, 'No class name has been provided, exiting module!')
      return false
    }
    elem = Core.getElement(elementID)
    Core.setClassName(elem, className)
  }
  let getParentNode = function(elem) {
    if ($) {
      return $(elem).parent()[0]
    } else {
      return elem.parentNode
    }
  }
  let setElement = function(containerID, elem) {
    if ($) {
      $(containerID).append(elem)
    } else {
      containerID.appendChild(elem)
    }
  }
  let getElement = function(elemID) {
    if ($) {
      return $('#' + elemID)[0]
    } else {
      return document.getElementById(elemID)
    }
  }
  let setInnerHTML = function(container, newStructure) {
    if ($) {
      try { // to deal with jQuery 1.8 error when component is generated dynamically
        $(container).html(newStructure)
      } catch (e) {
        container.innerHTML = newStructure
      }
    } else {
      container.innerHTML = newStructure
    }
  }
  let setClassName = function(elem, className) {
    if ($) {
      $(elem).addClass(className)
    } else {
      elem.className = className
    }
  }
  let getChildOfParentByID = function(parentElem, childID) {
    childID = '#' + childID
    if ($) {
      try {
        return $(parentElem).find(childID)[0]
      } catch (e) {
        return parentElem.querySelector(childID)
      }
    } else {
      return parentElem.querySelector(childID)
    }
  }
  // graceful degradation and progressive enhancement
  let removeComponentFromDom = function(elementID) {
    let childElem
    elementID = '#' + elementID
    if ($) {
      $(elementID).detach()
    } else {
      childElem = document.querySelector(elementID)
      childElem.parentNode.removeChild(childElem)
    }
  }
  let createDocumentLevelComponent = function(componentViewStr) {
    let mainComponentContainer
    mainComponentContainer = document.createElement('DIV')
    mainComponentContainer.innerHTML = componentViewStr
    document.body.appendChild(mainComponentContainer)
    return mainComponentContainer
  }
  //sandbox only talks to this interface of maincore
  Core.updateElement = insertHTMLTxt
  Core.applyElementCSSClass = applyElementCSSClass
  Core.getParentNode = getParentNode
  Core.getElement = getElement
  Core.setElement = setElement
  Core.setInnerHTML = setInnerHTML
  Core.setClassName = setClassName
  Core.getChildOfParentByID = getChildOfParentByID
  Core.removeComponentFromDom = removeComponentFromDom
  Core.createDocumentLevelComponent = createDocumentLevelComponent
  return Core
})(OSMFire_Core) // using tight augmentation

// Openlayers related functionality
OSMFire_Core = (function(Core) {
  let getMap = function() {
    return Core.OL.getMap()
  }
  let setMap = function(map) {
    Core.OL.setMap(map)
  }
  let getView = function() {
    return Core.OL.getView()
  }
  let addControl = function(control) {
    Core.OL.addControl(control)
  }
  let getMouseProjection = function () {
    return Core.OL.getMouseProjection()
  }
  let setMouseProjection = function (value) {
    Core.OL.setMouseProjection(value)
  }
  let getMousePrecision = function () {
    return Core.OL.getMousePrecision()
  }
  let setMousePrecision = function () {
    Core.OL.setMousePrecision()
  }
  let getLoadingStrategy = function (strategy) {
    return Core.OL.getLoadingStrategy(strategy)
  }
  let getFormat = function (format) {
    return Core.OL.getFormat(format)
  }
  let getSource = function (source, opt) {
    return Core.OL.getSource(source, opt)
  }
  let getLayer = function (layer, opt) {
    return Core.OL.getLayer(layer, opt)
  }
  let addLayer = function (layer) {
    Core.OL.addLayer(layer)
  }
  let selectLayer = function () {
    return Core.OL.selectLayer()
  }
  let getSelectedLayer = function () {
    return Core.OL.getSelectedLayer()
  }
  let deselectLayer = function () {
    Core.OL.deselectLayer()
  }
  Core.getMap = getMap
  Core.setMap = setMap
  Core.getView = getView
  Core.addControl = addControl
  Core.getMouseProjection = getMouseProjection
  Core.setMouseProjection = setMouseProjection
  Core.getMousePrecision = getMousePrecision
  Core.setMousePrecision = setMousePrecision
  Core.getLoadingStrategy = getLoadingStrategy
  Core.getFormat = getFormat
  Core.getSource = getSource
  Core.getLayer = getLayer
  Core.addLayer = addLayer
  Core.selectLayer = selectLayer
  Core.getSelectedLayer = getSelectedLayer
  Core.deselectLayer = deselectLayer
  return Core
})(OSMFire_Core) // using tight augmentation

// event related functionality augmentation
OSMFire_Core = (function(Core) {
  let $ = Core.jQuery
  let addEventHandlerToElem = function(elem, event, callbackFunc) {
    if (!elem) {
      Core.log(3, 'Element is not passed in, from addEventHandlerToElem')
      throw new Error('Element not found')
    }
    if ($) {
      $(elem).on(event, callbackFunc)
    } else {
      if (elem.addEventListener) {
        elem.addEventListener(event, callbackFunc)
      } else if (elem.attachEvent) { // For IE 8 and earlier versions
        elem.attachEvent('on' + event, callbackFunc)
      }
    }
  }
  let removeEventHandlerFromElem = function(elem, event, callbackFunc) {
    if (!elem) {
      Core.log(3, 'Element is not found, from removeEventHandlerFromElem')
      throw new Error('Element not found')
    }
    if ($) {
      $(elem).off(event, callbackFunc)
    } else {
      if (elem.removeEventListener) {
        elem.removeEventListener(event, callbackFunc)
      } else if (elem.detachEvent) { // For IE 8 and earlier versions
        elem.detachEvent('on' + event, callbackFunc)
      }
    }
  }
  //registering and publishing events
  let registerForCustomEvents = function(componentID, eventsObj) {
    if (typeof componentID === 'string' && typeof eventsObj === 'object') {
      for (let i = 0; i < Core.registeredComponents.length; i++) {
        if (Core.registeredComponents[i].id === componentID) {
          Core.registeredComponents[i].events = eventsObj
        }
      }
    } else {
      Core.log(3, 'Incorrect parameters passed in, from registerForCustomEvents')
    }
  }
  let unregisterCustomEvent = function(componentID, eventType) {
    if (typeof componentID === 'string' && typeof eventType === 'string') {
      for (let i = 0; i < Core.registeredComponents.length; i++) {
        if (Core.registeredComponents[i].id === componentID) {
          if (Core.registeredComponents[i].events[eventType]) {
            delete Core.registeredComponents[i].events[eventType]
            Core.log(1, 'Event "' + eventType + '" for "' + componentID + '" component has been turned off', 'blue')
            return true
          } else {
            Core.log(1, '"' + componentID + '" component was not registered for ' + 'Event "' + eventType + '"', 'orange')
            return false
          }
        }
      }
      Core.log(3, '"' + componentID + '" component was not found; unregisterCustomEvent')
      return false
    } else {
      Core.log(3, ' incorrect pareameters have been passed in, from unregisterCustomEvent')
    }
  }
  let unregisterAllCustomEvents = function(componentID) {
    if (typeof componentID === 'string') {
      for (let i = 0; i < Core.registeredComponents.length; i++) {
        if (Core.registeredComponents[i] && Core.registeredComponents[i].id) {
          if (Core.registeredComponents[i].id === componentID && Core.registeredComponents[i].events) {
            delete Core.registeredComponents[i].events
            return true
          }
        }
      }
    } else {
      Core.log(3, 'Incorrect parameters passed in, from unregisterCustomEvent')
    }
  }
  let publishCustomEvent = function(eventObj) {
    for (let i = 0; i < Core.registeredComponents.length; i++) {
      if (Core.registeredComponents[i].events && Core.registeredComponents[i].events[eventObj.type]) {
        Core.registeredComponents[i].events[eventObj.type](eventObj.data)
      }
    }
  }
  let addToHistory = function(dataObj) {
    // if history object is supported
    if (window.history && history.pushState) {
      history.pushState(dataObj, dataObj.url, dataObj.url)
    } else {
      alert('Your browser needs to be upgraded to the latest version')
      Core.log(3, 'History API is not supported; from addToHistory')
    }
  }
  let getFromHistory = function(e) {
    // if history object is supported
    if (window.history && history.pushState) {
      if (e.state) {
        Core.handlePageChange(e.state.url)
      } else if (e.originalEvent && e.originalEvent.state) { // to get the original event in case of jQuery
        Core.handlePageChange(e.originalEvent.state.url)
      } else {
        Core.log(2, 'Could not get the state of event from history object')
      }
    } else {
      alert('Your browser needs to be upgraded to the latest version')
      Core.log(3, 'History API is not supported; from getFromHistory')
    }
  }
  let loadPage = function(url) {
    location.href = url
  }
  let message = function(msg) {
    // TODO: Make this work as a component.
    // OSMFire_MessageBar(msg)
  }
  // binding popstate event to getFromHistory method
  addEventHandlerToElem(window, 'popstate', getFromHistory)
  Core.addEventHandlerToElement = addEventHandlerToElem
  Core.removeEventHandlerFromElem = removeEventHandlerFromElem
  Core.registerForCustomEvents = registerForCustomEvents
  Core.publishCustomEvent = publishCustomEvent
  Core.unregisterCustomEvent = unregisterCustomEvent
  Core.unregisterAllCustomEvents = unregisterAllCustomEvents
  Core.addToHistory = addToHistory
  Core.getFromHistory = getFromHistory
  Core.loadPage = loadPage
  Core.message = message
  return Core
})(OSMFire_Core) // using tight augmentation

//we separate sub-modules in core based on functionality for easy maintenance
// AJAX functionality related augmentation
OSMFire_Core = (function(Core) {
  let $ = Core.jQuery
  Core.makeAjaxCall = function(url, theQuery, method, handler) {
    if ($ && Core.jQueryAjaxEngine && Core.jQueryAjaxEngine.makeAjaxCall) {
      Core.jQueryAjaxEngine.makeAjaxCall(url, theQuery, method, handler)
    } else {
      Core.log(3, 'Cannot make Ajax call!; from makeAjaxCall')
    }
  }
  Core.loadPageByAjax = function(apiURL, QueryStr, callbackFunc, page, method) {
    if ($ && Core.jQueryAjaxEngine && Core.jQueryAjaxEngine.loadPageByAjax) {
      Core.jQueryAjaxEngine.loadPageByAjax(apiURL, QueryStr, callbackFunc, page, method)
    } else {
      Core.log(3, 'Cannot make Ajax call!; from loadPageByAjax')
    }
  }
  Core.getJSONObj = function(url, callbackFunc) {
    if ($ && Core.jQueryAjaxEngine && Core.jQueryAjaxEngine.getJSONObj) {
      Core.jQueryAjaxEngine.getJSONObj(url, callbackFunc)
    } else {
      Core.log(3, 'Cannot make Ajax call!!; from getJSONObj')
    }
  }
  return Core
})(OSMFire_Core) // using tight augmentation

// custom event handlers in core, core registering for events
OSMFire_Core = (function(Core) {
  Core.handleImageClick = function(data) {
    Core.log(1, '  we Got click from image', 'green')
  }
  Core.handleFavlinkClick = function(data) {
    Core.log(1, '  we Got click from Link', 'green')
  }
  //broadcasting that the page has changed
  Core.handlePageChange = function(pageURL) {
    Core.publishCustomEvent({
      type: 'page-Changed',
      data: pageURL
    })
  }
  let events = {
    'FavLink-Clicked': Core.handleFavlinkClick,
    'FavImg-Clicked': Core.handleImageClick
  }
  Core.registeredComponents.push(Core)
  // to be initialized as a component
  Core.init = function() {
    Core.id = 'mainCore'
    Core.registerForCustomEvents('mainCore', events)
    Core.log(1, 'Core is listening to custom events now...', 'purple')
  }
  Core.destroy = function() {
    Core.log(1, 'Core has been destroyed...', 'purple')
    delete Core.registeredComponents[0]
  }
  //adding the index to history on the first load of the page
  history.replaceState({
    url: location.pathname
  }, location.pathname, location.pathname) // add current page to history object
  return Core
})(OSMFire_Core)