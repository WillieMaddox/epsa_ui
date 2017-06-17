/**
 * Created by maddoxw on 1/3/17.
 */

define(['MainCore'], function (OSMFire_Core) {

  'use strict'

  let callback = function(sandBox) {
    let innerHTMLStr = '<div id="messagebar" class="messagebar"></div>'
    return {
      init: function () {
        try {
          // let messages = document.getElementById('messagebar') || document.createElement('span');
          sandBox.updateElement('messagebar-container', innerHTMLStr)
          let messages = $('<div id="messagebar">')[0]
          // $('#messagebar-container').append(messages);

          let observer = new MutationObserver(function (mutations) {
            if (mutations[0].target.textContent) {
              let oldText = mutations[0].target.textContent
              let timeoutFunction = function () {
                if (oldText !== mutations[0].target.textContent) {
                  oldText = mutations[0].target.textContent
                  setTimeout(timeoutFunction, 20000)
                } else {
                  oldText = ''
                  mutations[0].target.textContent = ''
                }
              }
              setTimeout(timeoutFunction, 20000)
            }
          })
          observer.observe(messages, {childList: true})
          sandBox.log(1, 'MessageBar component has been initialized...', 'blue')
          return function message(msg) {
            messages.textContent = msg
          }
        } catch (e) {
          sandBox.log(3, 'MessageBar component has NOT been initialized correctly --> ' + e.message)
        }
      },
      destroy: function (removeComponent) {
        if (removeComponent) {
          sandBox.removeComponent('messagebar-container')
        }
        sandBox.log(1, 'MessageBar component has been destroyed...', 'blue')
      }
    }
  }
  OSMFire_Core.registerComponent('messagebar-container', 'messagebar', callback)
})