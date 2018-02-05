(function (subscriptions) {
'use strict';

subscriptions = subscriptions && subscriptions.hasOwnProperty('default') ? subscriptions['default'] : subscriptions;

document.body.innerHTML = subscriptions();

}(subscriptions));
