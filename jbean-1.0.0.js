/*
 * jBean project is a simple tool to manage and work with DOM 
 * 
 * Includes 4 main modules to work with DOM opertions: insert, select, delete, update
 * Includes modules to work with XMLHttp Requests
 * 
 * Can Gets HTML page content and include another scripts
 * Vitaliy Krushelnytskiy, 2014. All Rights reserved
 * 
 * Licenced by GPLv3. More at http://www.gnu.org/copyleft/gpl.html
 *
 * */
 
 function $( select_string )
 {
 	return jBean( select_string );
 }

 function jBean( select_string ) { return new jBeanManager(select_string); }
 
//function XMLHttp( init_function )
//{
//	 return new 
// }
 
 
 function Helper(query)
 {
	 this.query = query;
	 this.type = this.getType();
	 if(this.type === 2) {
		 var key_value = query.split('=')
		 this.key = key_value[0];
		 this.value = key_value[1];
	 }
	 else if(this.type == 1 || this.type == 0)
	 {
		 this.query = this.query.slice(1);
	 }
	 
 }
 
Helper.prototype.getEntityValid = function(DOMElement)
{
 switch(this.type) {
	case -1: {
		return this.query.toLowerCase() === DOMElement.tagName.toLowerCase();
	}
	case 0: {
		return this.query === DOMElement.id;
	}
	case 1: {
		return this.query === DOMElement.className;
	}
	case 2: {
		return this.value === DOMElement[this.key];
	}
	}
}
 
Helper.prototype.getType = function()
{
	if( this.query.indexOf('=') > -1 )
		return 2;
	switch ( this.query[0] )
	{
		case '#': 
		{
			return 0;
		}
		case '.':
		{
			return 1;
		}
		default: 
		{
			return -1;
		}
	 }
}

function jBeanManager( select_string )
{
	if( typeof select_string !== "string" ) { this.entities = select_string; }
	else
	{
		var args = new Array();
		var monoQuery = select_string.split(' ');
		monoQuery.forEach(function(element) {
			if(element.length > 0)
				args.push(new Helper(element));
		});
		this.args = args;
		this.entities = this.executeQuery();
	}
}

jBeanManager.prototype.getArguments = function()
{
	return this.args;
}

jBeanManager.prototype.entitiesNotAlone = function()
{
	return this.entities.length > 1 || "undefined" !== typeof this.entities.lentgh;
}

jBeanManager.prototype.targetEntity = function()
{
	return !this.entitiesNotAlone() ? this.entities : this.entities[0];
}

jBeanManager.prototype.executeQuery = function()
{
	var obj = new Array();
	var args = this.args;
	Array.prototype.forEach.call(document.getElementsByTagName('*'), function(entity) {
		var candidate = true;
		args.forEach( function(arg) {
			if(!arg.getEntityValid(entity)) { candidate = false; }
		});
		if(candidate) obj.push(entity);
	});
	
	if(obj.length === 1) { return obj[0]; }
	return obj;
}

jBeanManager.prototype.html = function(HTML)
{ 
	if( HTML )
		return this.setPropDynamically('innerHTML', HTML);
	else
		return this.targetEntity().innerHTML;
}

jBeanManager.prototype.text = function(text)
{ 
	if( text )
		return this.setPropDynamically('innerText', text);
	else
		return this.targetEntity().innerText;
}

jBeanManager.prototype.css = function( attr, value )
{
	if(attr && value)
		return this.setPropDynamically( ['style', attr], value );
	else if( attr ) { return this.targetEntity().style[attr] || getComputedStyle(this.targetEntity())[attr]; }
	return undefined;
}

jBeanManager.prototype.attr = function( attr, value )
{ 
	if(attr && value)
		return this.setPropDynamically( attr, value );
	else if( attr && !value )
		return this.targetEntity()[attr];
}

jBeanManager.prototype.append = function( data )
{
	return this.setPropDynamically('innerHTML', data, 1);
}

jBeanManager.prototype.prepend = function( data )
{
	return this.setPropDynamically('innerHTML', data, -1);
}

jBeanManager.prototype.remove = function()
{
	if(!this.entitiesNotAlone) this.entities = new Array(this.entities);
	this.entities.forEach( function(entity) {
		entity.remove();
	});
}

jBeanManager.prototype.replaceBy = function(DOMElement)
{

	if(DOMElement.hasOwnProperty('entities'))
		DOMElement = DOMElement.targetEntity();
	return this.targetEntity().parentNode.replaceChild(DOMElement, this.targetEntity());
}

jBeanManager.prototype.setPropDynamically = function( prop, value, add )
{
	if(this.entitiesNotAlone())
	{
		this.entities.forEach(function(entity) {
			_STAT._PROP_INSERT_(entity, prop, value, add || 0);
		});
	}

	else
		_STAT._PROP_INSERT_(this.entities, prop, value, add || 0);

	return this.entities;
}

jBeanManager.prototype.on = function(type, func)
{	
	var ActionListeners = new Array();
	if(this.entitiesNotAlone())
	{
		this.Entities.forEach(function(entity){
			ActionListeners.push(new ActionListener(entity, type, func));
		});
	}
	else
		ActionListeners.push(new ActionListener(this.entities, type, func));
		
	ActionListeners.forEach(function(action_listener) {
		action_listener.create();
	});
}

function ActionListener(DOMElement, type, func)
{
	this.DOMElement = DOMElement;
	this.type = type;
	this.func = func;
}

ActionListener.prototype.create = function()
{
	var supported_action_listeners = 
	{
		"click": "click",
		"doubleclick": "doubleclick",
		"mousedown": "mousedown",
		"mouseover": "mouseover",
		"mouseleave": "mouseleave",
		"keyup": "keyup",
		"keydown": "keydown",
		"load":	"#onload",
		"ready": "DOMContentLoaded"
	};

	if(supported_action_listeners[this.type] === undefined) return!1;
	if(supported_action_listeners[this.type][0] === '#')
		return this.DOMElement[supported_action_listeners[this.type].slice(1)] = this.func;
	else
		return this.DOMElement.addEventListener(supported_action_listeners[this.type], this.func);
}

function _STAT() {}
_STAT._VERSION_ = '1.0.0';
_STAT._VENDOR_ = 'Open Source';
_STAT._ORIGINAL_AUTHOR_ = 'Vitaliy Krushelnytskiy';
_STAT._EDITOR_ = 'Vitaliy Krushelnytskiy';
_STAT._OPEN_SOURCE_LINK_ = 'https://github.com/yksi/jBean';
_STAT._PUBLISH_YEAR_ = 2014;
_STAT._PUBLISH_MONTH_ = 12;
_STAT._PUBLISH_DAY_ = 20;
_STAT._PUBLISH_DATE_ =  new Date( [_STAT._PUBLISH_YEAR_, _STAT._PUBLISH_MONTH_, _STAT._PUBLISH_DAY_].join('-')  + ' 00:00');


_STAT._PROP_INSERT_ = function( DOMElementrORs, prop, value, add )
{
	add === undefined ? add = 0 : add;
	var DOMElements = !DOMElementrORs.length ? new Array(DOMElementrORs) : DOMElementrORs;
	prop = typeof prop === 'string' ? new Array(prop) : prop;
	DOMElements.forEach(function(DOMElement)
	{
		switch( prop.length )
		{
			case 1: { DOMElement[prop[0]] = _STAT._APP_PREP_(DOMElement[prop[0]], value, add); return DOMElement }
			case 2: { DOMElement[prop[0]][prop[1]] = _STAT._APP_PREP_(DOMElement[prop[0]][prop[1]], value, add); return DOMElement; }
			case 3: { DOMElement[prop[0]][prop[1]][prop[2]] = _STAT._APP_PREP_(DOMElement[prop[0]][prop[1]][prop[2]], value, add); return DOMElement; }
			case 4: { DOMElement[prop[0]][prop[1]][prop[2]][prop[3]] = _STAT._APP_PREP_(DOMElement[prop[0]][prop[1]][prop[2]][prop[3]], value, add); return DOMElement; }
		};
	});
}

_STAT._APP_PREP_ = function(origin_value, value, add)
{
	switch(add) {
		case 0: return value;
		case 1: return origin_value + value;
		case -1: return value + origin_value;
		default: return undefined;
	}
}
