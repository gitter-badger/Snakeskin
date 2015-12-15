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
import { IS_NODE } from '../consts/hacks';
import { NULL } from '../consts/links';
import { $globalCache, $globalFnCache } from '../consts/cache';
import { escapeEOLs } from './escape';

/**
 * Returns data from the cache by the specified key
 *
 * @param {?string} cacheKey - cache key
 * @param {string} code - source SS code
 * @param {!Object} params - compile parameters
 * @param {!Object} ctx - context
 * @return {(string|undefined)}
 */
export function getFromCache(cacheKey, code, params, ctx) {
	if (IS_NODE && ctx !== NULL && $globalFnCache[cacheKey]) {
		$C($globalFnCache[cacheKey][code]).forEach((el, key) => {
			ctx[key] = el;
		});
	}

	const
		cache = $globalCache[cacheKey] && $globalCache[cacheKey][code];

	if (cache) {
		let
			skip = false;

		if (params.words) {
			if (!cache.words) {
				skip = true;

			} else {
				$C(cache.words).forEach((el, key) => {
					params.words[key] = el;
				});
			}
		}

		if (params.debug) {
			if (!cache.debug) {
				skip = true;

			} else {
				$C(cache.debug).forEach((el, key) => {
					params.debug[key] = el;
				});
			}
		}

		if (!skip) {
			return cache.text;
		}
	}
}

/**
 * Returns a cache key for the current SS process
 *
 * @param {!Object} params - compile parameters
 * @param {!Object} ctx - context
 * @return {?string}
 */
export function getCacheKey(params, ctx) {
	return params.language || params.macros ?
		null : [
			params.exports,
			ctx !== NULL,
			escapeEOLs(params.eol),
			params.doctype,
			params.tolerateWhitespace,
			params.inlineIterators,
			params.renderAs,
			params.renderMode,
			params.replaceUndef,
			params.escapeOutput,
			params.prettyPrint,
			params.ignore,
			params.autoReplace,
			params.localization,
			params.i18nFn,
			params.bemFilter,
			params.useStrict
		].join();
}

/**
 * Saves compiled template functions in the cache by the specified key
 *
 * @param {?string} cacheKey - cache key
 * @param {string} code - source SS code
 * @param {!Object} params - compile parameters
 * @param {!Object} ctx - context
 */
export function saveIntoFnCache(cacheKey, code, params, ctx) {
	if (ctx !== NULL) {
		ctx['init'](Snakeskin);

		if (cacheKey && (params.cache || $globalFnCache[cacheKey])) {
			$globalFnCache[cacheKey] = $globalFnCache[cacheKey] || {};
			$globalFnCache[cacheKey][code] = ctx;
		}
	}
}

/**
 * Saves templates in the cache by the specified key
 *
 * @param {?string} cacheKey - cache key
 * @param {string} code - source SS code
 * @param {!Object} params - compile parameters
 * @param {!Parser} parser - instance of Parser class
 */
export function saveIntoCache(cacheKey, code, params, parser) {
	if (cacheKey && (params.cache || $globalCache[cacheKey])) {
		$globalCache[cacheKey] = $globalCache[cacheKey] || {};
		$globalCache[cacheKey][code] = {
			debug: params.debug,
			text: parser.res,
			words: params.words
		};
	}
}
