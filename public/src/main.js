import articleNavigation from './page/article-navigation.js';
import articleList from './page/article-list.js';
import loginPage from './page/login-page.js';
import on from './on.js';


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
    requestAnimationFrame(function(){
        scrollerLastPos = document.documentElement.scrollTop;
    });
},10,true));


document.body.innerHTML = `
<header>
    <div>
        <p class="header-title">CETC</p>
        <p class="header-description">Commander Emerging Technology Center</p>
    </div>
</header>
<div class="app-container ${on(loginPage)}"></div>

<footer>
</footer>
`;
