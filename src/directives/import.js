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
	'import',

	{
		group: ['import', 'head'],
		notEmpty: true,
		placement: 'global'
	},

	function (command) {
		const
			{structure} = this,
			isNativeExport = this.module === 'native';

		if (isNativeExport) {
			structure.vars = {};
			structure.params['@result'] = '';
		}

		let
			res = isNativeExport ? 'import ' : '',
			from = '';

		command = command.replace(/(?:\s+from\s+([^\s]+)\s*|\s*([^\s]+)\s*)$/, (str, path1, path2) => {
			if (isNativeExport) {
				from = str;

			} else {
				if (path1) {
					res += `__REQUIRE__ = require(${path1});`;
					from = this.out(`__REQUIRE__`, {unsafe: true});

				} else {
					res += `require(${path2});`;
					from = true;
				}
			}

			return '';
		});

		if (!from) {
			return this.error(`invalid "${this.name}" declaration`);
		}

		/**
		 * @param {string} str
		 * @param {?boolean=} [opt_global]
		 * @return {string}
		 */
		const f = (str, opt_global) => {
			if (!str.length) {
				return '';
			}

			const
				args = str.split(/\s*,\s*/),
				arr = [];

			for (let i = 0; i < args.length; i++) {
				const
					parts = args[i].split(/\s+as\s+/);

				if (isNativeExport) {
					arr.push(`${parts[0]} as ${this.declVar(parts[1] || parts[0])}`);

				} else {
					arr.push(this.declVars(
						`${parts[1] || parts[0]} = ${from}${opt_global || parts[0] === '*' ? '' : `.${parts[1] || parts[0]}`}`
					));
				}
			}

			return arr.join(isNativeExport ? ',' : '');
		};

		command = command.replace(/\s*(,?)\s*\{\s*(.*?)\s*}\s*(,?)\s*/, (str, prfComma, decl, postComma) => {
			if (isNativeExport) {
				res += `${prfComma ? ', ' : ''}{ ${f(decl)} }${postComma ? ',' : ''}`;

			} else {
				res += f(decl);
			}

			return prfComma || '';
		});

		this.append(res + f(command, true) + (isNativeExport ? from : ''));
	}

);