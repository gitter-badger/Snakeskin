/*!
 * Snakeskin
 * https://github.com/SnakeskinTpl/Snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/Snakeskin/blob/master/LICENSE
 */

/** @const */
var Snakeskin = {
	/** @type {?string} */
	UID: null,

	/** @type {!Array} */
	VERSION: [],

	/** @const */
	Filters: {},

	/** @const */
	Vars: {},

	/** @const */
	LocalVars: {},

	/** @const */
	cache: {},

	/**
	 * @abstract
	 * @param {(Element|string)} src
	 * @param {?$$SnakeskinParams=} [opt_params]
	 * @param {?$$SnakeskinInfoParams=} [opt_info]
	 * @return {(string|boolean|null)}
	 */
	compile: function (src, opt_params, opt_info) {}
};
