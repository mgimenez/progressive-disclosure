(function (win, doc) {
    'use strict';

    var head = doc.querySelector('head'),
        // Support for IE events
        bind = win.addEventListener ? 'addEventListener' : 'attachEvent',
        prefix = (bind === 'attachEvent') ? 'on' : '';

    /**
     * Discloses information progressively, revealing only the essentials.
     * @constructor
     * @returns {disclosure} Returns a new instance of Disclosure.
     * @todo Sometimes the element must be the trigger: <button disclosure disclosure-event="click"....>
     *       Tiene las 3 propiedades: dis, dis-url. dis-cont.
     * @todo Add support to re-use content of a container when it's previously defined.
     * @todo Unit testing Jasmine.
     * @todo loading spinner
     * @todo Bug: JS and CSS are loading each time disclosure is shown.
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
         * All the elements with associated functionality to be watched on this.event.
         * @type {NodeList}
         */
        this.triggers = wrapper.querySelectorAll('[disclosure-url],[disclosure-container]');

        // Listen for "triggers" on "event" in "wrapper"
        wrapper[bind](prefix + this.event, function (event) {
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

            // The "el" is a valid trigger defined by the user
            if (that.isTrigger(target)) {
                // Hide the last defined container if that trigger isn't checked
                // Support for Radio || HTMLSelectElement
                if (lastTrigger !== undefined && (lastTrigger.checked === false || lastTrigger.value !== wrapper.value)) {
                    that.hide();
                }

                that.show(target);

                return;
            }

            // Hide the last defined container if the new selected trigger
            // doesn't match with a valid trigger
            // @todo check if it's necessary
            if (that.lastContainerShown !== undefined) {
                that.hide();
            }
        });

        //
        this.checkSelected();
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
     * @todo https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
     * @todo new win.ActiveXObject('Microsoft.XMLHTTP');
     */
    function requestHttp(url, callback) {

        var xhr = new win.XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.onload = function () {

            if (this.status === 200) {

                var data = JSON.parse(this.response);

                // if (data.CSS === undefined || data.HTML === undefined || data.JS === undefined) {
                //     throw new win.Error('Disclosure: The AJAX response must contain a valid JSON with at least one of these keys: "HTML", "CSS" or "JS".');
                // }

                callback(data);

            } else {
                doc.body.innerHTML = this.response;
            }
        };

        xhr.send();
    }

    /**
     *
     */
    function createCustomElement(tagName, data) {

        var el = doc.createElement(tagName);

        el.insertAdjacentText('beforeend', data);

        head.appendChild(el);
    }

    /**
     *
     */
    function populateContainer(container, data) {

        if (data.CSS !== undefined) {
            createCustomElement('style', data.CSS);
        }

        if (data.HTML !== undefined) {
            container.innerHTML = data.HTML;
        }

        if (data.JS !== undefined) {
            createCustomElement('script', data.JS);
        }
    }

    /**
     *
     */
    Disclosure.prototype.checkSelected = function () {

        var i = this.triggers.length;

        while (i) {
            i -= 1;

            if (
                // Support Radio Buttons
                this.triggers[i].checked ||
                    // Support Select Element
                    (this.wrapper.value !== undefined && this.triggers[i].value === this.wrapper.value)
            ) {
                //
                this.show(this.triggers[i]);
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

            // Check each trigger with the element
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
            container = this.defineContainer(trigger.getAttribute('disclosure-container')),
            //
            cache = trigger.getAttribute('disclosure-cache');

        //
        this.loadContent(url, container, cache);

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
    Disclosure.prototype.loadContent = function (url, container, cache) {

        // CACHED: If this URL was previously requested, get data from cache
        if (this.responses[url] !== undefined) {
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
    Disclosure.prototype.defineContainer = function (containerID) {

        // If there is a container defined for this trigger, get it from DOM
        if (containerID !== null) {
            return doc.getElementById(containerID);
        }

        // If there isn't a specific container for this trigger,
        // use the container defined in this.wrapper
        if (this.container !== undefined) {
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