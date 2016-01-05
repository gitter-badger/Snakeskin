'use strict';

/*!
 * Snakeskin
 * https://github.com/SnakeskinTpl/Snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/Snakeskin/blob/master/LICENSE
 */

import $C from '../deps/collection';
import Snakeskin from '../core';
import Parser from './constructor';
import { $consts } from '../consts/cache';
import { B_OPEN, B_CLOSE, SYS_CONSTS } from '../consts/literals';
import { ws } from '../helpers/string';

/**
 * Declares a variable and returns string declaration
 *
 * @param {string} name - variable name
 * @param {?{fn: (?boolean|undefined), sys: (?boolean|undefined)}=} [opt_params] - addition parameters:
 *
 *   *) [fn=false] - if is true, then the variable will be declared as a function parameter
 *   *) [sys=false] - if is true, then the variable will be declared as system
 *
 * @return {string}
 */
Parser.prototype.declVar = function (name, opt_params) {
	const
		{fn, sys} = $C.extend(false, {}, opt_params),
		{tplName, environment: {id}} = this;

	let
		{structure} = this;

	if (!fn && tplName && $consts[tplName][name]) {
		this.error(`the variable "${name}" is already defined as a constant`);
	}

	if (!sys && SYS_CONSTS[name]) {
		return this.error(`can't declare the variable "${name}", try another name`);
	}

	while (!structure.vars) {
		structure = structure.parent;
	}

	const
		val = structure.vars[name];

	if (val && !val.inherited && structure.parent) {
		return val.value;
	}

	let
		realVar,
		global = false;

	if (structure.name === 'root' || this.getGroup('import')[structure.name]) {
		if (structure.name !== 'root') {
			structure = structure.parent;
		}

		realVar = `__LOCAL__.${name}_${id}_${Snakeskin.UID}`;
		name += `_${id}`;
		global = true;

	} else {
		realVar = `__${name}_${structure.name}_${this.i}`;
	}

	structure.vars[name] = {
		global,
		id,
		scope: this.scope.length,
		value: realVar
	};

	if (tplName) {
		this.vars[tplName][name] = true;
	}

	return realVar;
};

/**
 * Parses string declaration of variables, initializes it
 * and returns new string declaration
 *
 * @param {string} str - source string
 * @param {?{
 *   end: (?boolean|undefined),
 *   def: (?string|undefined),
 *   sys: (?boolean|undefined)
 * }=} [opt_params] - addition parameters:
 *
 *   *) [end=true] - if is true, then will be appended ; to the string
 *   *) [def='void 0'] - default value for variables
 *   *) [sys=false] - if is true, then the variable will be declared as system
 *
 * @return {string}
 */
Parser.prototype.declVars = function (str, opt_params) {
	const
		{def, end, sys} = $C.extend(false, {def: 'void 0', end: true}, opt_params);

	let
		bOpen = 0,
		cache = '';

	let
		fin = 'var ',
		struct = this.structure;

	while (!struct.vars) {
		struct = struct.parent;
	}

	if (struct.name === 'root' || this.getGroup('import')[struct.name]) {
		fin = '';
	}

	$C(str).forEach((el, i) => {
		if (B_OPEN[el]) {
			bOpen++;

		} else if (B_CLOSE[el]) {
			bOpen--;
		}

		const
			lastIteration = i === str.length - 1;

		if ((el === ',' || lastIteration) && !bOpen) {
			if (lastIteration) {
				cache += el;
			}

			const
				parts = cache.split('='),
				realVar = this.declVar(parts[0].trim(), {sys});

			parts[0] = realVar + (def || parts[1] ? '=' : '');
			parts[1] = parts[1] || def;

			const
				val = parts.slice(1).join('=');

			fin += `${parts[0]}${val ? this.out(val, {unsafe: true}) : ''},`;
			cache = '';

			return;
		}

		cache += el;
	});

	if (bOpen) {
		this.error(`invalid "${this.name}" declaration`);
	}

	return fin.slice(0, -1) + (end ? ';' : '');
};

/**
 * Declares an object of arguments and returns string declaration
 * @return {string}
 */
Parser.prototype.declArguments = function () {
	return ws`
		var __ARGUMENTS__ = arguments;
		${this.declVars('arguments = __ARGUMENTS__')}
	`;
};
