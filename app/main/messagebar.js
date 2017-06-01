/**
 * Created by maddoxw on 1/3/17.
 */

define(function (require) {
    'use strict';

    var $ = require('jquery');

    var messages = $('<div id="messagebar">')[0];
    $('#messagebar-container').append(messages);
    // var messages = document.getElementById('messagebar') || document.createElement('span');
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
    return function message(msg) {
        messages.textContent = msg
    }
});