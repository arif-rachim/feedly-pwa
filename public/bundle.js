(function () {
'use strict';

/**
 * oncreate.js is a mechanism to bind the the event when an item is attached to the dom.
 */
const eventName = 'oncreate_';
const eventPrevix = '_';
const stylesheet = document.createElement('style');
stylesheet.innerHTML = ` @keyframes ${eventName} { from { opacity: 0.99} to { opacity: 1} } [class^="${eventName}"],[class*=" ${eventName}"]{ animation-duration: 0.001s; animation-name: ${eventName}; } `;
document.head.appendChild(stylesheet);

const listeners = new Map();

const ready = (name) =>{
    return new Promise(resolve => {
        if(!listeners.has(name)){
            listeners.set(name,[]);
        }
        listeners.get(name).push(resolve);
    });
};

const dispatchReady = (name,component) => {
    let startIndex = name.indexOf(eventName)+eventName.length;
    let endIndex = name.indexOf(eventPrevix,startIndex);
    let compName = name.substring(startIndex,endIndex);
    listeners.get(`${eventName}${compName}${eventPrevix}`).forEach(resolve => {
        resolve(component);
    });
};


const binder = (callback) =>{
    let name = `${eventName}${Math.round(Math.random()* 100000000)}${eventPrevix}`;
    ready(name).then((component) => callback.apply(component,[component]));
    return name;
};


document.addEventListener('animationstart',(event)=>{
    if(event.animationName == eventName){
        let componentName = event.target.getAttribute('class');
        dispatchReady(componentName,event.target);
    }
});
function merge(target,source){
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            target[property] = source[property];
        }
    }
}
function on() {
    let callback = arguments[0];
    if(typeof callback === 'function'){
        return binder(callback);
    }else{
        return binder((component)=>{
            let param = Array.from(arguments).reduce((current,next) => {
                let result = {};
                merge(result,current);
                merge(result,next);
                return result;
            },{});
            for(let [key,value] of Object.entries(param)){
                component.addEventListener(key,(...args) => {
                    value.apply(component,args);
                });
            }
            component.dispatchEvent(new Event('create'));
        });
    }

}

/**
[Event]
opencategory
 **/
const paintFactory = function(){
    return function (categories){
        let result = `<ul>
        ${categories.map(category => {
            let categoryCtrl = {
                click : function(){
                    Array.from(document.querySelectorAll('nav > ul > li')).forEach(node => {
                        node.classList.remove('menu--selected');
                    });
                    this.parentNode.classList.add('menu--selected');
                    return false;
                }
            };
            return `<li><a href="#/category:${category.id}" class="menu-link ${on(categoryCtrl)}">${category.label}</a></li>`;
        }).join('')}
        </ul>`;
        return result;
    }
};

const dispatchEventCategory = function(categories,navigation){
    let event = new Event('opencategory');
    event.data = categories[0];
    navigation.dispatchEvent(event);
    return categories;
};

let paint = paintFactory();
const navigationComponent = {
    create : function(){
        let navigation = this;
        fetch('/api/v3/categories',{credentials: 'same-origin'})
            .then(result => result.json())
            .then(categories => dispatchEventCategory(categories,navigation))
            .then(catgories => paint(catgories))
            .then(output => navigation.innerHTML = output);
    }
};

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
        document.querySelector('.button-load-more').classList.add('hide');
        element.innerHTML = '';

        requestAnimationFrame(function(){
            window.scroll({
                top : 0,
                behavior : 'smooth'
            });
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
            document.querySelector('.button-load-more').classList.remove('hide');
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
    };
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

var articleList = {
    create : function(){
        let component = this;
        component.openCategory = openCategory;
        component.loadNextPage = loadNextPage;
    }
}

const openCategory$1 = function(event){
    let main = document.querySelector('main');
    main.openCategory(event.data);
};

document.body.innerHTML = `
<header>
    <div>
        <p class="header-title">CETC</p>
        <p class="header-description">Commander Emerging Technology Center</p>
    </div>
</header>
<div style="display: flex;flex-direction: column">
    <div style="display: flex;flex-direction: column;background-color: #E4E1DE" class="header-background">
        <div style="margin-left: 2em;margin-right: 2em">
            <h1 style="margin-bottom: 0px;color: #4B4B4B">CETC</h1>
            <p style="margin-top: 0px;color: #4B4B4B">Commander's Emerging Technology Center</p>
        </div>
        <nav class="${on(navigationComponent, {opencategory: openCategory$1})}" style="display: inline-block;height: 50px"></nav>
    </div>
    <div style="overflow: auto;height: calc(100vh - 160px)">
        <div class="page" >
            <main class="${on(articleList)}">
            </main>
            <button class="button-load-more ${on({click: () => document.querySelector('main').loadNextPage()})}">Load More</button>
        </div>
    </div>
</div>
<footer>
</footer>
`;

}());
