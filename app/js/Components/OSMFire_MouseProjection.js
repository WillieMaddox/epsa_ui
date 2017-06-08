/**
 * Created by maddoxw on 12/28/16.
 */
define(['jquery', 'MainCore'], function ($, OSMFire_Core) {

    "use strict";

    let callback = function(sandBox) {
        let innerHTMLStr = '<select id="mouse-projection" title="Units of the cursor coordinates.">' +
        '<option value="EPSG:4326">EPSG:4326</option>' +
        '<option value="EPSG:3857">EPSG:3857</option>' +
        '</select>';

        return {
            init: function () {
                try {
                    sandBox.updateElement("mouse-projection-container", innerHTMLStr);
                    this.registerForEvents();
                    sandBox.contextObj = this;
                    sandBox.log(1, 'Mouse Projection component has been initialized...', 'blue');
                    // sandBox.message('Mouse Projection component has been initialized...');
                } catch (e) {
                    sandBox.log(3, 'Mouse Projection component has NOT been initialized correctly --> ' + e.message);
                }
            },
            destroy: function (removeComponent) {
                sandBox.contextObj.unregisterFromEvents();
                if (removeComponent) {
                    sandBox.removeComponent("mouse-projection-container");
                }
                sandBox.log(1, 'Mouse Projection component has been destroyed...', "blue");
            },
            registerForEvents: function () {
                sandBox.addEventHandlerToElement("mouse-projection", "change", this.handleMouseProjectionChanged);
            },
            unregisterFromEvents: function () {
                sandBox.removeEventHandlerFromElem("mouse-projection", "change", this.handleMouseProjectionChanged);
            },
            handleMouseProjectionChanged: function (e) {
                sandBox.setMouseProjection(this.value);
                sandBox.publishCustomEvent({
                    type: 'mouseprojection-Changed',
                    data: this.value
                });
                e.preventDefault();
                e.stopPropagation();
            }
        };
    };
    OSMFire_Core.registerComponent("mouse-projection-container", "mouse-projection", callback)
});