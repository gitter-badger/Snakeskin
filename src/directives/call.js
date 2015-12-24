'use strict';

/*!
 * Snakeskin
 * https://github.com/SnakeskinTpl/Snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/Snakeskin/blob/master/LICENSE
 */

import Snakeskin from '../core';

Snakeskin.addDirective(
	'call',

	{
		group: ['call', 'output'],
		notEmpty: true,
		placement: 'template',
		shorthands: {'^=': 'call '},
		text: true
	},

	function (command) {
		this.append($=> this.wrap(this.out(command, {unsafe: true})));
	}

);
