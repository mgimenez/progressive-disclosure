/**
 * Create instances of Progressive Disclosure elements
 * @autor Matias Gimenez
 * @param {Object}
 * @example
 * var foo = new ProgressiveDisclosure({
		element: document.getElementBy('foo'),
		container: document.getElementBy('bar'),
		uri: 'http://',
		event: 'change'
		callback: function(){

		}
	});
 */
(function(win){
	'use strict';

	function ProgressiveDisclosure(options){
		this.element = options.element;
		this.container = options.container;
		this.uri = options.uri;
		this.event = options.event;
		this.callback = options.callback;
		this.content = options.content;
		//this.prevCheck = options.preCheckClosure;
		this.cache = options.cache !== undefined ? options.cache : true;


		//if(this.element.checked === true || this.element.options[this.element.options.selectedIndex].value !== '-1' ){

		if(this.element.checked === true){

			this.loadContent();
		}
		var that = this;
		
		this.element.addEventListener(this.event, function() {
			//if(that.prevCheck !== undefined && that.prevCheck(event)){
				that.loadContent();
			//}
		});
	}	

	ProgressiveDisclosure.prototype.loadContent = function(){
		var that = this;
		this.defineContainer();

		if(this.content){
			this.container.innerHTML = this.content;
		}else{
			if(this.response){
				this.container.innerHTML = this.response;
			}else{
				$(this.container).load(this.uri, function(data){
					//that.callback !== undefined?
					if(that.callback) that.callback();
					if(that.cache) that.response = data;
				});
			}
		}
	}

	ProgressiveDisclosure.prototype.defineContainer = function(){
		if(this.container === undefined){
			this.container = win.document.createElement('div');
			this.container.className = 'prog-disc';
			this.element.parentNode.appendChild(this.container);
		}
	}

	win.ProgressiveDisclosure = ProgressiveDisclosure;
}(this))
//this = window
//puedo acceder a todo el win mas rapido



/*
	var foo = new ProgressiveDisclosure({
		element: document.getElementBy('foo'),
		container: document.getElementBy('bar'),
		uri: 'http://',
		event: 'change'
		callback: function(){

		}
	})

*/