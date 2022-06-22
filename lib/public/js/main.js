'use strict';

console.log('Hello, pals!!');

/**/
var unique = require('uniq');
var data = [1, 2, 2, 3, 4, 5, 5, 5, 6, 0, 0, 11, 8, 9, -1, -2];
console.log(unique(data).sort((a, b) => a-b));
/**/

window.$ = require("jquery");
require("bootstrap");


var alertPlaceholder = document.getElementById('liveAlertPlaceholder')
var alertTrigger = document.getElementById('liveAlertBtn')

function alert(message, type) {
  var wrapper = document.createElement('div')
  wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'

  alertPlaceholder.append(wrapper)
}

if (alertTrigger) {
  alertTrigger.addEventListener('click', function () {
    alert('Nice, you triggered this alert message!', 'success')
  })
}

/**/
$(window).on('load', () => {
  Object.entries(flashMessage).map(entry => {
    entry[1].map(message => {alert(message, entry[0]);});
  });
});
/**/
