OSMFire_Core.registerComponent("mainPageContainer", "notificationWidget", function(sandBox) {
    let widgetInnerHTMLStr = '<div id="notificationMainContainer">' +
        '<h1 class="centerElem header">Thank you for visiting us.</h1>' +
        '<h3 class="centerElem header">All the images on this site are provided by <a href="https://stocksnap.io">stocksnap.io</a>.</h3>' +
        '<h3 class="centerElem header">We thank them and encourage you to visit their site.</h3>' +
        '<div class="buttonContainer">' +
        '<div class="button button-left" id="notification_visit">Visit stocksnap.io</div>' +
        '<div class="button button-right" id="notification_close">Close</div>' +
        '</div>' + '</div>';
    let widgetMainContainer, stockSnapURL = "https://stocksnap.io";
    return {
        init: function() {
            try {
                sandBox.contextObj = this;
                sandBox.log(1, 'Notification Widget component has been initialized...', 'blue');
            } catch (e) {
                sandBox.log(3, 'Notification Widget has NOT been initialized correctly --> ' + e.message);
            }
        },
        destroy: function(removeComponent) {
            sandBox.contextObj.unregisterFromEvents();
            if (removeComponent) {
                sandBox.removeComponentFromDom("widgetContainer");
            }
            sandBox.log(1, 'Notification Widget has been destroyed...', "blue");
        },
        renderWidget: function() {
            let generatedWidget;
            generatedWidget = sandBox.createDocumentLevelComponent(widgetInnerHTMLStr);
            generatedWidget.id = "widgetContainer";
            sandBox.setElementContext(generatedWidget.id);
            this.registerForEvents();
        },
        registerForEvents: function() {
            sandBox.addEventHandlerToElement("notification_visit", "click", this.handleVisitClick);
            sandBox.addEventHandlerToElement("notification_close", "click", this.handleCloseClick);
        },
        unregisterFromEvents: function() {
            sandBox.removeEventHandlerFromElem("notification_visit", "click", this.handleVisitClick);
            sandBox.removeEventHandlerFromElem("notification_close", "click", this.handleCloseClick);
        },
        handleVisitClick: function() {
            sandBox.loadPage(stockSnapURL);
        },
        handleCloseClick: function() {
            sandBox.contextObj.unregisterFromEvents();
            sandBox.removeComponentFromDom("widgetContainer");
        }
    };
 });

