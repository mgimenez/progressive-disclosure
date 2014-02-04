(function (win, doc) {
    'use strict';

    var head = doc.querySelector('head'),
        // Support for IE events
        bind = win.addEventListener ? 'addEventListener' : 'attachEvent',
        prefix = (bind === 'attachEvent') ? 'on' : '',
        //
        triggerSelector = [
            // URL and/or container (querySelectorAll merges duplicated elements)
            '[disclosure-url]',
            '[disclosure-container]',
            // For example: A radio button into a wrapper with a common container
            '[disclosure-container] [checked]',
            // For example: An option into a select with a common container
            '[disclosure-container] [selected]'
        ].join(',');

    /**
     * Discloses information progressively, revealing only the essentials.
     * @constructor
     * @returns {disclosure} A new instance of Disclosure.
     * @todo Sometimes the element must be the trigger: <button disclosure disclosure-event="click"....>
     *       Tiene las 3 propiedades: dis, dis-url. dis-cont.
     * @todo Unit testing Jasmine.
     * @todo loading spinner
     * @todo Preload method to save time on predictible loadings. Just do the request and grab
     *       response into this.responses.
     * @todo disparar eventos custom. beforeshow y aftershow
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
        this.container = doc.getElementById(wrapper.getAttribute('disclosure-container'));

        /**
         * Stores data getted from AJAX requests for reusage.
         * @type {Object}
         */
        this.responses = {};

        /**
         * Stores data getted from predefined DOM containers for reusage.
         * @type {Object}
         */
        this.contents = {};

        /**
         * All the elements with associated functionality to be watched on this.event.
         * @type {NodeList}
         */
        this.triggers = wrapper.querySelectorAll(triggerSelector);

        // Listen for "triggers" on "event" in "wrapper"
        wrapper[bind](prefix + this.event, function (event) {
            /**
             * 1. Defining the target
             */
            // Provide support for IE
            var target = event.target || event.srcElement,
                lastTrigger = that.lastTriggerShown;

            // Prevent to trigger anchors and submits
            if (target.nodeName === 'A' || target.type === 'submit') {
                event.preventDefault();
            }

            // On HTMLSelectElement: "target" is the selected option
            // On radio buttons: "target" is this.wrapper
            target = target.children[wrapper.selectedIndex] || target;

            /**
             * 2. Defining the trigger
             */
            // The "el" is a valid trigger defined by the user
            if (that.isTrigger(target)) {
                // Hide the last defined container if that trigger isn't checked
                // Support for Radio || HTMLSelectElement
                if (lastTrigger && (lastTrigger.checked === false || lastTrigger.value !== wrapper.value)) {
                    that.hide();
                }

                that.show(target);

                return;
            }

            // Hide the last defined container if the new selected trigger
            // doesn't match with a valid trigger
            if (that.lastContainerShown) {
                that.hide();
            }
        });

        //
        this.checkPreselectedTriggers();

        //
        this.preloadAJAXContent();
    }

    /**
     *
     */
    function initialize(container) {

        var wrappers = (container || doc).querySelectorAll('[disclosure]'),
            i = wrappers.length;

        while (i) {
            i -= 1;
            new Disclosure(wrappers[i]);
        }
    }

    /**
     *
     */
    function requestHttp(url, callback) {

        var xhr = new win.XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.onload = function () {
            if (this.status === 200) {
                callback(JSON.parse(this.response));
            } else {
                doc.querySelector('body').innerHTML = this.response;
            }
        };

        xhr.send();
    }

    /**
     *
     * @todo Add support for urls
     */
    function createCustomElement(tagName, data) {

        var el = doc.createElement(tagName);

        el.innerHTML = data;

        head.appendChild(el);
    }

    /**
     *
     */
    function populateContainer(container, data) {

        if (data.CSS) {
            createCustomElement('style', data.CSS);
            // Avoid CSS to load each time disclosure is shown
            delete data.CSS;
        }

        if (data.HTML) {
            container.innerHTML = data.HTML;
        }

        if (data.JS) {
            createCustomElement('script', data.JS);
            // Avoid JS to load each time disclosure is shown
            delete data.JS;
        }
    }

    /**
     *
     */
    Disclosure.prototype.preloadAJAXContent = function () {

        var preloads = this.wrapper.querySelectorAll('[disclosure-preload]'),
            i = preloads.length,
            responses = this.responses;

        while (i) {
            // Use this pattern to avoid loss reference to i
            (function (i) {
                var url = preloads[i].getAttribute('disclosure-url') || preloads[i].href;

                win[bind](prefix + 'load', function () {
                    requestHttp(url, function (data) {
                        // Save on this.responses, so it will be reached
                        // when content must be loaded
                        responses[url] = data;
                    });
                });
            }(i -= 1));
        }
    };

    /**
     *
     */
    Disclosure.prototype.checkPreselectedTriggers = function () {

        var i = this.triggers.length,
            trigger,
            content;

        while (i) {
            i -= 1;
            trigger = this.triggers[i];

            // When this trigger is checked...
            // Support Radio Buttons and Select Element
            if (trigger.checked || (this.wrapper.value && trigger.value === this.wrapper.value)) {
                // Get container (from trigger or wrapper), get its content and
                // trim it. Use regexp instead trim() method to support IE8+)
                content = this.getContainer(trigger).innerHTML.replace(/^\s+|\s+$/g, '');

                // Container has a pre-setted content
                if (content.length) {
                    // Save it in the map of contents using the trigger as reference
                    this.contents[trigger] = content;
                // Container doesn't have content
                } else {
                    // Get it from the url or cache
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
     */
    Disclosure.prototype.show = function (trigger) {
        //
        var url = trigger.getAttribute('disclosure-url') || trigger.href,
            //
            container = this.getContainer(trigger),
            //
            cache = trigger.getAttribute('disclosure-cache');

        if (url) {
            this.loadAJAXContent(url, container, cache);
        } else {
            this.loadDOMContent(trigger, container);
        }

        //
        container.setAttribute('aria-hidden', 'false');

        /**
         *
         * @type {HTMLElement}
         */
        this.lastTriggerShown = trigger;

        /**
         *
         * @type {HTMLElement}
         */
        this.lastContainerShown = container;
    };

    /**
     *
     */
    Disclosure.prototype.hide = function () {
        this.lastContainerShown.setAttribute('aria-hidden', 'true');
    };

    /**
     *
     */
    Disclosure.prototype.loadDOMContent = function (trigger, container) {
        // CACHED: If this content was predefined, get data from cache
        if (this.contents[trigger]) {
            container.innerHTML = this.contents[trigger];
        }
    };

    /**
     *
     */
    Disclosure.prototype.loadAJAXContent = function (url, container, cache) {

        // CACHED: If this URL was previously requested, get data from cache
        if (this.responses[url]) {
            populateContainer(container, this.responses[url]);
            return;
        }

        /**
         *
         */
        var responses = this.responses;

        // AJAX: Data doesn't exist in responses, so get from URL
        requestHttp(url, function (data) {

            populateContainer(container, data);

            initialize(container);

            if (cache === null || cache === 'true') {
                responses[url] = data;
            }
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
            return doc.getElementById(containerId);
        }

        // If there isn't a specific container for this trigger,
        // use the container defined in this.wrapper
        if (this.container) {
            return this.container;
        }

        // Check that at least exist a container defined in this.wrapper
        throw new win.Error('Disclosure: No "disclosure-container" was defined on the trigger nor wrapper.');
    };

    // Export
    win.Disclosure = Disclosure;

    // Init
    initialize();

}(this, this.document));
