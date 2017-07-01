(function() {
  const FavouritesPageDefinition = {
    pageID: 'Favourites',
    htmlStr: "<div id='favouritedHeader'><h3>Your Favorite Images</h3></div>",
    cssFile: 'FavoritesView.css',
    cssPath: 'css/'
  }
  const NotificationWidgetDefinition = {
    componentID: 'notificationWidget',
    scriptFile: 'NotificationWidget.js',
    scriptPath: '/js/Widgets/',
    cssFile: 'NotificationWidget.css',
    cssPath: 'css/'
  }
  const AddWmsWidgetDefinition = {
    componentID: 'addWmsWidget',
    scriptFile: 'AddWmsDialogWidget.js',
    scriptPath: '/src/js/Widgets/'
    // cssFile: "NotificationWidget.css",
    // cssPath: "css/"
  }
  const AddWfsWidgetDefinition = {
    componentID: 'addWfsWidget',
    scriptFile: 'AddWfsDialogWidget.js',
    scriptPath: '/src/js/Widgets/'
    // cssFile: "NotificationWidget.css",
    // cssPath: "css/"
  }
  const AddVectorWidgetDefinition = {
    componentID: 'addVectorWidget',
    scriptFile: 'AddVectorDialogWidget.js',
    scriptPath: '/src/js/Widgets/'
    // cssFile: "NotificationWidget.css",
    // cssPath: "css/"
  }
  const NewVectorWidgetDefinition = {
    componentID: 'newVectorWidget',
    scriptFile: 'NewVectorDialogWidget.js',
    scriptPath: '/src/js/Widgets/'
    // cssFile: "NotificationWidget.css",
    // cssPath: "css/"
  }
  OSMFire_Core.saveValueToLocalStorage(
    OSMFire_GlobalData.getFavouritesPageObjDefID(),
    FavouritesPageDefinition)
  OSMFire_Core.saveValueToLocalStorage(
    OSMFire_GlobalData.getNoficationWidgetDefID(),
    NotificationWidgetDefinition)
  OSMFire_Core.saveValueToLocalStorage(
    OSMFire_GlobalData.getButtonWidgetDefID('AddWmsDefID'),
    AddWmsWidgetDefinition)
  OSMFire_Core.saveValueToLocalStorage(
    OSMFire_GlobalData.getButtonWidgetDefID('AddWfsDefID'),
    AddWfsWidgetDefinition)
  OSMFire_Core.saveValueToLocalStorage(
    OSMFire_GlobalData.getButtonWidgetDefID('AddVectorDefID'),
    AddVectorWidgetDefinition)
  OSMFire_Core.saveValueToLocalStorage(
    OSMFire_GlobalData.getButtonWidgetDefID('NewVectorDefID'),
    NewVectorWidgetDefinition)
  // OSMFire_Core.saveValueToLocalStorage(
  //     OSMFire_GlobalData.getButtonWidgetDefID("NewVectorDefID"),
  //     NewVectorWidgetDefinition);
})()
