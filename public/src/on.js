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

export default (callback) => {
    if(typeof callback === 'function'){
        return binder(callback);
    }else{
        return binder((component)=>{
            for(let [key,value] of Object.entries(callback)){
                component.addEventListener(key,(...args) => {
                    value.apply(component,args);
                });
            }
            component.dispatchEvent(new Event('create'));
        });
    }

};
