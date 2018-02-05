import on from '../on.js';

function fetchLocalApi(){
  let dom = this;
  fetch('/api/v3/subscriptions').then(result => result.json()).then(result => {
    dom.innerText = JSON.stringify(result,null,2);
  });
}

export default function (){
  return `<pre class="${on({create:fetchLocalApi})}"></pre>`
}
