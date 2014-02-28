(function (win, doc) {
    'use strict';

    /**
     * Helpers
     */
    var head = doc.head || doc.querySelector('head'),
        /**
         * @example
         * element[bind](prefix + 'click', function () {...});
         */
        bind = win.addEventListener ? 'addEventListener' : 'attachEvent',
        prefix = (bind === 'attachEvent') ? 'on' : '',

        /**
         * Stores data getted from AJAX requests for reusage.
         * @type {Object}
         * @private
         */
        responses = {};

    /**
     * Support for IE8 for trim() using regex
     * @private
     * @param {String} str
     * @returns {Boolean}
     */
    function isEmpty(str) {
        return (win.String.prototype.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '')).length === 0;
    }

    /**
     * Gets an element from "data-js" or "id" attribute
     * @private
     * @param {String} id The "data-js" or "id" attribute of the element
     * @returns {Element}
     */
    function getElement(id) {
        return doc.querySelector('[data-js="' + id + '"]') || doc.getElementById(id);
    }

    /**
     * Sets "disclosure-hidden" and "aria-hidden" to false.
     * @private
     * @param {Element} el
     */
    function showElement(el) {
        el.setAttribute('disclosure-hidden', 'false');
        el.setAttribute('aria-hidden', 'false');
    }

    /**
     * Sets "disclosure-hidden" and "aria-hidden" to true.
     * @private
     * @param {Element} el
     */
    function hideElement(el) {
        el.setAttribute('disclosure-hidden', 'true');
        el.setAttribute('aria-hidden', 'true');
    }

    /**
     * Discloses information progressively, revealing only the essentials.
     * @constructor
     * @param {Element} wrapper A container with the "disclosure" attribute.
     * @returns {disclosure} A new instance of Disclosure.
     *
     * @todo Sometimes the element must be the trigger: <button disclosure disclosure-event="click"....> It has the 3 properties: disclosure, disclosure-url and disclosure-container.
     * @todo Unit testing Jasmine.
     * @todo loading spinner
     * @todo Preload method to save time on predictible loadings. Just do the request and grab response into this.responses.
     * @todo usar localstorage para ni siquiera hacer el primer request
     */
    function Disclosure(wrapper) {
        /**
         * Reference to the context of an instance.
         * @type {Object}
         * @private
         */
        var that = this;

        /**
         * Wrapper of functionality. It can contain the triggers or
         * be a trigger. It's where the event will be delegated.
         * @type {HTMLElement}
         */
        this.wrapper = wrapper;

        /**
         * The event to be listened on this.wrapper.
         * @type {String}
         */
        this.event = wrapper.getAttribute('disclosure-event') || 'change';

        /**
         * The container for the response data. It's used as the default
         * container if there is no container defined in each trigger.
         * @type {HTMLElement}
         */
        this.container = getElement(wrapper.getAttribute('disclosure-container'));

        /**
         * Stores data getted from predefined DOM containers for reusage.
         * @type {Object}
         */
        this.contents = {};

        /**
         * All the elements with associated functionality to be watched on this.event.
         * @type {NodeList}
         */
        this.triggers = wrapper.querySelectorAll(
            // URL and/or container (querySelectorAll merges duplicated elements)
            '[disclosure-url],' +
            '[disclosure-container],' +
            // For example: A radio button into a wrapper with a common container
            '[disclosure-container] [checked],' +
            // For example: An option into a select with a common container
            '[disclosure-container] [selected]'
        );

        /**
         * Reference to the last trigger. Use to be manipulated after switch to a new trigger.
         * @type {Element}
         */
        this.lastTriggerShown;

        /**
         * Reference to the last container. Use to be manipulated after switch to a new container.
         * @type {Element}
         */
        this.lastContainerShown;

        // Listen for "triggers" on "event" in "wrapper"
        this.wrapper[bind](prefix + this.event, function (event) {
            // Prevent to trigger anchors and submit inputs/buttons
            if (el.nodeName === 'A' || el.type === 'submit') {
                event.preventDefault();
            }

            that.select(event.target || event.srcElement);
        });

        //
        this.checkPreselectedTriggers();

        //
        //this.preloadAJAXContent();
    }

    /**
     *
     */
    function initialize(container) {
        // `container` is to search for new disclosures within a new AJAX response
        var wrappers = (container || doc).querySelectorAll('[disclosure]'),
            i = 0,
            j = wrappers.length;

        for (i; i < j; i += 1) {
            win._disclosures.push(new Disclosure(wrappers[i]));
        }
    }

    /**
     *
     * @todo Use vanilla js
     * @todo
     * var xhr = new win.XMLHttpRequest();
     * xhr.open('GET', url, true);
     * xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
     * xhr.onload = function () {
     *     if (this.status === 200) {
     *         callback(JSON.parse(this.response));
     *     } else {
     *         doc.querySelector('body').innerHTML = this.response;
     *     }
     * };
     * xhr.send();
     */
    function requestHttp(url, success) {//console.log('requestHttp');
        $.ajax({
            'url': url,
            'dataType': 'json',
            'success': success,
            'error': function (jqXHR, textStatus, errorThrown) {
                doc.querySelector('body').innerHTML = errorThrown;
            }
        });
    }

    /**
     *
     * @todo Add support for urls
     */
    function createCustomElement(type, data) {

        var el = doc.createElement(type);

        el.innerHTML = data;

        head.appendChild(el);
    }

    /**
     *
     */
    // Disclosure.prototype.preloadAJAXContent = function () {

    //     var preloads = this.wrapper.querySelectorAll('[disclosure-preload]'),
    //         i = preloads.length,
    //         responses = this.responses;

    //     while (i) {
    //         // Use this pattern to avoid loss reference to i
    //         (function (i) {
    //             var url = preloads[i].getAttribute('disclosure-url') || preloads[i].href;

    //             win[bind](prefix + 'load', function () {
    //                 if (!responses[url]) {
    //                     requestHttp(url, function (data) {
    //                         // Save on this.responses, so it will be reached
    //                         // when content must be loaded
    //                         responses[url] = data;
    //                     });
    //                 }
    //             });
    //         }(i -= 1));
    //     }
    // };

    Disclosure.prototype.select = function (el) {

        var lastShown = this.lastTriggerShown;

        // HTMLSelectElement's selected option or a radio button
        el = el.options ? el.options[this.wrapper.selectedIndex] : el;

        // The "el" is a valid trigger defined by the user
        if (this.isTrigger(el)) {
            // Hide the last defined container if that trigger isn't checked
            // Support for Radio || HTMLSelectElement
            if (lastShown && (lastShown.checked === false || lastShown.value !== this.wrapper.value)) {
                this.hide();
            }
            this.show(el);
        // Hide the last defined container if the new selected trigger
        // doesn't match with a valid trigger
        } else {
            this.hide();
        }
    };

    /**
     *
     */
    Disclosure.prototype.checkPreselectedTriggers = function () {

        var i = this.triggers.length,
            trigger,
            container;

        while (i) {
            i -= 1;
            trigger = this.triggers[i];

            // When this trigger is checked...
            // Support Radio Buttons and Select Element
            if (trigger.checked || (this.wrapper.value && trigger.value === this.wrapper.value)) {

                container = this.getContainer(trigger);

                // Container has a pre-setted content
                if (!isEmpty(container.innerHTML)) {
                    //console.log('vino algo del server:'+container.innerHTML);

                    var wrappercontentnew = doc.createElement('div');
                    // wrappercontentnew.setAttribute('aria-hidden', 'true');

                    // wrappercontentnew.id = container.id;

                    // container.id = null;

                    container.parentNode.insertBefore(wrappercontentnew, container);

                    wrappercontentnew.appendChild(container);

                    if (this.container === container) {
                        this.container = wrappercontentnew;
                    }

                    //console.log("wrappeo todo con un nuevo container");

                    // Save it in the map of contents using the trigger as reference
                    this.contents[trigger.outerHTML] = container;

                    this.lastTriggerShown = trigger;
                    this.lastContainerShown = container;
                } else {
                    this.show(trigger);
                }
            }
        }
    };

    /**
     *
     * @returns {Boolean}
     */
    Disclosure.prototype.isTrigger = function (el) {

        var i = this.triggers.length;

        while (i) {
            i -= 1;
            if (this.triggers[i] === el) {
                return true;
            }
        }

        return false;
    };

    /**
     *
     * @todo 'beforeshow' is not triggered when it's preselected
     */
    Disclosure.prototype.show = function (trigger) {//console.log('show');

        $(trigger).trigger('beforeshow.disclosure');

        //console.log("SHOW");

        var content = this.contents[trigger.outerHTML];

        if (content) {
            //console.log('muestro container que ya esta definido');
            showElement(content);
            //console.log('1111');
            $(trigger).trigger('aftershow.disclosure');

            this.lastTriggerShown = trigger;
            this.lastContainerShown = content;

        } else {
            var container = this.getContainer(trigger);

            var url = trigger.getAttribute('disclosure-url') || trigger.href;

            if (url) {
                //console.log('tiene url');
                //console.log('creo un Content dentro del container nodrizo');

                content = doc.createElement('div');
                showElement(content);
                //console.log('2222');

                container.appendChild(content);

                this.contents[trigger.outerHTML] = content;

                this.loadAJAXContent(url, trigger, content);

                this.lastTriggerShown = trigger;
                this.lastContainerShown = content;

            } else {
                //console.log('NO tiene url, creo un container y uso el que esta como content');

                var wrappercontentnew = doc.createElement('div');
                // wrappercontentnew.setAttribute('aria-hidden', 'true');

                // wrappercontentnew.id = container.id;

                // container.id = null;

                container.parentNode.insertBefore(wrappercontentnew, container);

                wrappercontentnew.appendChild(container);

                if (this.container === container) {
                    this.container = wrappercontentnew;
                }

                //console.log("wrappeo todo con un nuevo container");

                // Save it in the map of contents using the trigger as reference
                this.contents[trigger.outerHTML] = container;

                this.lastTriggerShown = trigger;
                this.lastContainerShown = container;

                showElement(container);

                //console.log('3333');
                $(trigger).trigger('aftershow.disclosure');
            }
        }
    };

    /**
     *
     */
    Disclosure.prototype.hide = function () {
        if (this.lastContainerShown) {
            $(this.lastTriggerShown).trigger('beforehide.disclosure');
            //console.log('...hideee...');
            hideElement(this.lastContainerShown);
            $(this.lastTriggerShown).trigger('afterhide.disclosure');
        }
        // this.lastContainerShown.setAttribute('aria-hidden', 'true');
        // this.contents[this.lastTriggerShown] = $(this.lastContainerShown).detach();
        ////console.log('guardo el contenido del trigger que se acaba de ocultar');
    };

    /**
     *
     */
    // Disclosure.prototype.loadDOMContent = function (trigger, container) {
    //     // CACHED: If this content was predefined, get data from cache
    //     if (this.contents[trigger]) {
    //         container.innerHTML = this.contents[trigger];
    //         // TODO: trigger event
    //     }
    // };

    /**
     *
     */
    Disclosure.prototype.loadAJAXContent = function (url, trigger, content) {

        //
        //var responses = this.responses;

        // CACHED: If this URL was previously requested, get data from cache
        // if (responses[url]) {
        //     container.innerHTML = responses[url];
        //     initialize(container);
        //     // TODO: trigger event here
        //     return;
        // }

        var that = this;


        // AJAX: Data doesn't exist in responses, so get from URL
        requestHttp(url, function (data) {

            if (data.CSS && !isEmpty(data.CSS)) {
                createCustomElement('style', data.CSS);
            }

            if (data.HTML && !isEmpty(data.HTML)) {
                content.innerHTML = data.HTML;

                // content.setAttribute('aria-hidden', 'false');
                $(trigger).trigger('aftershow.disclosure');

                // TODO: trigger event here
                // if (cache === null || cache === 'true') {
                //     responses[url] = data.HTML;
                // }
                //contents[trigger] = container.innerHTML;
                //console.log('pego el contenido de ajax en el Content');
            }

            if (data.JS && !isEmpty(data.JS)) {
                createCustomElement('script', data.JS);
            }

            initialize(content);
        });
    };

    /**
     *
     * @returns {HTMLElement}
     */
    Disclosure.prototype.getContainer = function (trigger) {

        var containerId = trigger.getAttribute('disclosure-container');

        // If there is a container defined for this trigger, get it from DOM
        if (containerId !== null) {
            return getElement(containerId);
        }

        // If there isn't a specific container for this trigger,
        // use the container defined in this.wrapper
        if (this.container) {
            return this.container;
        }

        // Check that at least exist a container defined in this.wrapper
        throw new win.Error('Disclosure: No "disclosure-container" was defined on the trigger nor wrapper, or it\'s not a valid Element.');
    };

    /**
     * Expose
     */
    // Instances
    win._disclosures = win._disclosures || [];
    // Constructor
    win.Disclosure = Disclosure;

    /**
     * Init
     */
    initialize();

}(window, window.document));
