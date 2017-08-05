const SandBox = function (Core, contextElem, componentSelector) {
  'use strict'
  let containerElemContext = contextElem,
    componentID = componentSelector, // the component that this SandBox instance belongs to.
    errStr0 = 'incorrect parameters passed in; from '
  return {
    log: function (severity, msg, color) {
      if (severity && typeof severity === 'number' && msg && typeof msg === 'string') {
        Core.log(severity, msg, color)
      } else {
        Core.log(3, errStr0 + 'SandBox.log')
      }
    },
    message: function (msg) {
      // TODO: Make this work as a component.
      if (msg && typeof msg === 'string') {
        Core.message(msg)
      } else {
        Core.log(3, errStr0 + 'SandBox.message')
      }
    },
    addToHistory: function (data) {
      if (data && typeof data === 'object') {
        Core.addToHistory(data)
      } else {
        Core.log(3, errStr0 + 'SandBox.addToHistory')
      }
    },
    // component
    createDocumentLevelComponent: function (widgetInnerHTMLStr) {
      if (widgetInnerHTMLStr && typeof widgetInnerHTMLStr === 'string') {
        return Core.createDocumentLevelComponent(widgetInnerHTMLStr)
      } else {
        Core.log(3, errStr0 + 'SandBox.createDocumentLevelComponent')
      }
    },
    removeComponentFromDom: function (containerID) {
      if (containerID && typeof containerID === 'string') {
        Core.removeComponentFromDom(containerID)
      } else {
        Core.log(3, errStr0 + 'SandBox.removeComponentFromDom')
      }
    },
    loadComponentAndCallback: function (componentID, callbackFunc) {
      if (componentID && typeof componentID === 'string' && callbackFunc && typeof callbackFunc === 'function') {
        Core.loadComponentAndCallback(componentID, callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadComponentAndCallback')
      }
    },
    loadComponent: function (componentID) {
      if (componentID && typeof componentID === 'string') {
        Core.loadComponent(componentID)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadComponent')
      }
    },
    removeComponent: function (containerID) {
      if (containerID && typeof containerID === 'string') {
        Core.updateElement(containerID, '')
      } else {
        Core.log(3, errStr0 + 'SandBox.removeComponent')
      }
    },
    getComponentObjAndCallback: function (favouritesPageObjDefID, callbackFunc) {
      if (favouritesPageObjDefID && typeof favouritesPageObjDefID === 'string' && callbackFunc && typeof callbackFunc === 'function') {
        Core.getComponentObjAndCallback(favouritesPageObjDefID, callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.getComponentObjAndCallback')
      }
    },
    loadJSfileFromObjDefAndCallBack: function (fileName, filePath, callbackFunc) {
      if (fileName && typeof fileName === 'string' && filePath && typeof filePath === 'string' && callbackFunc && typeof callbackFunc === 'function') {
        Core.loadJSfileFromObjDefAndCallBack(fileName, filePath, callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadJSfileFromObjDefAndCallBack')
      }
    },
    loadCSSfileFromObjDef: function (fileName, filePath) {
      if (fileName && typeof fileName === 'string' && filePath && typeof filePath === 'string') {
        Core.loadCSSfileFromObjDef(fileName, filePath)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadCSSfileFromObjDef')
      }
    },
    loadPageDefinitionsFileAndCallBack: function (callbackFunc) {
      if (callbackFunc && typeof callbackFunc === 'function') {
        Core.loadPageDefinitionsFileAndCallBack(callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadPageDefinitionsFileAndCallBack')
      }
    },
    loadPageDefinitions: function () {
      Core.loadPageDefinitions()
    },
    loadPage: function (url) {
      if (url && typeof url === 'string') {
        Core.loadPage(url)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadPage')
      }
    },
    loadFile: function (fileName, fileType, filePath) {
      if (fileName && typeof fileName === 'string' && fileType && typeof fileType === 'string' && filePath && typeof filePath === 'string') {
        return Core.loadFile(fileName, fileType, filePath)
      } else {
        Core.log(3, errStr0 + 'SandBox.LoadFile')
      }
    },
    removeFile: function (fileName, fileType) {
      if (fileName && typeof fileName === 'string' && fileType && typeof fileType === 'string') {
        Core.removeFile(fileName, fileType)
      } else {
        Core.log(3, errStr0 + 'SandBox.removeFile')
      }
    },
    // DOM
    applyElementCSSClass: function (elementID, className) {
      if (elementID && typeof elementID === 'string' && className && typeof className === 'string') {
        Core.applyElementCSSClass(elementID, className)
      } else {
        Core.log(3, errStr0 + 'SandBox.applyElementCSSClass')
      }
    },
    getElement: function (elementID) {
      if (elementID && typeof elementID === 'string') {
        return Core.getElement(elementID)
      } else {
        Core.log(3, errStr0 + 'SandBox.getElement')
      }
    },
    setElement: function (containerID, element) {
      if (containerID && typeof containerID === 'string' && element && typeof element === 'object') {
        Core.setElement(containerID, element)
      } else {
        Core.log(3, errStr0 + 'SandBox.setElement')
      }
    },
    getElementInContext: function (elementID) {
      if (elementID && typeof elementID === 'string') {
        return Core.getChildOfParentByID(containerElemContext, elementID)
      } else {
        Core.log(3, errStr0 + 'SandBox.getElementInContext')
      }
    },
    getChildOfParent: function (parentElem, childID) {
      if (parentElem && childID && typeof childID === 'string') {
        return Core.getChildOfParent(parentElem, childID)
      } else {
        Core.log(3, errStr0 + 'SandBox.getChildOfParent')
      }
    },
    getParentNode: function (elem) {
      if (elem && typeof elem === 'object') {
        return Core.getParentNode(elem)
      } else {
        Core.log(3, 'incorrect parameter passed in; from SandBox.getParentNode')
      }
    },
    setElementContext: function (elemID) {
      if (elemID && typeof elemID === 'string') {
        containerElemContext = Core.getElement(elemID)
      } else {
        Core.log(3, errStr0 + 'SandBox.setElementContext')
      }
    },
    updateElement: function (elementID, newStructure) {
      if (elementID && (typeof elementID === 'string' || typeof elementID === 'object') && newStructure && typeof newStructure === 'string') {
        Core.updateElement(elementID, newStructure)
      } else {
        Core.log(3, errStr0 + 'SandBox.updateElement')
      }
    },
    // events
    addEventHandlerToElement: function (elementID, event, func) {
      if (elementID && typeof elementID === 'string' && event && typeof event === 'string' && func && typeof func === 'function') {
        // we do this so we don't traverse the whole DOM, thus increasing performance
        let childElem = Core.getChildOfParentByID(containerElemContext, elementID)
        Core.addEventHandlerToElement(childElem, event, func)
      } else {
        Core.log(3, errStr0 + 'SandBox.addEventHandlerToElement')
      }
    },
    removeEventHandlerFromElement: function (elementID, event, func) {
      if (elementID && typeof elementID === 'string' && event && typeof event === 'string' && func && typeof func === 'function') {
        // we do this so we don't traverse the whole DOM, thus increasing performance
        let childElem = Core.getChildOfParentByID(containerElemContext, elementID)
        Core.removeEventHandlerFromElement(childElem, event, func)
      } else {
        Core.log(3, errStr0 + 'SandBox.removeEventHandlerFromElement')
      }
    },
    addEventHandlerToParent: function (event, func) {
      // since we don't have the parent of the parent, then we just do the normal event handling attachment
      if (event && typeof event === 'string' && func && typeof func === 'function') {
        Core.addEventHandlerToElement(containerElemContext, event, func)
      } else {
        Core.log(3, errStr0 + 'SandBox.addEventHandlerToParent')
      }
    },
    removeEventHandlerFromParent: function (event, func) {
      if (event && typeof event === 'string' && func && typeof func === 'function') {
        Core.removeEventHandlerFromElement(containerElemContext, event, func)
      } else {
        Core.log(3, errStr0 + 'SandBox.removeEventHandlerFromParent')
      }
    },
    registerForCustomEvents: function (eventsObj) {
      if (eventsObj && typeof eventsObj === 'object') {
        Core.registerForCustomEvents(componentID, eventsObj)
      } else {
        Core.log(3, 'incorrect parameter passed in; from SandBox.registerForCustomEvents')
      }
    },
    unregisterCustomEvent: function (eventType) {
      if (eventType && typeof eventType === 'string') {
        Core.unregisterCustomEvent(componentID, eventType)
      } else {
        Core.log(3, 'incorrect parameter passed in; from SandBox.unregisterCustomEvent')
      }
    },
    unregisterAllCustomEvents: function () {
      if (Core.unregisterAllCustomEvents(componentID)) {
        Core.log(1, 'All events for component ' + componentID + ' have been removed; from SandBox.unregisterAllCustomEvents', 'green')
      } else {
        Core.log(2, 'No custom events found for ' + componentID + ' component; from SandBox.unregisterAllCustomEvents')
      }
    },
    publishCustomEvent: function (eventObj) {
      if (eventObj && typeof eventObj === 'object') {
        Core.publishCustomEvent(eventObj)
      } else {
        Core.log(3, 'incorrect parameter passed in; from SandBox.publishCustomEvent')
      }
    },
    // cookies and storage
    getValueAsArrayFromCookie: function (cookieName) {
      if (cookieName && typeof cookieName === 'string') {
        return Core.getCookieValueAsArray(cookieName)
      } else {
        Core.log(3, errStr0 + 'SandBox.getValueAsArrayFromCookie')
      }
    },
    populateCookie: function (cookieName, value) {
      if (cookieName && typeof cookieName === 'string') {
        Core.CookieHandler.populateCookie(cookieName, value)
        Core.populateCookie(cookieName, value)
      } else {
        Core.log(3, errStr0 + 'SandBox.populateCookie')
      }
    },
    removeValueFromCookie: function (cookieName, value) {
      if (cookieName && typeof cookieName === 'string' && value) {
        Core.removeValueByValueFromCookie(cookieName, value)
      } else {
        Core.log(3, errStr0 + 'SandBox.removeValueFromCookie')
      }
    },
    getValueForKeyAsObjectFromStorage: function (key, decode) {
      if (key && typeof key === 'string') {
        return Core.getValueForKeyAsObjectFromStorage(key, decode)
      } else {
        Core.log(3, errStr0 + 'SandBox.getValueForKeyAsObjectFromStorage')
      }
    },
    // ajax
    makeAjaxCall: function (apiURL, queryStr, method, callbackFunc) {
      if (apiURL && typeof apiURL === 'string' && queryStr && typeof queryStr === 'string' && callbackFunc && typeof callbackFunc === 'function') {
        Core.makeAjaxCall(apiURL, queryStr, method, callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.makeAjaxCall')
      }
    },
    loadPageByAjax: function (apiURL, queryStr, callbackFunc, page, method) {
      if (apiURL && typeof apiURL === 'string' && queryStr && typeof queryStr === 'string' && callbackFunc && typeof callbackFunc === 'function') {
        Core.loadPageByAjax(apiURL, queryStr, callbackFunc, page, method)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadPageByAjax')
      }
    },
    getJSONObj: function (apiURL, callbackFunc) {
      if (apiURL && typeof apiURL === 'string' && callbackFunc && typeof callbackFunc === 'function') {
        Core.getJSONObj(apiURL, callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.getJSONObj')
      }
    },
    // openlayers
    getMap: function () {
      return Core.getMap()
    },
    getView: function () {
      return Core.getView()
    },
    setMap: function (map) {
      if (map && typeof map === 'object') {
        Core.setMap(map)
      } else {
        Core.log(3, errStr0 + 'SandBox.setMap')
      }
    },
    addControl: function (control) {
      if (control && typeof control === 'object') {
        Core.addControl(control)
      } else {
        Core.log(3, errStr0 + 'SandBox.addMapControl')
      }
    },
    getMouseProjection: function () {
      return Core.getMouseProjection()
    },
    setMouseProjection: function (proj) {
      if (proj && typeof proj === 'string') {
        Core.setMouseProjection(proj)
      } else {
        Core.log(3, errStr0 + 'SandBox.setMouseProjection')
      }
    },
    getMousePrecision: function () {
      return Core.getMousePrecision()
    },
    setMousePrecision: function () {
      Core.setMousePrecision()
    },
    getFormat: function (format) {
      if (format && typeof format === 'string') {
        return Core.getFormat(format)
      } else {
        Core.log(3, errStr0 + 'SandBox.getFormat')
      }
    },
    getLoadingStrategy: function (strategy) {
      return Core.getLoadingStrategy(strategy)
    },
    getSource: function (source, opt) {
      return Core.getSource(source, opt)
    },
    getLayer: function (layer, opt) {
      return Core.getLayer(layer, opt)
    },
    addLayer: function (layer) {
      Core.addLayer(layer)
    },
    selectLayer: function (layer) {
      if (layer && typeof layer === 'object') {
        return Core.selectLayer(layer)
      } else {
        Core.log(3, errStr0 + 'SandBox.selectLayer')
      }
    },
    getSelectedLayer: function () {
      return Core.getSelectedLayer()
    },
    deselectLayer: function () {
      return Core.deselectLayer()
    }
  }
}

export default SandBox
