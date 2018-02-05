import on from '../on.js';

function fetchLocalApi(){
  let dom = this;
  let continuation = '';
  fetch('/api/v3/categories',{credentials: 'same-origin'}).then(result => result.json()).then(result => {
    dom.innerHTML = result.map(category => {
      return `
        <section id="${category.id}">
          <h1>${category.label}</h1>
          <div class="content ${on({create:function(){
            let contentDom = this;

            fetch(`/api/v3/streams/contents?streamId=${category.id}`,{credentials: 'same-origin'}).then(result => result.json())
            .then(result => {
              debugger;
              continuation = result.continuation;
              contentDom.innerHTML = result.items.map(item => {
                return `<article>
                <h2>${item.title}</h2>
                <p>${item.summary.content}</p>
                </article>`
              }).join('');
            });

          }})}"></div>
          <button class="loadmore ${on({click:function(){
            let contentDom = this.parentElement.querySelector(':scope > .content');
            fetch(`/api/v3/streams/contents?streamId=${category.id}&continuation=${continuation}`,{credentials: 'same-origin'}).then(result => result.json())
            .then(result => {
              continuation = result.continuation;
              let template = document.createElement('template');
              template.innerHTML =  result.items.map(item => {
                return `<article>
                <h2>${item.title}</h2>
                <p>${item.summary ? item.summary.content : ''}</p>
                </article>`
              }).join('');

              let contents = template.content.cloneNode(true);
              Array.from(contents.childNodes).forEach(node => {
                contentDom.appendChild(node);
              });
            });

          }})}">Load More</button>
        </section>
      `
    }).join('');


  });
}

export default function (){
  return `<div class="${on({create:fetchLocalApi})}"></div>`
}
