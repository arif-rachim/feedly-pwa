'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
    'use strict';

    /**
     * oncreate.js is a mechanism to bind the the event when an item is attached to the dom.
     */

    var eventName = 'oncreate_';
    var eventPrevix = '_';
    var stylesheet = document.createElement('style');
    stylesheet.innerHTML = ' @keyframes ' + eventName + ' { from { opacity: 0.99} to { opacity: 1} } [class^="' + eventName + '"],[class*=" ' + eventName + '"]{ animation-duration: 0.001s; animation-name: ' + eventName + '; } ';
    document.head.appendChild(stylesheet);

    var listeners = new Map();

    var ready = function ready(name) {
        return new Promise(function (resolve) {
            if (!listeners.has(name)) {
                listeners.set(name, []);
            }
            listeners.get(name).push(resolve);
        });
    };

    var dispatchReady = function dispatchReady(name, component) {
        var startIndex = name.indexOf(eventName) + eventName.length;
        var endIndex = name.indexOf(eventPrevix, startIndex);
        var compName = name.substring(startIndex, endIndex);
        listeners.get('' + eventName + compName + eventPrevix).forEach(function (resolve) {
            resolve(component);
        });
    };

    var binder = function binder(callback) {
        var name = '' + eventName + Math.round(Math.random() * 100000000) + eventPrevix;
        ready(name).then(function (component) {
            return callback.apply(component, [component]);
        });
        return name;
    };

    document.addEventListener('animationstart', function (event) {
        if (event.animationName == eventName) {
            var componentName = event.target.getAttribute('class');
            dispatchReady(componentName, event.target);
        }
    });
    function merge(target, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                target[property] = source[property];
            }
        }
    }
    function on() {
        var _arguments = arguments;

        var callback = arguments[0];
        if (typeof callback === 'function') {
            return binder(callback);
        } else {
            return binder(function (component) {
                var param = Array.from(_arguments).reduce(function (current, next) {
                    var result = {};
                    merge(result, current);
                    merge(result, next);
                    return result;
                }, {});

                var _loop = function _loop(key, value) {
                    component.addEventListener(key, function () {
                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                            args[_key] = arguments[_key];
                        }

                        value.apply(component, args);
                    });
                };

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = Object.entries(param)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _ref = _step.value;

                        var _ref2 = _slicedToArray(_ref, 2);

                        var key = _ref2[0];
                        var value = _ref2[1];

                        _loop(key, value);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                component.dispatchEvent(new Event('create'));
            });
        }
    }

    /**
    [Event]
    opencategory
     **/
    var paintFactory = function paintFactory() {
        return function (categories) {
            var result = '<ul>\n        ' + categories.map(function (category) {
                var categoryCtrl = {
                    click: function click() {
                        Array.from(document.querySelectorAll('nav > ul > li')).forEach(function (node) {
                            node.classList.remove('menu--selected');
                        });
                        this.parentNode.classList.add('menu--selected');
                        return false;
                    }
                };
                return '<li><a href="#/category:' + category.id + '" class="menu-link ' + on(categoryCtrl) + '">' + category.label + '</a></li>';
            }).join('') + '\n        </ul>';
            return result;
        };
    };

    var dispatchEventCategory = function dispatchEventCategory(categories, navigation) {
        var event = new Event('opencategory');
        event.data = categories[0];
        navigation.dispatchEvent(event);
        return categories;
    };

    var paint = paintFactory();
    var navigationComponent = {
        create: function create() {
            var navigation = this;
            fetch('/api/v3/categories', { credentials: 'same-origin' }).then(function (result) {
                return result.json();
            }).then(function (categories) {
                return dispatchEventCategory(categories, navigation);
            }).then(function (catgories) {
                return paint(catgories);
            }).then(function (output) {
                return navigation.innerHTML = output;
            });
        }
    };

    window.addEventListener('hashchange', function (event) {
        var hash = location.hash.substr(location.hash.indexOf(':') + 1, location.hash.length);
        document.querySelector('main').openCategory({
            id: hash
        }, true);
    });

    var existingTitle = [];
    var headerLoadingActive = true;
    function openCategory(category, clear) {
        var element = this;
        element.data = element.data || {};
        element.data.selectedCategory = category;
        element.data.continuation = element.data.continuation || '';
        element.data.page = element.data.page || 0;
        if (clear) {
            existingTitle = [];
            element.data.continuation = '';
            element.data.page = 0;
            document.querySelector('.button-load-more').classList.add('hide');
            element.innerHTML = '';

            requestAnimationFrame(function () {
                window.scroll({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
        element.data.page++;
        fetch('/api/v3/streams/contents?streamId=' + category.id + '&_page=' + element.data.page + '&continuation=' + element.data.continuation, { credentials: 'same-origin' }).then(function (result) {
            return result.json();
        }).then(function (result) {
            element.data.continuation = result.continuation;
            console.log('store continuation to data ', element.data.continuation);
            var template = document.createElement('template');
            template.innerHTML = result.items.filter(function (item) {
                if (existingTitle.indexOf(item.title) < 0) {
                    existingTitle.push(item.title);
                    return true;
                }
                return false;
            }).map(function (item) {
                return printArticle(item);
            }).join('');

            var contents = template.content.cloneNode(true);
            Array.from(contents.childNodes).forEach(function (node) {
                element.appendChild(node);
            });
            if (headerLoadingActive) {
                var header = document.querySelector('header');
                header.classList.add('close');
                headerLoadingActive = false;
            }
            document.querySelector('.button-load-more').classList.remove('hide');
        });
    }

    function loadNextPage() {
        var element = this;
        element.openCategory(element.data.selectedCategory);
    }

    function cleanFilterContent(content) {
        var tmp = document.createElement("div");
        tmp.innerHTML = content;
        var text = tmp.textContent || tmp.innerText || "";
        if (text.length > 150) {
            return text.substr(0, 150) + "...";
        }
        return text;
    }

    function extractImage(item) {
        if (item.origin && item.origin.title.toLowerCase().indexOf('google news') > 0) {
            var startIndex = item.summary.content.indexOf('src="');
            var endIndex = item.summary.content.indexOf('"', startIndex + 5);
            var imageUrl = item.summary.content.substring(startIndex + 5, endIndex);
            return imageUrl;
        }
        return item.visual ? item.visual.url : '';
    }

    function filterOriginTitle(title) {
        var googleNewsIndex = title.indexOf('- Google News');
        if (googleNewsIndex > 0) {
            return title.substr(0, googleNewsIndex);
        }
        return title;
    }

    function printArticle(item) {
        var articleCtrl = {
            click: function click() {
                if (item.canonicalUrl) {
                    window.open(item.canonicalUrl);
                } else if (item.alternate && item.alternate.length > 0) {
                    window.open(item.alternate[0].href);
                }
            }
        };
        return '\n    <article class="' + on(articleCtrl) + '">\n      <div class="article-container">\n        <div style="text-align: center">\n            <img src="' + extractImage(item) + '" style="margin: auto;width: 100%" onerror="this.style.display=\'none\'">\n        </div>\n        <h2 class="article--title" >' + item.title + '</h2>\n        <p class="article--origin">' + (item.origin ? filterOriginTitle(item.origin.title) : '') + ' ' + (item.author ? '/ by ' + item.author : '') + '</p>\n        <p class="article--content">' + (item.summary ? cleanFilterContent(item.summary.content) : item.content ? cleanFilterContent(item.content.content) : '') + '</p>\n        <!--\n        <pre style="font-size:0.5em">' + JSON.stringify(item, null, 4) + '</pre>\n        -->\n      </div>\n    </article>';
    }

    var articleList = {
        create: function create() {
            var component = this;
            component.openCategory = openCategory;
            component.loadNextPage = loadNextPage;
        }
    };

    var LOGGED_IN_USER = 'logged-in-user';

    function getLoggedInUser() {
        var loggedInUserString = localStorage.getItem(LOGGED_IN_USER);
        if (loggedInUserString) {
            return JSON.parse(loggedInUserString);
        }
        return false;
    }
    function saveLoggedInUser() {
        var userName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'cetc';
        var password = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'uae';

        localStorage.setItem(LOGGED_IN_USER, JSON.stringify({ userName: userName }));
    }

    var openCategory$1 = function openCategory$1(event) {
        var main = document.querySelector('main');
        main.openCategory(event.data);
    };

    var loginMediator = {
        submit: function submit(event) {
            event.preventDefault();
            saveLoggedInUser(event.target.elements.userName.value);
            window.location.reload();
        }
    };

    function loginForm() {
        return '<div style="position: absolute;width: 100vw;height:100vh;display: flex;align-items: center;justify-content: center">\n    <form class="form-login ' + on(loginMediator) + '">\n        <label>\n            <div style="text-align: center;">\n                <p style="font-size:1.8em;margin : 0px">CETC</p>\n                <p style="margin-bottom:1em">Commander\'s Emerging Technology Center</p>\n            </div>\n        </label>\n        <label>\n            User Name :\n            <input type="text" name="userName" required placeholder="Enter your user name" autofocus>\n            <span style="font-size: 0.8em;margin-left:0.2em;color: green">User Name and Password : demo/demo</span>\n        </label>\n        <label style="margin-top: 1em">\n            Password :\n            <input type="password" name="password" required placeholder="Enter your password">\n        </label>\n        <div style="margin-top : 1em">\n            <button type="submit" class="submit-button" style="float: right;border-radius: 0.5em">Login</button>\n        </div>\n    </form>\n</div>';
    }

    function onLogoutClicked() {
        var r = window.confirm(getLoggedInUser().userName + ' are you sure you want to Logout ?');
        if (r) {
            localStorage.setItem(LOGGED_IN_USER, '');
            window.location.reload();
        }
    }

    function securedPage() {
        return '\n    <div>\n        <div style="display: flex;flex-direction: column;background-color: #E4E1DE;position: fixed;width: 100vw" class="header-background">\n            <div style="margin-left: 1em;margin-right: 1em;position: relative">\n                <h1 style="margin-bottom: 0px;color: #4B4B4B;font-size:1.1em;">CETC</h1>\n                <p style="margin-top: 0px;margin-bottom:0.5em;color: #4B4B4B;font-size:0.9em">Commander\'s Emerging Technology Center</p>\n                <div style="position: absolute;bottom: -33px;right:0em;font-size: 1em;color: #4B4B4B;' + (getLoggedInUser().userName == undefined ? 'display:none' : 'display:block') + '">\n                    <button class="' + on({ click: onLogoutClicked }) + '" style="border:none;background-color: inherit;border-left: 1px solid #999999;padding-left: 1em;padding-right:1em;padding-top:7px;padding-bottom:5px;">' + getLoggedInUser().userName + '</button>\n                </div>\n            </div>\n            <nav class="' + on(navigationComponent, { opencategory: openCategory$1 }) + '" style="display: inline-block;"></nav>\n        </div>\n        \n        <div class="page" style="margin-top: 6.5em" >\n            <main class="' + on(articleList) + '">\n            </main>\n            <button class="button-load-more ' + on({ click: function click() {
                return document.querySelector('main').loadNextPage();
            } }) + '">Load More</button>\n        </div>\n    </div>\n    ';
    }

    var loginPage = {
        create: function create(event) {

            var loggedInUser = getLoggedInUser();
            if (!loggedInUser) {
                event.target.innerHTML = loginForm();
            } else {
                event.target.innerHTML = securedPage();
            }
        },
        getLoggedInUser: getLoggedInUser
    };

    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function later() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    var scrollerLastPos = 100;
    window.addEventListener('scroll', debounce(function (event) {
        if (document.documentElement.scrollTop < 60) {
            document.querySelector('.header-background').classList.remove('hide');
            document.querySelector('.header-background').classList.remove('showmenu');
        } else if (document.documentElement.scrollTop > scrollerLastPos) {
            document.querySelector('.header-background').classList.remove('showmenu');
            document.querySelector('.header-background').classList.add('hide');
        } else {
            document.querySelector('.header-background').classList.remove('hide');
            document.querySelector('.header-background').classList.add('showmenu');
        }
        requestAnimationFrame(function () {
            scrollerLastPos = document.documentElement.scrollTop;
        });
    }, 10, true));

    document.body.innerHTML = '\n<header>\n    <div>\n        <p class="header-title">CETC</p>\n        <p class="header-description">Commander Emerging Technology Center</p>\n    </div>\n</header>\n<div class="app-container ' + on(loginPage) + '"></div>\n\n<footer>\n</footer>\n';
})();