const SandBox = function (Core, contextElem, componentSelector) {
  'use strict';
  let containerElemContext = contextElem,
    componentID = componentSelector, // the component that this SandBox instance belongs to.
    errStr0 = 'incorrect parameters passed in; from ';
  return {
    log: function (severity: number, msg: string, color) {
      Core.log(severity, msg, color)
    },
    message: function (msg: string) {
      // TODO: Make this work as a component.
      Core.message(msg);
    },
    addToHistory: function (data: object) {
      Core.addToHistory(data)
    },
    // component
    createDocumentLevelComponent: function (widgetInnerHTMLStr:string) {
      return Core.createDocumentLevelComponent(widgetInnerHTMLStr)
    },
    removeComponentFromDom: function (containerID: string) {
      Core.removeComponentFromDom(containerID)
    },
    loadComponentAndCallback: function (componentID: string, callbackFunc) {
      if (callbackFunc && typeof callbackFunc === 'function') {
        Core.loadComponentAndCallback(componentID, callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadComponentAndCallback')
      }
    },
    loadComponent: function (componentID: string) {
      Core.loadComponent(componentID)
    },
    removeComponent: function (containerID: string) {
      Core.updateElement(containerID, '')
    },
    loadPageDefinitionFromStorageAndCallBack: function (favouritesPageObjDefID: string, callbackFunc) {
      if (callbackFunc && typeof callbackFunc === 'function') {
        Core.loadPageDefinitionFromStorageAndCallBack(favouritesPageObjDefID, callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadPageDefinitionFromStorageAndCallBack')
      }
    },
    loadJSfileFromObjDefAndCallBack: function (fileName: string, filePath: string, callbackFunc) {
      if (callbackFunc && typeof callbackFunc === 'function') {
        Core.loadJSfileFromObjDefAndCallBack(fileName, filePath, callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadJSfileFromObjDefAndCallBack')
      }
    },
    loadCSSfileFromObjDef: function (fileName: string, filePath: string) {
      Core.loadCSSfileFromObjDef(fileName, filePath)
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
    loadPage: function (url: string) {
      Core.loadPage(url)
    },
    loadFile: function (fileName: string, fileType: string, filePath: string) {
      return Core.loadFile(fileName, fileType, filePath)
    },
    removeFile: function (fileName: string, fileType: string) {
      Core.removeFile(fileName, fileType)
    },
    // DOM
    applyElementCSSClass: function (elementID: string, className: string) {
      Core.applyElementCSSClass(elementID, className)
    },
    getElement: function (elementID: string) {
      return Core.getElement(elementID)
    },
    setElement: function (containerID: string, element: object) {
      Core.setElement(containerID, element)
    },
    getElementInContext: function (elementID: string) {
      return Core.getChildOfParentByID(containerElemContext, elementID)
    },
    getChildOfParent: function (parentElem: object, childID: string) {
      return Core.getChildOfParent(parentElem, childID)
    },
    getParentNode: function (elem: object) {
      return Core.getParentNode(elem)
    },
    setElementContext: function (elemID: string) {
      containerElemContext = Core.getElement(elemID)
    },
    updateElement: function (elementID: string | object, newStructure: string) {
      Core.updateElement(elementID, newStructure)
      // if (elementID && (typeof elementID === 'string' || typeof elementID === 'object') && newStructure && typeof newStructure === 'string') {
      //   Core.updateElement(elementID, newStructure)
      // } else {
      //   Core.log(3, errStr0 + 'SandBox.updateElement')
      // }
    },
    // events
    addEventHandlerToElement: function (elementID: string, event: string, func) {
      if (func && typeof func === 'function') {
        // we do this so we don't traverse the whole DOM, thus increasing performance
        let childElem = Core.getChildOfParentByID(containerElemContext, elementID);
        Core.addEventHandlerToElement(childElem, event, func)
      } else {
        Core.log(3, errStr0 + 'SandBox.addEventHandlerToElement')
      }
    },
    addEventHandlerToParent: function (event: string, func) {
      // since we don't have the parent of the parent, then we just do the normal event handling attachment
      if (func && typeof func === 'function') {
        Core.addEventHandlerToElement(containerElemContext, event, func)
      } else {
        Core.log(3, errStr0 + 'SandBox.addEventHandlerToParent')
      }
    },
    removeEventHandlerFromElement: function (elementID: string, event: string, func) {
      if (func && typeof func === 'function') {
        // we do this so we don't traverse the whole DOM, thus increasing performance
        let childElem = Core.getChildOfParentByID(containerElemContext, elementID);
        Core.removeEventHandlerFromElement(childElem, event, func)
      } else {
        Core.log(3, errStr0 + 'SandBox.removeEventHandlerFromElement')
      }
    },
    removeEventHandlerFromParent: function (event: string, func) {
      if (func && typeof func === 'function') {
        Core.removeEventHandlerFromElement(containerElemContext, event, func)
      } else {
        Core.log(3, errStr0 + 'SandBox.removeEventHandlerFromParent')
      }
    },
    subscribeToCustomEvents: function (eventsObj: object) {
      Core.subscribeToCustomEvents(componentID, eventsObj)
    },
    unsubscribeFromCustomEvent: function (eventType: string) {
      Core.unsubscribeFromCustomEvent(componentID, eventType)
    },
    unsubscribeFromAllCustomEvents: function () {
      if (Core.unsubscribeFromAllCustomEvents(componentID)) {
        Core.log(1, 'All events for component ' + componentID + ' have been removed; from SandBox.unsubscribeFromAllCustomEvents', 'green')
      } else {
        Core.log(2, 'No custom events found for ' + componentID + ' component; from SandBox.unsubscribeFromAllCustomEvents')
      }
    },
    publishCustomEvent: function (eventObj: object) {
      Core.publishCustomEvent(eventObj);
      Core.log(1, componentID + ' published an event', 'green')
    },
    // cookies and storage
    getValueAsArrayFromCookie: function (cookieName: string) {
      return Core.getCookieValueAsArray(cookieName)
    },
    populateCookie: function (cookieName: string, value) {
      Core.CookieHandler.populateCookie(cookieName, value);
      Core.populateCookie(cookieName, value)
    },
    removeValueFromCookie: function (cookieName: string, value) {
      if (value) {
        Core.removeValueByValueFromCookie(cookieName, value)
      } else {
        Core.log(3, errStr0 + 'SandBox.removeValueFromCookie')
      }
    },
    getValueForKeyAsObjectFromStorage: function (key: string, decode) {
      return Core.getValueForKeyAsObjectFromStorage(key, decode)
    },
    // ajax
    makeAjaxCall: function (apiURL: string, queryStr: string, method, callbackFunc) {
      if (callbackFunc && typeof callbackFunc === 'function') {
        Core.makeAjaxCall(apiURL, queryStr, method, callbackFunc)
      } else {
        Core.log(3, errStr0 + 'SandBox.makeAjaxCall')
      }
    },
    loadPageByAjax: function (apiURL: string, queryStr: string, callbackFunc, page, method) {
      if (callbackFunc && typeof callbackFunc === 'function') {
        Core.loadPageByAjax(apiURL, queryStr, callbackFunc, page, method)
      } else {
        Core.log(3, errStr0 + 'SandBox.loadPageByAjax')
      }
    },
    getJSONObj: function (apiURL: string, callbackFunc) {
      if (callbackFunc && typeof callbackFunc === 'function') {
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
    setMouseProjection: function (proj: string) {
      Core.setMouseProjection(proj)
    },
    getMousePrecision: function () {
      return Core.getMousePrecision()
    },
    setMousePrecision: function () {
      Core.setMousePrecision()
    },
    getFormat: function (format: string) {
      return Core.getFormat(format)
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
};

export default SandBox
