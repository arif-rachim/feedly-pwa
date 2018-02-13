import on from '../on.js';
let backButtonCtrl = {
    click : function(){
        document.querySelector('.article-detail').classList.remove('article-detail--open');
    }
}
let shit = {
    click : function(){
        document.querySelector('.article-detail').classList.remove('article-detail--open');
    }
}

function openNews(address){
    // lets create iframe inside this shit !
    let component = this;
    component.innerHTML = `
    <div class="article-detail--header navigation">
        <button class="back-button ${on(backButtonCtrl)}">Back</button>
        <button class="back-button ${on({
        click : function(){
            window.open(address);
        }
    })}" style="float: right;margin-right: 0em;">Open In New Tab</button>
    </div>
    <object class="embed-news" type="text/html" data="${location.origin}/clean-address?address=${address}" style="width:100%; height:100%"></object>`;
    component.classList.add('article-detail--open');
}

let ui = {
    create : function(){
        let component = this;
        component.openNews = openNews;
    }
}

export default ui;