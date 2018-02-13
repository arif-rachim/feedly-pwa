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
                        Array.from(document.querySelectorAll('.navigation > ul > li')).forEach(function (node) {
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
        if (text.length > 250) {
            return text.substr(0, 250) + "...";
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
                var event = new Event('displaynews');
                if (item.canonicalUrl) {
                    event.data = item.canonicalUrl;
                } else if (item.alternate && item.alternate.length > 0) {
                    event.data = item.alternate[0].href;
                }
                window.dispatchEvent(event);
            }
        };
        return '\n    <article class="' + on(articleCtrl) + '">\n      <div class="article-container">\n        <div style="text-align: center">\n            <img src="' + extractImage(item) + '" style="margin: auto;width: 100%" onerror="this.style.display=\'none\'">\n        </div>\n        <h2 class="article--title" >' + item.title + '</h2>\n        <p class="article--origin">' + (item.origin ? filterOriginTitle(item.origin.title) : '') + ' ' + (item.author ? '/ by ' + item.author : '') + '</p>\n        <p class="article--content">' + (item.summary ? cleanFilterContent(item.summary.content) : item.content ? cleanFilterContent(item.content.content) : '') + '</p>\n        <!--\n        <pre style="font-size:0.5em">' + JSON.stringify(item, null, 4) + '</pre>\n        -->\n      </div>\n    </article>';
    }

    var mainComp = {
        create: function create() {
            var component = this;
            component.openCategory = openCategory;
            component.loadNextPage = loadNextPage;
        }
    };

    var backButtonCtrl = {
        click: function click() {
            document.querySelector('.article-detail').classList.remove('article-detail--open');
        }
    };

    function openNews(address) {
        // lets create iframe inside this shit !
        var component = this;
        component.innerHTML = '\n    <div class="article-detail--header navigation">\n        <button class="back-button ' + on(backButtonCtrl) + '">Back</button>\n        \n        <button class="back-button ' + on({
            click: function click() {
                window.open(address);
            }
        }) + '" style="float: right;margin-right: 0em;">Open In New Tab</button>\n    </div>\n    <p id="loading-detail-text" class="loading-text" style="display: inline-block">Loading ...</p>\n    <object class="embed-news ' + on({ load: function load() {
                document.querySelector('#loading-detail-text').style.display = 'none';
            } }) + '" type="text/html" data="' + location.origin + '/clean-address?address=' + address + '" style="width:100%; height:100%" ></object>';
        component.classList.add('article-detail--open');
    }

    var ui = {
        create: function create() {
            var component = this;
            component.openNews = openNews;
        }
    };

    window.addEventListener('displaynews', function (event) {
        var news = event.data;
        var articleDetailComp = document.querySelector('section.article-detail');
        articleDetailComp.style = {};
        articleDetailComp.openNews(news);
    });

    window.addEventListener('scroll', function () {
        var lastScrollTop = 0;
        var isScrollUp = true;

        return function (event) {
            var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
            var scrollDirection = st < lastScrollTop;
            if (scrollDirection != isScrollUp) {
                requestAnimationFrame(function () {
                    isScrollUp = scrollDirection;
                    var nav = document.querySelector('nav');
                    nav.classList.toggle('nav-up');
                });
            }

            var d = document.documentElement;
            var offset = d.scrollTop + window.innerHeight;
            var height = d.offsetHeight;

            if (offset === height) {
                var main = document.querySelector('main');
                main.loadNextPage();
            }
            lastScrollTop = st;
        };
    }());

    var openCategory$1 = function openCategory$1(event) {
        var main = document.querySelector('main');
        main.openCategory(event.data);
    };

    document.body.innerHTML = '\n<header>\n    <div>\n        <p class="header-title">Defense News</p>\n        <p class="header-description">Latest news and emerging technology</p>\n    </div>\n</header>\n<nav class="navigation ' + on(navigationComponent, { opencategory: openCategory$1 }) + '" ></nav>\n<main class="' + on(mainComp) + '">\n</main>\n<p class="loading-text">Loading ...</p>\n<section class="article-detail ' + on(ui) + '">\n    \n</section>\n<footer>\n</footer>\n\n\n';
})();