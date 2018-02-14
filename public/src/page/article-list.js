
import on from '../on.js';

window.addEventListener('hashchange',(event)=>{
    let hash = location.hash.substr(location.hash.indexOf(':')+1,location.hash.length);
    document.querySelector('main').openCategory({
        id : hash
    },true);
});

let existingTitle = [];
let headerLoadingActive = true;
function openCategory (category,clear) {
    let element = this;
    element.data = element.data || {};
    element.data.selectedCategory = category;
    element.data.continuation = element.data.continuation || '';
    element.data.page = element.data.page || 0;
    if(clear){
        existingTitle = [];
        element.data.continuation = '';
        element.data.page = 0;
        element.innerHTML = '';
        requestAnimationFrame(function(){
            window.scroll({
                top : 0,
                behavior : 'smooth'
            })
        });
    }
    element.data.page++;
    fetch(`/api/v3/streams/contents?streamId=${category.id}&_page=${element.data.page}&continuation=${element.data.continuation}`, {credentials: 'same-origin'}).then(result => result.json())
        .then(result => {
            element.data.continuation = result.continuation;
            console.log('store continuation to data ',element.data.continuation);
            let template = document.createElement('template');
            template.innerHTML = result.items.filter(item => {
                if(existingTitle.indexOf(item.title) < 0){
                    existingTitle.push(item.title);
                    return true;
                }
                return false;
            }).map(item => {
                return printArticle(item);
            }).join('');

            let contents = template.content.cloneNode(true);
            Array.from(contents.childNodes).forEach(node => {
                element.appendChild(node);
            });
            if(headerLoadingActive){
                let header = document.querySelector('header');
                header.classList.add('close');
                headerLoadingActive = false;
            }

        });
}

function loadNextPage(){
    let element = this;
    element.openCategory(element.data.selectedCategory);
}

function cleanFilterContent(content){
    var tmp = document.createElement("div");
    tmp.innerHTML = content;
    let text = tmp.textContent || tmp.innerText || "";
    if(text.length > 150){
        return text.substr(0,150)+"..."
    }
    return text;
}

function extractImage(item){
    if(item.origin && item.origin.title.toLowerCase().indexOf('google news') > 0){
        let startIndex = item.summary.content.indexOf('src="');
        let endIndex = item.summary.content.indexOf('"',startIndex+5);
        let imageUrl = item.summary.content.substring(startIndex+5,endIndex);
        return imageUrl;
    }
    return item.visual ? item.visual.url : '';
}

function filterOriginTitle(title){
    let googleNewsIndex = title.indexOf('- Google News');
    if(googleNewsIndex > 0){
        return title.substr(0,googleNewsIndex);
    }
    return title;
}

function printArticle(item){
    let articleCtrl = {
        click : function(){
            if(item.canonicalUrl){
                window.open(item.canonicalUrl);
            }else if(item.alternate && item.alternate.length > 0){
                window.open(item.alternate[0].href);
            }
        }
    }
    return `
    <article class="${on(articleCtrl)}">
      <div class="article-container">
        <div style="text-align: center">
            <img src="${extractImage(item)}" style="margin: auto;width: 100%" onerror="this.style.display='none'">
        </div>
        <h2 class="article--title" >${item.title}</h2>
        <p class="article--origin">${item.origin ? filterOriginTitle(item.origin.title) : ''} ${item.author ? `/ by ${item.author}` : ''}</p>
        <p class="article--content">${item.summary ? cleanFilterContent(item.summary.content) :  item.content ? cleanFilterContent(item.content.content) : ''}</p>
        <!--
        <pre style="font-size:0.5em">${JSON.stringify(item,null,4)}</pre>
        -->
      </div>
    </article>`;
}

export default {
    create : function(){
        let component = this;
        component.openCategory = openCategory;
        component.loadNextPage = loadNextPage;
    }
}