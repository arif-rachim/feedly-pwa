import articleNavigation from './page/article-navigation.js';
import articleList from './page/article-list.js';

import on from './on.js';

const openCategory = function(event){
    let main = document.querySelector('main');
    main.openCategory(event.data);
};

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
let scrollerLastPos = 100;
window.addEventListener('scroll', debounce(function(event){
    if(document.documentElement.scrollTop <60){
        document.querySelector('.header-background').classList.remove('hide');
        document.querySelector('.header-background').classList.remove('showmenu');
    }else if(document.documentElement.scrollTop > scrollerLastPos){
        document.querySelector('.header-background').classList.remove('showmenu');
        document.querySelector('.header-background').classList.add('hide');
    }else{
        document.querySelector('.header-background').classList.remove('hide');
        document.querySelector('.header-background').classList.add('showmenu');
    }
    scrollerLastPos = document.documentElement.scrollTop;
},100));

document.body.innerHTML = `
<header>
    <div>
        <p class="header-title">CETC</p>
        <p class="header-description">Commander Emerging Technology Center</p>
    </div>
</header>
<div >
    <div style="display: flex;flex-direction: column;background-color: #E4E1DE;position: fixed;width: 100vw" class="header-background">
        <div style="margin-left: 2em;margin-right: 2em">
            <h1 style="margin-bottom: 0px;color: #4B4B4B">CETC</h1>
            <p style="margin-top: 0px;color: #4B4B4B">Commander's Emerging Technology Center</p>
        </div>
        <nav class="${on(articleNavigation, {opencategory: openCategory})}" style="display: inline-block;height: 50px"></nav>
    </div>
    
    <div class="page" style="margin-top: 9em" >
        <main class="${on(articleList)}">
        </main>
        <button class="button-load-more ${on({click: () => document.querySelector('main').loadNextPage()})}">Load More</button>
    </div>
    
</div>
<footer>
</footer>
`;
