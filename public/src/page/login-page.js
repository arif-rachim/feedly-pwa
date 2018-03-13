import articleList from "./article-list.js";
import articleNavigation from "./article-navigation.js";
import on from "../on.js";

const LOGGED_IN_USER = 'logged-in-user';

function getLoggedInUser(){
    let loggedInUserString = localStorage.getItem(LOGGED_IN_USER);
    if(loggedInUserString){
        return JSON.parse(loggedInUserString);
    }
    return false;
}
function saveLoggedInUser(userName='cetc',password='uae'){
    localStorage.setItem(LOGGED_IN_USER,JSON.stringify({userName:userName}));
}

const openCategory = function(event){
    let main = document.querySelector('main');
    main.openCategory(event.data);
};

const loginMediator = {
    submit : function (event){
        event.preventDefault();
        saveLoggedInUser(event.target.elements.userName.value);
        window.location.reload();
    }
};

function loginForm(){
    return `<div style="position: absolute;width: 100vw;height:100vh;display: flex;align-items: center;justify-content: center">
    <form class="form-login ${on(loginMediator)}">
        <label>
            <div style="text-align: center;">
                <p style="font-size:1.8em;margin : 0px">CETC</p>
                <p style="margin-bottom:1em">Commander's Emerging Technology Center</p>
            </div>
        </label>
        <label>
            User Name :
            <input type="text" name="userName" required placeholder="Enter your user name" autofocus>
            <span style="font-size: 0.8em;margin-left:0.2em;color: green">User Name and Password : demo/demo</span>
        </label>
        <label style="margin-top: 1em">
            Password :
            <input type="password" name="password" required placeholder="Enter your password">
        </label>
        <div style="margin-top : 1em">
            <button type="submit" class="submit-button" style="float: right;border-radius: 0.5em">Login</button>
        </div>
    </form>
</div>`
}

function onLogoutClicked(){
    let r = window.confirm(`${getLoggedInUser().userName} are you sure you want to Logout ?`);
    if(r){
        localStorage.setItem(LOGGED_IN_USER,'');
        window.location.reload();
    }
}

function securedPage(){
    return `
    <div>
        <div style="display: flex;flex-direction: column;background-color: #E4E1DE;position: fixed;width: 100vw" class="header-background">
            <div style="margin-left: 1em;margin-right: 1em;position: relative">
                <h1 style="margin-bottom: 0px;color: #4B4B4B;font-size:1.1em;">CETC</h1>
                <p style="margin-top: 0px;margin-bottom:0.5em;color: #4B4B4B;font-size:0.9em">Commander's Emerging Technology Center</p>
                <div style="position: absolute;bottom: -33px;right:0em;font-size: 1em;color: #4B4B4B;${getLoggedInUser().userName == undefined ? 'display:none' : 'display:block'}">
                    <button class="${on({click:onLogoutClicked})}" style="border:none;background-color: inherit;border-left: 1px solid #999999;padding-left: 1em;padding-right:1em;padding-top:7px;padding-bottom:5px;">${getLoggedInUser().userName}</button>
                </div>
            </div>
            <nav class="${on(articleNavigation, {opencategory: openCategory})}" style="display: inline-block;"></nav>
        </div>
        
        <div class="page" style="margin-top: 6.5em" >
            <main class="${on(articleList)}">
            </main>
            <button class="button-load-more ${on({click: () => document.querySelector('main').loadNextPage()})}">Load More</button>
        </div>
    </div>
    `
}

export default {
    create : function (event){

        let loggedInUser = getLoggedInUser();
        if(!loggedInUser){
            event.target.innerHTML = loginForm();
        }else{
           event.target.innerHTML = securedPage();
        }
    },
    getLoggedInUser : getLoggedInUser
}