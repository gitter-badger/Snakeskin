'use strict';

/*!
 * Snakeskin
 * https://github.com/SnakeskinTpl/Snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/Snakeskin/blob/master/LICENSE
 */

import $C from '../deps/collection';
import baseMacros from '../consts/macros';
import { macroBlackSymbols } from '../consts/regs';
import { isArray } from './types';

/**
 * Sets an object as macros
 *
 * @param {(Object|undefined)} obj - source object
 * @param {!Object} macros - macro namespace object
 * @param {?string=} [opt_namespace] - namespace for adding macros
 * @param {?boolean=} [opt_init=false] - if is true, then macros will be re/initialised
 */
export function setMacros(obj, macros, opt_namespace, opt_init) {
	if (opt_init) {
		$C.extend(false, macros, {
			combo: {},
			groups: {},
			inline: {'\\': true},
			map: {}
		});

		setMacros(baseMacros, macros);
	}

	if (obj == null) {
		$C(obj = macros.groups[opt_namespace]).forEach((el, key) => {
			delete obj[key];
			delete macros.map[key];
			delete macros.combo[key];
		});

	} else {
		$C(obj).forEach((el, key) => {
			if (key[0] === '@' && !opt_namespace) {
				return setMacros(el, macros, key);
			}

			if (opt_namespace) {
				macros.groups[opt_namespace] = macros.groups[opt_namespace] || {};
			}

			if (el) {
				if (macroBlackSymbols.test(key)) {
					throw new Error(`Invalid macro "${key}"`);
				}

				if (isArray(macros[key])) {
					macros.combo[key] = true;
				}

				if (el.inline) {
					macros.inline[key[0]] = true;
				}

				if (opt_namespace) {
					macros.groups[opt_namespace][key] = macros.map[key];
				}

				macros.map[key] = el.value || el;

			} else {
				if (opt_namespace) {
					delete macros.groups[opt_namespace][key];
				}

				delete macros.map[key];
				delete macros.combo[key];
			}
		});
	}

	return macros;
}
