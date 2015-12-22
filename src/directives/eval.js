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
	'eval',

	{
		block: true,
		deferInit: true,
		group: 'eval',
		logic: true,
		placement: 'global'
	},

	function () {
		this.startDir(null, {
			from: this.result.length
		});
	},

	function () {
		const {params} = this.structure;
		params['@res'] = this.result;
		this.result = this.result.slice(0, params.from);
	}

);
