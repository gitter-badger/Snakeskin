'use strict';

// jscs:disable requireTemplateStrings
// jscs:disable validateOrderInObjectKeys

/*!
 * Snakeskin
 * https://github.com/SnakeskinTpl/Snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/Snakeskin/blob/master/LICENSE
 */

import $C from '../deps/collection';
import esprima from '../deps/esprima';
import Snakeskin from '../core';
import Parser from './constructor';
import { isFunction } from '../helpers/types';
import { concatProp } from '../helpers/literals';
import { r } from '../helpers/string';
import * as rgxp from '../consts/regs';
import { $consts, $scope } from '../consts/cache';
import {

	FILTER,
	G_MOD,
	P_OPEN,
	P_CLOSE

} from '../consts/literals';

const blackWords = {
	'+': true,
	'++': true,
	'-': true,
	'--': true,
	'~': true,
	'~~': true,
	'!': true,
	'!!': true,
	'break': true,
	'case': true,
	'catch': true,
	'continue': true,
	'delete': true,
	'do': true,
	'else': true,
	'false': true,
	'finally': true,
	'for': true,
	'function': true,
	'if': true,
	'in': true,
	'of': true,
	'instanceof': true,
	'new': true,
	'null': true,
	'return': true,
	'switch': true,
	'this': true,
	'throw': true,
	'true': true,
	'try': true,
	'typeof': true,
	'var': true,
	'const': true,
	'let': true,
	'void': true,
	'while': true,
	'with': true,
	'class': true,
	'interface': true,
	'async': true,
	'await': true
};

const unaryBlackWords = {
	'new': true,
	'typeof': true,
	'instanceof': true,
	'in': true,
	'of': true
};

const unUndefUnaryBlackWords = {
	'new': true
};

const comboBlackWords = {
	'var': true,
	'const': true,
	'let': true
};

const
	nextWordCharRgxp = new RegExp(`[${r(G_MOD)}$+\\-~!${rgxp.w}[\\]().]`);

/**
 * Returns a full word from a string
 *
 * @param {string} str - source string
 * @param {number} pos - start search position
 * @return {{word: string, finalWord: string, unary: string}}
 */
Parser.prototype.getWordFromPos = function (str, pos) {
	let
		pCount = 0,
		diff = 0;

	let
		start = 0,
		pContent = null;

	let
		unary,
		unaryStr = '',
		word = '';

	let
		res = '',
		nRes = '';

	for (let i = pos, j = 0; i < str.length; i++, j++) {
		const
			el = str[i];

		if (!pCount && !nextWordCharRgxp.test(el) && (el !== ' ' || !(unary = unaryBlackWords[word]))) {
			break;
		}

		if (el === ' ') {
			word = '';

		} else {
			word += el;
		}

		if (unary) {
			unaryStr = unaryStr || res;
			unary = false;
		}

		if (pContent !== null && (pCount > 1 || (pCount === 1 && !P_CLOSE[el]))) {
			pContent += el;
		}

		if (P_OPEN[el]) {
			if (pContent === null) {
				start = j + 1;
				pContent = '';
			}

			pCount++;

		} else if (P_CLOSE[el]) {
			if (!pCount) {
				break;
			}

			pCount--;
			if (!pCount) {
				let
					startD = start,
					endD = j;

				if (nRes) {
					startD = start + diff;
					endD = j + diff + pContent.length;
				}

				nRes =
					res.slice(0, startD) +
					(pContent && this.out(pContent, {unsafe: true})) +
					res.slice(endD);

				diff = nRes.length - res.length;
				pContent = null;
			}
		}

		res += el;
		if (nRes) {
			nRes += el;
		}
	}

	return {
		word: res,
		finalWord: nRes || res,
		unary: unaryStr
	};
};

const
	propRgxp = new RegExp(`[${rgxp.w}]`);

/**
 * Returns true, if a string part is a property of an object literal
 *
 * @param {string} str - source string
 * @param {number} start - start search position
 * @param {number} end - end search position
 * @return {boolean}
 */
function isSyOL(str, start, end) {
	let res;

	while (start--) {
		const
			el = str[start];

		if (!rgxp.eol.test(el)) {
			res = el === '?';
			break;
		}

		if (!rgxp.eol.test(el) && (!propRgxp.test(el) || el === '?')) {
			if (el === '{' || el === ',') {
				break;
			}

			res = true;
			break;
		}
	}

	if (!res) {
		for (let i = end; i < str.length; i++) {
			const
				el = str[i];

			if (!rgxp.eol.test(el)) {
				return el === ':';
			}
		}
	}

	return false;
}

/**
 * Returns true, if the next non-whitespace character
 * in a string is the assignment (=)
 *
 * @param {string} str - source string
 * @param {number} pos - start search position
 * @return {boolean}
 */
function isNextAssign(str, pos) {
	for (let i = pos; i < str.length; i++) {
		const
			el = str[i];

		if (!rgxp.eol.test(el)) {
			return el === '=' && str[i + 1] !== '=';
		}
	}

	return false;
}

const
	ssfRgxp = /__FILTERS__\./,
	nextCharRgxp = new RegExp(`[${r(G_MOD)}$+\\-~!${rgxp.w}]`),
	newWordRgxp = new RegExp(`[^${r(G_MOD)}$${rgxp.w}[\\].]`);

const
	multPropRgxp = /\[|\./,
	firstPropRgxp = /([^.[]+)(.*)/,
	propValRgxp = /[^-+!(]+/;

const esprimaHackFn = (str) => str
	.trim()
	.replace(/^({.*)/, '($0)')
	.replace(/^\[(?!\s*])/, '$[')
	.replace(/\byield\b/g, '')
	.replace(/(?:break|continue) [_]{2,}I_PROTO__[${rgxp.w}]+;/, '');

const
	dangerRgxp = /\)\s*(?:{|=>)/,
	functionRgxp = /\bfunction\b/;

/**
 * Prepares the specified command to output:
 * binds to the scope and initialization filters
 *
 * @param {string} command - source command
 * @param {?{
 *   unsafe: (?boolean|undefined),
 *   skipFirstWord: (?boolean|undefined),
 *   skipValidation: (?boolean|undefined)
 * }=} [opt_params] - additional parameters:
 *
 *   *) [unsafe=false] - if is true, then default filters won't be applied to the resulting string
 *   *) [skipFirstWord=false] - if is true, then the first word in the string will be skipped
 *   *) [skipValidation=true] - if is false, then the resulting string won't be validated
 *
 * @return {string}
 */
Parser.prototype.out = function (command, opt_params) {
	const
		{unsafe, skipFirstWord, skipValidation} = opt_params || {};

	const
		{tplName, structure} = this,
		Filters = $C(Snakeskin.Filters);

	if (dangerRgxp.test(command)) {
		this.error('unsupported syntax');
		return '';
	}

	// DEFINITIONS:
	// Parenthesis = (

	let res = command;

	// The number of open parentheses in the string
	// (open parenthesis inside the filter aren't considered)
	let pCount = 0;

	// The number of open parentheses inside a filter:
	// |foo (1 + 2) / 3
	let pCountFilter = 0;

	// The array of positions for opening and closing parenthesis (pCount),
	// goes in ascending order of nested blocks, such as:
	// ((a + b)) => [[1, 7], [0, 8]]
	const pContent = [];

	// true, if there is filter declaration
	let filterStart = false;

	// true, if there is a filter-wrapper, ie
	// (2 / 3)|round
	let filterWrapper = false;

	// Arrays of final filters and real filters,
	// for example:
	// {with foo}
	//     {bar |ucfirst bar()|json}
	// {end}
	//
	// rvFilter => ['ucfirst bar()', 'json']
	// filter => ['ucfirst foo.bar()', 'json']
	let
		filters = [],
		rFilters = [];

	const
		defFilters = this.filters[this.filters.length - 1],
		unFMap = {};

	// true, if it is possible to calculate the word
	let nWord = !skipFirstWord;

	// The number of words to skip
	let posNWord = 0;

	const
		{scope} = this,
		useWith = Boolean(scope.length);

	const
		vars = structure.children ? structure.vars : structure.parent.vars;

	let
		add = 0,
		wordAddEnd = 0,
		filterAddEnd = 0;

	let
		ref = this.hasBlock('block', true),
		type;

	if (ref) {
		ref = ref.params.name;
		type = 'block';
	}

	if (ref && !$scope[type][tplName]) {
		ref = false;
	}

	function search(obj, val, extList) {
		if (!obj) {
			return false;
		}

		const
			def = vars[`${val}_${obj.id}`];

		if (def) {
			return def;
		}

		if (extList.length && obj.children[extList[0]]) {
			return search(obj.children[extList.shift()], val, extList);
		}

		return false;
	}

	const replacePropVal = (sstr) => {
		let
			def = vars[sstr];

		if (!def) {
			let
				refCache = ref && $scope[type][tplName][ref];

			if (!refCache || refCache.parent && (!refCache.overridden || this.hasParent('__super__'))) {
				if (refCache) {
					def = search(refCache.root, sstr, Parser.getExtList(String(tplName)));
				}

				let
					tplCache = tplName && $scope['template'][tplName];

				if (!def && tplCache && tplCache.parent) {
					def = search(tplCache.root, sstr, Parser.getExtList(String(tplName)));
				}
			}

			if (!def && refCache) {
				def = vars[`${sstr}_${refCache.id}`];
			}

			if (!def) {
				def = vars[`${sstr}_${this.environment.id}`] || vars[`${sstr}_00`];
			}
		}

		if (def) {
			return def.value;
		}

		return sstr;
	};

	function addScope(str) {
		if (multPropRgxp.test(str)) {
			let fistProp = firstPropRgxp.exec(str);
			fistProp[1] = fistProp[1].replace(propValRgxp, replacePropVal);
			return fistProp.slice(1).join('');
		}

		return str.replace(propValRgxp, replacePropVal);
	}

	const joinFParams = (params) =>
		$C(params).map((el) => isFunction(el) ? el(this) : el).join(',');

	const addDefFilters = (str, filters) => {
		const un = {};
		const tmp = $C(filters).reduce((val, filter) => {
			const reduce = (str, args, filter) =>
				`(${val}|${filter} ${joinFParams(args)}@)`;

			return $C(filter).reduce(reduce, '');

		}, str);

		return removeDefFilters(tmp, un);
	};

	function removeDefFilters(str, map) {
		$C(map).forEach((el, filter) => {
			str = str.replace(new RegExp(`\\|${filter} .*?@\\)`, 'g'), ')');
		});

		return str;
	}

	if (!command) {
		this.error('invalid syntax');
		return '';
	}

	const
		commandLength = command.length,
		end = commandLength - 1;

	const
		cacheLink = replacePropVal('$_');

	let
		isFilter,
		breakNum;

	for (let i = 0; i < commandLength; i++) {
		const
			el = command[i],
			next = command[i + 1],
			nNext = command[i + 2];

		if (!breakNum) {
			if (el === '(') {
				if (filterStart) {
					pCountFilter++;

				} else {
					pContent.unshift([i + wordAddEnd]);
					pCount++;
				}
			}

			// Calculation of a scope:
			// nWord indicates that started a new word;
			// posNWord indicates how many new words to skip
			if (nWord && !posNWord && nextCharRgxp.test(el)) {
				const
					nextStep = this.getWordFromPos(command, i);

				let
					{word, finalWord} = nextStep;

				let
					uAdd = wordAddEnd + add,
					tmpFinalWord;

				if (nextStep.unary) {
					tmpFinalWord = finalWord.split(' ');
					finalWord = tmpFinalWord[tmpFinalWord.length - 1];
				}

				// If true, then the word is:
				// not from blacklist,
				// not a filter,
				// not a number,
				// not a Escaper literal,
				// not a property ({property: )
				const canParse = !blackWords[word] && !pCountFilter && !ssfRgxp.test(word) && !isFilter &&
					isNaN(Number(word)) && !rgxp.escaperPart.test(word) && !isSyOL(command, i, i + word.length);

				if (canParse && functionRgxp.test(word)) {
					this.error('unsupported syntax');
					return '';
				}

				let vRes;
				if (canParse && el === G_MOD) {
					if (next === G_MOD) {
						vRes = `__VARS__${concatProp(finalWord.slice(2))}`;

					} else if (useWith) {
						vRes = addScope(scope[scope.length - 1]) + concatProp(finalWord.slice(1));
					}

				} else if (finalWord === 'this' && tplName && !this.hasParent(this.getGroup('selfThis'))) {
					vRes = '__THIS__';

				} else {
					vRes = finalWord;
				}

				if (canParse &&
					isNextAssign(command, i + word.length) &&
					tplName &&
					$consts[tplName] &&
					$consts[tplName][vRes]
				) {

					this.error(`constant "${vRes}" is already defined`);
					return '';
				}

				if (nextStep.unary) {
					tmpFinalWord[tmpFinalWord.length - 1] = vRes;
					vRes = tmpFinalWord.join(' ');
				}

				// This word is a composite system,
				// skip 2 words
				if (comboBlackWords[finalWord]) {
					posNWord = 2;

				} else if (canParse && !unsafe && !filterStart && (!nextStep.unary || unUndefUnaryBlackWords[nextStep.unary])) {
					vRes = addDefFilters(vRes, defFilters.local);
				}

				wordAddEnd += vRes.length - word.length;
				nWord = false;

				if (filterStart) {
					const last = filters.length - 1;
					filters[last] += vRes;
					rFilters[last] += word;
					filterAddEnd += vRes.length - word.length;

				} else {
					res = res.slice(0, i + uAdd) + vRes + res.slice(i + word.length + uAdd);
				}

				i += word.length - 2;
				breakNum = 1;
				continue;

			// Maybe soon will start a new word
			} else if (newWordRgxp.test(el)) {
				nWord = true;

				if (posNWord) {
					posNWord--;
				}
			}

			if (!filterStart) {
				if (el === ')') {
					// Closing parenthesis, and the next two characters aren't filter
					if (next !== FILTER || !rgxp.filterStart.test(nNext)) {
						if (pCount) {
							pCount--;
						}

						pContent.shift();
						continue;

					} else {
						filterWrapper = true;
					}
				}

			// Filter body
			} else if (el !== ')' || pCountFilter) {
				const last = filters.length - 1;
				filters[last] += el;
				rFilters[last] += el;
			}
		}

		if (i === end && pCount && !filterWrapper && el !== ')') {
			this.error('missing closing or opening parenthesis in the template');
			return '';
		}

		// Closing of a local or a global filter
		if (filterStart && !pCountFilter && (el === ')' && !breakNum || i === end)) {
			const
				[pos] = pContent,
				localUnFMap = {};

			const
				fAdd = wordAddEnd - filterAddEnd + add,
				fBody = res.slice(pos[0] + (pCount ? add : 0), pos[1] + fAdd);

			const
				isGlobalFilter = i === end && el != ')';

			filters = $C(filters).get((el) => {
				if (el[0] !== '!') {
					return true;
				}

				const
					filter = el.slice(1);

				if (isGlobalFilter) {
					unFMap[filter] = true;

				} else {
					localUnFMap[filter] = true;
				}
			});

			let tmp = $C(filters).reduce((decl, el) => {
				const
					params = el.split(' '),
					input = params.slice(1).join(' ').trim(),
					current = params.shift().split('.');

				let bind;
				if (Filters.in(current)) {
					$C(Filters.get(current)['ssFilterParams']).forEach((el, key) => {
						if (key[0] === '!') {
							const
								filter = el.slice(1);

							if (isGlobalFilter) {
								unFMap[filter] = true;

							} else {
								localUnFMap[filter] = true;
							}

						} else if (key === 'bind') {
							bind = el;
						}
					});
				}

				decl =
					`(${cacheLink} = __FILTERS__${$C(current).reduce((str, el) => str + `['${el}']`, '')}` +
						(filterWrapper || !pCount ? '.call(this,' : '') +
						decl +
						(bind ? `,${joinFParams(bind)}` : '') +
						(input ? `,${input}` : '') +
						(filterWrapper || !pCount ? ')' : '') +
					')'
				;

				return decl;

			}, fBody.trim() || 'void 0');

			if (!isGlobalFilter) {
				tmp = removeDefFilters(tmp, localUnFMap);
			}

			const fStr = rFilters.join().length + 1;
			res = pCount ? res.slice(0, pos[0] + add) + tmp + res.slice(pos[1] + fAdd + fStr) : tmp;

			pContent.shift();
			filters = [];
			filterStart = false;
			rFilters = [];

			if (pCount) {
				pCount--;
				filterWrapper = false;
			}

			wordAddEnd += tmp.length - fBody.length - fStr;

			if (!pCount) {
				add += wordAddEnd - filterAddEnd;
				wordAddEnd = 0;
				filterAddEnd = 0;
			}
		}

		// Closing parenthesis inside a filter
		if (el === ')' && pCountFilter && !breakNum) {
			pCountFilter--;

			if (!pCountFilter) {
				const
					last = filters.length - 1,
					cache = filters[last];

				filters[last] = this.out(cache, {skipFirstWord: true, logic: true, skipValidation: true});
				const
					length = filters[last].length - cache.length;

				wordAddEnd += length;
				filterAddEnd += length;

				if (i === end) {
					i--;
					breakNum = 1;
				}
			}
		}

		isFilter = el === FILTER;
		if (breakNum) {
			breakNum--;
		}

		// After 2 iteration begins a filter
		if (next === FILTER && rgxp.filterStart.test(nNext)) {
			nWord = false;

			if (!filterStart) {
				if (pCount) {
					pContent[0].push(i + 1);

				} else {
					pContent.push([0, i + 1]);
				}
			}

			filterStart = true;
			if (!pCountFilter) {
				filters.push(nNext);
				rFilters.push(nNext);
				i += 2;
			}

		} else if (i === 0 && el === FILTER && rgxp.filterStart.test(next)) {
			nWord = false;

			if (!filterStart) {
				pContent.push([0, i]);
			}

			filterStart = true;
			if (!pCountFilter) {
				filters.push(next);
				rFilters.push(next);
				i++;
			}
		}
	}

	if (!unsafe) {
		res = this.out(
			removeDefFilters(addDefFilters(res, defFilters.global), unFMap).replace(/@\)/g, ')'),
			{unsafe: true, skipFirstWord, skipValidation}
		);

		res = `__FILTERS__.node(${res}, __NODE__)`;
	}

	if (skipValidation !== false) {
		try {
			esprima.parse(esprimaHackFn(res));

		} catch (err) {
			this.error(err.message.replace(/.*?: (\w)/, (sstr, $1) => $1.toLowerCase()));
			return '';
		}
	}

	return res;
};
