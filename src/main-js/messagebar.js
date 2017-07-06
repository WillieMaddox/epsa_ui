/**
 * Created by maddoxw on 1/3/17.
 */

'use strict'
import $ from 'jquery'

let messages = $('<div id="messagebar">')[0]
$('#messagebar-container').append(messages)
// let messages = document.getElementById('messagebar') || document.createElement('span');
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
const result = function message (msg) {
  messages.textContent = msg
}
export default result
