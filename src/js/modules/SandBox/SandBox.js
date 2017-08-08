"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SandBox = function (Core, contextElem, componentSelector) {
    'use strict';
    var containerElemContext = contextElem, componentID = componentSelector, // the component that this SandBox instance belongs to.
    errStr0 = 'incorrect parameters passed in; from ';
    return {
        log: function (severity, msg, color) {
            Core.log(severity, msg, color);
        },
        message: function (msg) {
            // TODO: Make this work as a component.
            Core.message(msg);
        },
        addToHistory: function (data) {
            if (data && typeof data === 'object') {
                Core.addToHistory(data);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.addToHistory');
            }
        },
        // component
        createDocumentLevelComponent: function (widgetInnerHTMLStr) {
            return Core.createDocumentLevelComponent(widgetInnerHTMLStr);
        },
        removeComponentFromDom: function (containerID) {
            Core.removeComponentFromDom(containerID);
        },
        loadComponentAndCallback: function (componentID, callbackFunc) {
            if (callbackFunc && typeof callbackFunc === 'function') {
                Core.loadComponentAndCallback(componentID, callbackFunc);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.loadComponentAndCallback');
            }
        },
        loadComponent: function (componentID) {
            Core.loadComponent(componentID);
        },
        removeComponent: function (containerID) {
            Core.updateElement(containerID, '');
        },
        loadPageDefinitionFromStorageAndCallBack: function (favouritesPageObjDefID, callbackFunc) {
            if (callbackFunc && typeof callbackFunc === 'function') {
                Core.loadPageDefinitionFromStorageAndCallBack(favouritesPageObjDefID, callbackFunc);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.loadPageDefinitionFromStorageAndCallBack');
            }
        },
        loadJSfileFromObjDefAndCallBack: function (fileName, filePath, callbackFunc) {
            if (callbackFunc && typeof callbackFunc === 'function') {
                Core.loadJSfileFromObjDefAndCallBack(fileName, filePath, callbackFunc);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.loadJSfileFromObjDefAndCallBack');
            }
        },
        loadCSSfileFromObjDef: function (fileName, filePath) {
            Core.loadCSSfileFromObjDef(fileName, filePath);
        },
        loadPageDefinitionsFileAndCallBack: function (callbackFunc) {
            if (callbackFunc && typeof callbackFunc === 'function') {
                Core.loadPageDefinitionsFileAndCallBack(callbackFunc);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.loadPageDefinitionsFileAndCallBack');
            }
        },
        loadPageDefinitions: function () {
            Core.loadPageDefinitions();
        },
        loadPage: function (url) {
            Core.loadPage(url);
        },
        loadFile: function (fileName, fileType, filePath) {
            return Core.loadFile(fileName, fileType, filePath);
        },
        removeFile: function (fileName, fileType) {
            Core.removeFile(fileName, fileType);
        },
        // DOM
        applyElementCSSClass: function (elementID, className) {
            Core.applyElementCSSClass(elementID, className);
        },
        getElement: function (elementID) {
            return Core.getElement(elementID);
        },
        setElement: function (containerID, element) {
            if (element && typeof element === 'object') {
                Core.setElement(containerID, element);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.setElement');
            }
        },
        getElementInContext: function (elementID) {
            return Core.getChildOfParentByID(containerElemContext, elementID);
        },
        getChildOfParent: function (parentElem, childID) {
            if (parentElem && childID && typeof childID === 'string') {
                return Core.getChildOfParent(parentElem, childID);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.getChildOfParent');
            }
        },
        getParentNode: function (elem) {
            if (elem && typeof elem === 'object') {
                return Core.getParentNode(elem);
            }
            else {
                Core.log(3, 'incorrect parameter passed in; from SandBox.getParentNode');
            }
        },
        setElementContext: function (elemID) {
            containerElemContext = Core.getElement(elemID);
        },
        updateElement: function (elementID, newStructure) {
            if (elementID && (typeof elementID === 'string' || typeof elementID === 'object') && newStructure && typeof newStructure === 'string') {
                Core.updateElement(elementID, newStructure);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.updateElement');
            }
        },
        // events
        addEventHandlerToElement: function (elementID, event, func) {
            if (func && typeof func === 'function') {
                // we do this so we don't traverse the whole DOM, thus increasing performance
                var childElem = Core.getChildOfParentByID(containerElemContext, elementID);
                Core.addEventHandlerToElement(childElem, event, func);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.addEventHandlerToElement');
            }
        },
        removeEventHandlerFromElement: function (elementID, event, func) {
            if (func && typeof func === 'function') {
                // we do this so we don't traverse the whole DOM, thus increasing performance
                var childElem = Core.getChildOfParentByID(containerElemContext, elementID);
                Core.removeEventHandlerFromElement(childElem, event, func);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.removeEventHandlerFromElement');
            }
        },
        addEventHandlerToParent: function (event, func) {
            // since we don't have the parent of the parent, then we just do the normal event handling attachment
            if (func && typeof func === 'function') {
                Core.addEventHandlerToElement(containerElemContext, event, func);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.addEventHandlerToParent');
            }
        },
        removeEventHandlerFromParent: function (event, func) {
            if (func && typeof func === 'function') {
                Core.removeEventHandlerFromElement(containerElemContext, event, func);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.removeEventHandlerFromParent');
            }
        },
        registerForCustomEvents: function (eventsObj) {
            if (eventsObj && typeof eventsObj === 'object') {
                Core.registerForCustomEvents(componentID, eventsObj);
            }
            else {
                Core.log(3, 'incorrect parameter passed in; from SandBox.registerForCustomEvents');
            }
        },
        unregisterCustomEvent: function (eventType) {
            Core.unregisterCustomEvent(componentID, eventType);
        },
        unregisterAllCustomEvents: function () {
            if (Core.unregisterAllCustomEvents(componentID)) {
                Core.log(1, 'All events for component ' + componentID + ' have been removed; from SandBox.unregisterAllCustomEvents', 'green');
            }
            else {
                Core.log(2, 'No custom events found for ' + componentID + ' component; from SandBox.unregisterAllCustomEvents');
            }
        },
        publishCustomEvent: function (eventObj) {
            if (eventObj && typeof eventObj === 'object') {
                Core.publishCustomEvent(eventObj);
            }
            else {
                Core.log(3, 'incorrect parameter passed in; from SandBox.publishCustomEvent');
            }
        },
        // cookies and storage
        getValueAsArrayFromCookie: function (cookieName) {
            return Core.getCookieValueAsArray(cookieName);
        },
        populateCookie: function (cookieName, value) {
            Core.CookieHandler.populateCookie(cookieName, value);
            Core.populateCookie(cookieName, value);
        },
        removeValueFromCookie: function (cookieName, value) {
            if (value) {
                Core.removeValueByValueFromCookie(cookieName, value);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.removeValueFromCookie');
            }
        },
        getValueForKeyAsObjectFromStorage: function (key, decode) {
            return Core.getValueForKeyAsObjectFromStorage(key, decode);
        },
        // ajax
        makeAjaxCall: function (apiURL, queryStr, method, callbackFunc) {
            if (callbackFunc && typeof callbackFunc === 'function') {
                Core.makeAjaxCall(apiURL, queryStr, method, callbackFunc);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.makeAjaxCall');
            }
        },
        loadPageByAjax: function (apiURL, queryStr, callbackFunc, page, method) {
            if (callbackFunc && typeof callbackFunc === 'function') {
                Core.loadPageByAjax(apiURL, queryStr, callbackFunc, page, method);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.loadPageByAjax');
            }
        },
        getJSONObj: function (apiURL, callbackFunc) {
            if (callbackFunc && typeof callbackFunc === 'function') {
                Core.getJSONObj(apiURL, callbackFunc);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.getJSONObj');
            }
        },
        // openlayers
        getMap: function () {
            return Core.getMap();
        },
        getView: function () {
            return Core.getView();
        },
        setMap: function (map) {
            if (map && typeof map === 'object') {
                Core.setMap(map);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.setMap');
            }
        },
        addControl: function (control) {
            if (control && typeof control === 'object') {
                Core.addControl(control);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.addMapControl');
            }
        },
        getMouseProjection: function () {
            return Core.getMouseProjection();
        },
        setMouseProjection: function (proj) {
            Core.setMouseProjection(proj);
        },
        getMousePrecision: function () {
            return Core.getMousePrecision();
        },
        setMousePrecision: function () {
            Core.setMousePrecision();
        },
        getFormat: function (format) {
            return Core.getFormat(format);
        },
        getLoadingStrategy: function (strategy) {
            return Core.getLoadingStrategy(strategy);
        },
        getSource: function (source, opt) {
            return Core.getSource(source, opt);
        },
        getLayer: function (layer, opt) {
            return Core.getLayer(layer, opt);
        },
        addLayer: function (layer) {
            Core.addLayer(layer);
        },
        selectLayer: function (layer) {
            if (layer && typeof layer === 'object') {
                return Core.selectLayer(layer);
            }
            else {
                Core.log(3, errStr0 + 'SandBox.selectLayer');
            }
        },
        getSelectedLayer: function () {
            return Core.getSelectedLayer();
        },
        deselectLayer: function () {
            return Core.deselectLayer();
        }
    };
};
exports.default = SandBox;
//# sourceMappingURL=SandBox.js.map