import articleNavigation from './page/article-navigation.js';
import articleList from './page/article-list.js';

import on from './on.js';



const openCategory = function(event){
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
        <nav class="${on(articleNavigation, {opencategory: openCategory})}" style="display: inline-block;height: 50px"></nav>
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
