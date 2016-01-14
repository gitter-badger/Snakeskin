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
import { ws } from '../helpers/string';

Snakeskin.addDirective(
	'forEach',

	{
		block: true,
		deferInit: true,
		group: ['forEach', 'iterator', 'cycle', 'callback'],
		notEmpty: true
	},

	function (command) {
		command = command.replace(/=>>/g, '=>=>');

		const
			parts = command.split(/\s*=>\s*/);

		if (!parts.length || parts.length > 3) {
			return this.error(`invalid "${this.name}" declaration`);
		}

		this.startDir(null, {
			params: parts[2] ? parts[1] : null
		});

		if (parts.length === 3) {
			if (!this.selfThis) {
				this.selfThis = this.structure.params.selfThis = true;
			}

			this.append(ws`
				${this.out(`$C(${parts[0]})`, {unsafe: true})}.forEach(function (${this.declCallbackArgs(parts)}) {
			`);

			return;
		}

		this.append(ws`
			Snakeskin.forEach(
				${this.out(parts[0], {unsafe: true})},
				function (${this.declCallbackArgs(parts[1])}) {
		`);
	},

	function () {
		const
			{params} = this.structure.params;

		if (params) {
			this.append(`}, ${this.out(params, {unsafe: true})});`);

		} else {
			this.append('});');
		}
	}
);

Snakeskin.addDirective(
	'forIn',

	{
		block: true,
		group: ['forIn', 'iterator', 'cycle', 'callback'],
		notEmpty: true
	},

	function (command) {
		const
			parts = command.split(/\s*=>\s*/);

		if (!parts.length || parts.length > 2) {
			return this.error(`invalid "${this.name}" declaration`);
		}

		if (this.structure.params.selfThis) {
			this.selfThis = false;
		}

		this.append(ws`
			Snakeskin.forIn(
				${this.out(parts[0], {unsafe: true})},
				function (${this.declCallbackArgs(parts[1])}) {
		`);
	},

	function () {
		this.append('});');
	}
);
