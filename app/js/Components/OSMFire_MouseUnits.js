/**
 * Created by maddoxw on 12/28/16.
 */
define(['jquery', 'MainCore'], function ($, OSMFire_Core) {

    "use strict";

    let callback = function(sandBox) {
        let innerHTMLStr =
            '<select id="mouse-units" title="Units of the scale line.">' +
            '<option value="nautical">nautical mile</option>' +
            '<option value="imperial">imperial inch</option>' +
            '<option value="degrees">degrees</option>' +
            '<option value="metric">metric</option>' +
            '<option value="us">us inch</option>' +
            '</select>';
        return {
            init: function () {
                try {
                    sandBox.updateElement("mouse-units-container", innerHTMLStr);
                    this.registerForEvents();
                    sandBox.contextObj = this;
                    sandBox.log(1, 'Mouse Units component has been initialized...', 'blue');
                } catch (e) {
                    sandBox.log(3, 'Mouse Units component has NOT been initialized correctly --> ' + e.message);
                }
            },
            destroy: function (removeComponent) {
                sandBox.contextObj.unregisterFromEvents();
                if (removeComponent) {
                    sandBox.removeComponent("mouse-units-container");
                }
                sandBox.log(1, 'Mouse Units component has been destroyed...', "blue");
            },
            registerForEvents: function () {
                sandBox.addEventHandlerToElement("mouse-units", "change", this.handleMouseUnitsChanged);
            },
            unregisterFromEvents: function () {
                sandBox.removeEventHandlerFromElem("mouse-units", "change", this.handleMouseUnitsChanged);
            },
            handleMouseUnitsChanged: function (e) {
                sandBox.publishCustomEvent({
                    type: 'mouseunits-Changed',
                    data: this.value
                });
                e.preventDefault();
                e.stopPropagation();
            }
        };
    };
    OSMFire_Core.registerComponent("mouse-units-container", "mouse-units", callback)
});