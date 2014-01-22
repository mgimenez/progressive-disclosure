/*
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

	var head = doc.getElementsByTagName('head')[0],
		bind = win.addEventListener ? 'addEventListener' : 'attachEvent',
		prefix = (bind === 'attachEvent') ? 'on' : '';

	/**
	 *
	 */
	function createCustomElement(tagName, data) {

		var element = document.createElement(tagName);

		element.insertAdjacentText('beforeend', data);

		head.appendChild(element);
	};

	/**
	 * @todo https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
	 */
	function loadData(url, callback) {

		var xhr = new XMLHttpRequest();

		xhr.open('GET', url, true);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		xhr.onload = function () {
			
			if (this.status === 200) {

				var data = JSON.parse(this.response);

				// if (data.CSS === undefined || data.HTML === undefined || data.JS === undefined) {
				// 	throw new win.Error('Disclosure: The AJAX response must contain a JSON with "HTML", "CSS" and "JS" keys.');
				// }

				callback(data);

			} else {
				doc.body.innerHTML = data;
			}
		};

		xhr.send();
	}

	function Disclosure(el) {

		var that = this;

		/**
		 *
		 */
		this.element = el;

		/**
		 *
		 */
		this.container = doc.getElementById(this.element.getAttribute('disclosure-container'));

		/**
		 *
		 */
		this.event = this.element.getAttribute('disclosure-event') || 'change';

		/**
		 *
		 */
		this.responses = {};

		/**
		 *
		 */
		this.triggers = this.element.querySelectorAll('[disclosure-url],[disclosure-container]');


		this.element[bind](prefix + this.event, function (event) {

			// Support IE
			var el = event.target || event.srcElement;

			// Support for HTMLSelectElement: "el" is the selected <option>,
			// or "el" is the target (any element)
			el = el.children[el.selectedIndex] || el;
			
			// Si el que me cliquearon es un trigger...
			if (that.isTrigger(el)) {
				that.init(el);
			} else {
				if (that.lastShown !== undefined) {
					that.lastShown.setAttribute('aria-hidden', 'true');
				}
			}
		});

		var selected = this.checkSelected();

		if (selected !== undefined) {
			this.init(selected);
		}
	};

	Disclosure.prototype.checkSelected = function () {

		var i = this.triggers.length;

		while (i) {
			i -= 1;

			// Support for HTMLSelectElement
			if (this.triggers[i].checked || this.triggers[i].value === this.element.value) {
				return this.triggers[i];
			}
		}
	};

	/**
	 *
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

	Disclosure.prototype.init = function (el) {

		var that = this;

		// El trigger, ¿tiene un container? usar ese
		if (el.getAttribute('disclosure-container') !== null) {
			var container = doc.getElementById(el.getAttribute('disclosure-container'));
		// No tiene container? Usar el que es para todos
		} else {
			var container = this.container;
			if (container === undefined) {
				throw new win.Error('Disclosure: No container was defined.');
			}
		}

		// AJAX: Si el trigger tiene url...
		if (el.getAttribute('disclosure-url') !== null) {
			// Si la url existe en responses...
			if (this.responses[el.getAttribute('disclosure-url')] !== undefined) {
				var data = this.responses[el.getAttribute('disclosure-url')];

				if (data.CSS !== undefined) {
					createCustomElement('style', data.CSS);
				}
				if (data.HTML !== undefined) {
					container.innerHTML = data.HTML;
				}
				if (data.JS !== undefined) {
					createCustomElement('script', data.JS);
				}
			// No lo tengo en responses, hago el request AJAX
			} else {
				// XMLHttpRequest();
				// container.innerHTML = data;
				loadData(el.getAttribute('disclosure-url'), function (data) {
					if (data.CSS !== undefined) {
						createCustomElement('style', data.CSS);
					}
					if (data.HTML !== undefined) {
						container.innerHTML = data.HTML;

						var elements = container.querySelectorAll('[disclosure]'),
					        i = elements.length;

					    while (i) {
					        i -= 1;
					        new Disclosure(elements[i]);
					    }
					}
					if (data.JS !== undefined) {
						createCustomElement('script', data.JS);
					}

					if (el.getAttribute('disclosure-cache') === null || el.getAttribute('disclosure-cache') === 'true') {
						that.responses[el.getAttribute('disclosure-url')] = data;
					}
				});
				// console.log("lo cargo por ajax en:");
				// console.log(container);
			}
		}
		
		container.setAttribute('aria-hidden', 'false');
		this.lastShown = container;
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
		if (this.responses[this.url]) {
			this.callback(this.responses[this.url]);
			return;
		}

		// Case 3: The request (not cached) (undefined content)
		loadData(this.container, this.url, function (data) {
			//
			that.callback(data);

			// Save the response if the cache is true
			if (that.cache) {
				that.responses[that.url] = data;

				//that.responses = data;
			}
		});
	};

	// Disclosure.prototype.hideContent = function () {
	// 	if(this.container){
	// 		this.container.setAttribute("aria-hidden","true");
	// 	}
	// };

	/**
	 * @todo Append after the trigger
	 */
	Disclosure.prototype.defineContainer = function (el) {
		// If there isn't a container...
		if (this.element.getAttribute('disclosure-container') === undefined) {
			// Create one
			var container = doc.createElement('div');
			// this.container.className = 'prog-disc-box';

			// Append container to the element
			this.element.appendChild(container);

			return container;

			// ...the interaction will be via CSS, so I need to add a classname
			// this.element.className = 'prog-disc-trigger';
		} else {
			return this.element.getAttribute('disclosure-container');
		}
	};

	win.Disclosure = Disclosure;


	var elements = doc.querySelectorAll('[disclosure]'),
        i = elements.length;

    while (i) {
        i -= 1;
        new Disclosure(elements[i]);
    }

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
