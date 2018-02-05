
import subscriptions from './page/subscriptions.js';
import categories from './page/categories.js';
import router from './router.js';

//router.config({mode:'history'});
/*
router.add(/subscriptions/, function(){
  document.body.innerHTML = subscriptions();
})
.add(/categories/, function(){
  document.body.innerHTML = categories();
})
.add(function(){
  document.body.innerHTML = categories();
}).listen();

router.navigate();
*/
document.body.innerHTML = categories();
