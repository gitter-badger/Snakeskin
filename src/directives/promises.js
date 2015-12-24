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
	'when',

	{
		block: true,
		children: 'callback',
		group: ['when', 'promise', 'async', 'basicAsync'],
		notEmpty: true
	},

	function (command) {
		this.append($=> `${this.out(command, {unsafe: true})}.then(`);
	},

	function () {
		this.append(');');
	}

);
