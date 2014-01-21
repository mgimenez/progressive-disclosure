/**
 * Create instances of Progressive Disclosure elements
 * @autor Matias Gimenez
 * @param {Object}
 * @example
 * var foo = new ProgressiveDisclosure({
		element: document.getElementBy('foo'),
		container: document.getElementBy('bar'),
		url: 'http://',
		event: 'change'
		callback: function(){

		}
	});
 */
(function (win, doc) {
	'use strict';

	var head = doc.getElementsByTagName('head')[0];

	/**
	 *
	 */
	function createCustomElement(tagName, data) {

		var element = document.createElement(tagName);

		element.insertAdjacentText('beforeend', data);

		head.appendChild(element);
	};

	function loadData(element, url, callback) {

		var xhr = new XMLHttpRequest();

		xhr.open('GET', url, true);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		//xhr.responseType = 'blob';

		xhr.onload = function () {
			if (this.status === 200) {
				callback(this.response);
			}
		};

		xhr.send();
	}

	function validateOptions(options) {
		if (options.content !== undefined && options.url !== undefined) {
			throw new win.Error('Disclosure: You must define "content" or "url". Not both.');

		} else if (options.container !== undefined && options.container.nodeType === undefined) {
			throw new win.Error('Disclosure: "container" must be a valid DOM element.');

		} else if (options.element === undefined) {
			throw new win.Error('Disclosure: An "element" is required.');

		} else if (options.element !== undefined && options.element.nodeType === undefined) {
			throw new win.Error('Disclosure: "element" must be a valid DOM element.');
		}
	}

	function Disclosure(options) {

		var that = this;

		this.element = options.element;
		this.container = options.container;
		this.url = options.url;
		this.event = options.event || 'change';
		// Give the total control to the user or do what we want
		this.listener = options.listener || function () {
			that.loadContent();
		};
		this.callback = options.callback || function (data) {
			that.container.innerHTML = data;
		};
		this.content = options.content;
		this.cache = (typeof options.cache === 'boolean') ? options.cache : true;
		this.response = {};

		validateOptions(options);

		this.element.addEventListener(this.event, function (event) {
			that.listener.call(that, event);
		});

		
		if (this.element.checked) {
			this.loadContent();
		}
	}

	Disclosure.prototype.setHTML = function (data) {
		this.container.innerHTML = data;
	};

	/**
	 * @todo Support urls
	 */
	Disclosure.prototype.setCSS = function (data) {
		createCustomElement('style', data);
	};

	/**
	 * @todo Support urls
	 */
	Disclosure.prototype.setJS = function (data) {
		createCustomElement('script', data);
	};

	/**
	 * @todo When the container is not defined, not redefine the content via innerHTML.
	 */
	Disclosure.prototype.loadContent = function (newContent) {
		
		var that = this;
		 
		this.defineContainer();
		this.container.setAttribute("aria-hidden","false");

		// Case 1: If a content is defined
		if (this.content) {
			this.container.innerHTML = this.content;
			return;
		}

		// Case 2: If we already have a response (cached)
		if (this.response[this.url]) {
			this.callback(this.response[this.url]);
			return;
		}

		// Case 3: The request (not cached) (undefined content)
		loadData(this.container, this.url, function (data) {
			//
			that.callback(data);

			// Save the response if the cache is true
			if (that.cache) {
				that.response[that.url] = data;

				//that.response = data;
			}
		});
	};

	Disclosure.prototype.hideContent = function () {
		if(this.container){
			this.container.setAttribute("aria-hidden","true");
		}
	};

	/**
	 * @todo Append after the trigger
	 */
	Disclosure.prototype.defineContainer = function () {
		// If there isn't a container...
		if (this.container === undefined) {
			// Create one
			this.container = doc.createElement('div');
			// this.container.className = 'prog-disc-box';

			// Append container to the element
			this.element.parentNode.appendChild(this.container);

			// ...the interaction will be via CSS, so I need to add a classname
			// this.element.className = 'prog-disc-trigger';
		}
	};

	win.Disclosure = Disclosure;

}(this, this.document));



//this = window
//puedo acceder a todo el win mas rapido



/*
	var foo = new ProgressiveDisclosure({
		element: document.getElementBy('foo'),
		container: document.getElementBy('bar'),
		url: 'http://',
		event: 'change'
		callback: function(){

		}
	})

*/