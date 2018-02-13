/**
[Event]
opencategory
 **/
import on from '../on.js';

const paintFactory = function(){
    return function (categories){
        let result = `<ul>
        ${categories.map(category => {
            let categoryCtrl = {
                click : function(){
                    Array.from(document.querySelectorAll('.navigation > ul > li')).forEach(node => {
                        node.classList.remove('menu--selected')
                    });
                    this.parentNode.classList.add('menu--selected');
                    return false;
                }
            }
            return `<li><a href="#/category:${category.id}" class="menu-link ${on(categoryCtrl)}">${category.label}</a></li>`;
        }).join('')}
        </ul>`
        return result;
    }
}

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

export default navigationComponent;