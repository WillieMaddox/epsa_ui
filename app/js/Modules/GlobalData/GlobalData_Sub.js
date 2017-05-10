var OSMFire_GlobalData = OSMFire_GlobalData || null;
var OSMFire_PageSections = (function(mainModule, subModule) {
    // assigning the subModule if it is passed in and also augmenting sub-module
    var pageSections = mainModule.pageSections = mainModule.pageSections || subModule;

    // pageSections.mapContainerDefObj = {
    //     sectionHTML: '<div id="map" class="map"></div>'
    // };
    // mainModule.getMapHTMLTxt = function() {
    //     return pageSections.mapContainerDefObj.sectionHTML;
    // };

    // pageSections.mouseUnitsContainerDefObj = {
    //     sectionHTML:
    //     '<select id="mouse-units" title="Units of the scale line.">' +
    //     '<option value="nautical">nautical mile</option>' +
    //     '<option value="imperial">imperial inch</option>' +
    //     '<option value="degrees">degrees</option>' +
    //     '<option value="metric">metric</option>' +
    //     '<option value="us">us inch</option>' +
    //     '</select>'
    // };
    // mainModule.getMouseUnitsHTMLTxt = function() {
    //     return pageSections.mouseUnitsContainerDefObj.sectionHTML;
    // };

    // pageSections.mouseProjectionContainerDefObj = {
    //     sectionHTML:
    //     '<select id="mouse-projection" title="Units of the cursor coordinates.">' +
    //     '<option value="EPSG:4326">EPSG:4326</option>' +
    //     '<option value="EPSG:3857">EPSG:3857</option>' +
    //     '</select>'
    // };
    // mainModule.getMouseProjectionHTMLTxt = function() {
    //     return pageSections.mouseProjectionContainerDefObj.sectionHTML;
    // };

    // pageSections.messageHandlerDefObj = {
    //     sectionHTML: '<div id="messagebar" class="messagebar"></div>'
    // };
    // mainModule.getMessageHandlerHTMLTxt = function() {
    //     return pageSections.messageHandlerDefObj.sectionHTML;
    // };

    if (!OSMFire_GlobalData) {
        OSMFire_GlobalData = mainModule; // reset OSMFire_GlobalData in case an empty object was passed in
    }
    return pageSections;
})(OSMFire_GlobalData || {}, OSMFire_PageSections || {}); // using Asynchronous sub-module

// Using loose augmentation to augment OSMFire_GlobalData
// and tight augmentation to augment OSMFire_PageSections
(function(mainModule, subModule) {
    //object definition for the index.html content area
    // subModule.mainContentContainerDefObj = {
    //     imagesArray: ["Image_1.jpg", "Image_2.jpg", "Image_3.jpg",
    //         "Image_4.jpg", "Image_5.jpg", "Image_6.jpg",
    //         "Image_7.jpg", "Image_8.jpg", "Image_9.jpg"
    //     ]
    // };
    // mainModule.getIndexContentAreaImagesArray = function() {
    //     return subModule.mainContentContainerDefObj.imagesArray;
    // };
})(OSMFire_GlobalData || {}, OSMFire_PageSections);