(function() {
    var FavouritesPageDefinition = {
        pageID: "Favourites",
        htmlStr: "<div id='favouritedHeader'><h3>Your Favorite Images</h3></div>",
        cssFile: "FavoritesView.css",
        cssPath: "css/"
    };
    var NotificationWidgetDefinition = {
        componentID: "notificationWidget",
        scriptFile: "NotificationWidget.js",
        scriptPath: "/js/Widgets/",
        cssFile: "NotificationWidget.css",
        cssPath: "css/"
    };
    var AddWmsWidgetDefinition = {
        componentID: "addWmsWidget",
        scriptFile: "AddWmsDialogWidget.js",
        scriptPath: "/app/js/Widgets/"
        // cssFile: "NotificationWidget.css",
        // cssPath: "css/"
    };
    var AddWfsWidgetDefinition = {
        componentID: "addWfsWidget",
        scriptFile: "AddWfsDialogWidget.js",
        scriptPath: "/app/js/Widgets/"
        // cssFile: "NotificationWidget.css",
        // cssPath: "css/"
    };
    var AddVectorWidgetDefinition = {
        componentID: "addVectorWidget",
        scriptFile: "AddVectorDialogWidget.js",
        scriptPath: "/app/js/Widgets/"
        // cssFile: "NotificationWidget.css",
        // cssPath: "css/"
    };
    var NewVectorWidgetDefinition = {
        componentID: "newVectorWidget",
        scriptFile: "NewVectorDialogWidget.js",
        scriptPath: "/app/js/Widgets/"
        // cssFile: "NotificationWidget.css",
        // cssPath: "css/"
    };
    OSMFire_Core.saveValueToLocalStorage(
        OSMFire_GlobalData.getFavouritesPageObjDefID(),
        FavouritesPageDefinition);
    OSMFire_Core.saveValueToLocalStorage(
        OSMFire_GlobalData.getNoficationWidgetDefID(),
        NotificationWidgetDefinition);
    OSMFire_Core.saveValueToLocalStorage(
        OSMFire_GlobalData.getButtonWidgetDefID("AddWmsDefID"),
        AddWmsWidgetDefinition);
    OSMFire_Core.saveValueToLocalStorage(
        OSMFire_GlobalData.getButtonWidgetDefID("AddWfsDefID"),
        AddWfsWidgetDefinition);
    OSMFire_Core.saveValueToLocalStorage(
        OSMFire_GlobalData.getButtonWidgetDefID("AddVectorDefID"),
        AddVectorWidgetDefinition);
    OSMFire_Core.saveValueToLocalStorage(
        OSMFire_GlobalData.getButtonWidgetDefID("NewVectorDefID"),
        NewVectorWidgetDefinition);
    // OSMFire_Core.saveValueToLocalStorage(
    //     OSMFire_GlobalData.getButtonWidgetDefID("NewVectorDefID"),
    //     NewVectorWidgetDefinition);
})();
