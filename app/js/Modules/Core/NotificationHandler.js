// using simple sub-module augmentation
define(['MainCore'], function(OSMFire_Core) {
    var self = {},
        NotificationWidgetDef, NotificationWidgetObj;
    // initialize as a core sub-modules
    self.initialize = function() {
        this.id = "Notification";
        OSMFire_Core.registeredComponents.push(this);
        OSMFire_Core.log(1, 'NotificationHandler Module has been initialized...', "blue");
    };
    // initialize as a component 
    self.init = function() {
        OSMFire_Core.registerForCustomEvents("Notification", {
            'support-Clicked': this.handleSupportClick
        });
        OSMFire_Core.log(1, 'NotificationHandler is listening to custom events now...', 'purple');
    };
    self.destroy = function() {
        OSMFire_Core.unregisterAllCustomEvents("Notification");
        OSMFire_Core.log(1, 'NotificationHandler has been destroyed...', 'purple');
    };
    self.handleSupportClick = function() {
        // name of the component when it registers itself with core is used here
        NotificationWidgetObj = OSMFire_Core.getComponentByID("notificationWidget");
        if (!NotificationWidgetObj) {
            OSMFire_Core.loadComponent(OSMFire_GlobalData.getNoficationWidgetDefID(), self.renderWidget);
        } else {
            self.renderWidget();
        }
    };
    self.renderWidget = function() {
        OSMFire_Core.getComponentByID("notificationWidget").renderWidget();
    };
    // register with MainCore
    self.register = (function() {
        OSMFire_Core.registerModule(self);
    })();
    return OSMFire_Core.NotificationHandler = {
        handleSupportClick: self.handleSupportClick
    };
});