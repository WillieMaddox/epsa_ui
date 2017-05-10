var OSMFire_GlobalData = (function(module) {
    "use strict";
    var favCookieName = "OSM_Fire",
        pageDefintionsFile = "PageDefinitions.js",
        pageDefinitionsFilePath = "js/Modules/PageDefinitions/",
        FavouritesPageObjDefID = "FavouritesPageDef",
        NoficationWidgetDefID = "NotificationWidgetDef",
        buttonWidgetDefs = {
            "AddWmsDefID": "AddWmsDef",
            "AddWfsDefID": "AddWfsDef",
            "AddVectorDefID": "AddVectorDef",
            "NewVectorDefID": "NewVectorDef",
        };

    module.initialize = function() {
        console.log('GlobalData Module has been initialized');
    };
    module.getFavCookieName = function() {
        return favCookieName;
    };
    module.getPageDefinitionsFileName = function() {
        return pageDefintionsFile;
    };
    module.getPageDefinitionsFilePath = function() {
        return pageDefinitionsFilePath;
    };
    module.getFavouritesPageObjDefID = function() {
        return FavouritesPageObjDefID;
    };
    module.getNoficationWidgetDefID = function() {
        return NoficationWidgetDefID;
    };
    module.getButtonWidgetDefID = function(DefID) {
        return buttonWidgetDefs[DefID]
    };
    return module;
})(OSMFire_GlobalData || {}); //using loose augmentation