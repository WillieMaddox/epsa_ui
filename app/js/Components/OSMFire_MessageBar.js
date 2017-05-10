/**
 * Created by maddoxw on 1/3/17.
 */

define(['MainCore'], function (OSMFire_Core) {

    'use strict';

    var callback = function(sandBox) {
        var innerHTMLStr = '<div id="messagebar" class="messagebar"></div>'
        return {
            init: function () {
                try {
                    // var messages = document.getElementById('messagebar') || document.createElement('span');
                    sandBox.updateElement("messagebar-container", innerHTMLStr);
                    var messages = $('<div id="messagebar">')[0];
                    // $('#messagebar-container').append(messages);

                    var observer = new MutationObserver(function (mutations) {
                        if (mutations[0].target.textContent) {
                            var oldText = mutations[0].target.textContent;
                            var timeoutFunction = function () {
                                if (oldText !== mutations[0].target.textContent) {
                                    oldText = mutations[0].target.textContent;
                                    setTimeout(timeoutFunction, 20000);
                                } else {
                                    oldText = '';
                                    mutations[0].target.textContent = '';
                                }
                            };
                            setTimeout(timeoutFunction, 20000);
                        }
                    });
                    observer.observe(messages, {childList: true});
                    sandBox.log(1, 'MessageBar component has been initialized...', 'blue');
                    return function message(msg) {
                        messages.textContent = msg
                    };
                } catch (e) {
                    sandBox.log(3, 'MessageBar component has NOT been initialized correctly --> ' + e.message);
                }
            },
            destroy: function (removeComponent) {
                if (removeComponent) {
                    sandBox.removeComponent("messagebar-container");
                }
                sandBox.log(1, 'MessageBar component has been destroyed...', "blue");
            }
        };
    };
    OSMFire_Core.registerComponent("messagebar-container", "messagebar", callback)
});