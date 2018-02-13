
import navigationComp from './page/navigation-comp.js';
import mainComp from './page/main-comp.js';
import articleDetailComp from './page/article-detail-comp.js';

import on from './on.js';

window.addEventListener('displaynews',function(event){
    let news = event.data;
    let articleDetailComp = document.querySelector('section.article-detail');
    articleDetailComp.style = {}
    articleDetailComp.openNews(news);
});

window.addEventListener('scroll',(function(){
    let lastScrollTop = 0;
    let isScrollUp = true;



    return function(event){
        let st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
        let scrollDirection = st < lastScrollTop;
        if(scrollDirection!=isScrollUp){
            requestAnimationFrame(function(){
                isScrollUp = scrollDirection;
                let nav = document.querySelector('nav');
                nav.classList.toggle('nav-up');
            });
        }

        let d = document.documentElement;
        let offset = d.scrollTop + window.innerHeight;
        let height = d.offsetHeight;

        if (offset === height) {
            let main = document.querySelector('main');
            main.loadNextPage();
        }
        lastScrollTop = st;
    }
})());

const openCategory = function(event){
    let main = document.querySelector('main');
    main.openCategory(event.data);
};

document.body.innerHTML = `
<header>
    <div>
        <p class="header-title">Defense News</p>
        <p class="header-description">Latest news and emerging technology</p>
    </div>
</header>
<nav class="navigation ${on(navigationComp,{opencategory:openCategory})}" ></nav>
<main class="${on(mainComp)}">
</main>
<p class="loading-text">Loading ...</p>
<section class="article-detail ${on(articleDetailComp)}">
    
</section>
<footer>
</footer>


`;
