/**
 * Вернуть массив аргументов функции
 * из заданной строки
 *
 * @param {string} str - исходная строка
 * @return {!Array}
 */
DirObj.prototype.getFnArgs = function (str) {
	var res = [],
		params = false;

	var pOpen = 0,
		arg = '';

	for (let i = 0; i < str.length; i++) {
		let el = str[i];

		if (el === '(') {
			pOpen++;
			params = true;

			if (pOpen === 1) {
				continue;
			}

		} else if (el === ')') {
			pOpen--;

			if (!pOpen) {
				break;
			}
		}

		if (el === ',' && pOpen === 1) {
			res.push(arg);
			arg = '';
			continue;
		}

		if (pOpen) {
			arg += el;
		}
	}

	if (pOpen) {
		this.error(`invalid "${this.name}" declaration`);
		return [];
	}

	if (arg) {
		res.push(arg);
	}

	res.params = params;
	return res;
};

/**
 * Произвести анализ заданной строки
 * на наличие аргументов функции и вернуть результат
 *
 * @param {string} str - исходная строка
 * @param {string} tplName - название шаблона
 * @param {?string=} [opt_parentTplName] - название родительского шаблона
 * @return {{str: string, defs: string, defParams: string, scope: (string|undefined)}}
 */
DirObj.prototype.prepareArgs = function (str, tplName, opt_parentTplName) {
	var argsList = this.getFnArgs(str);
	var parentArgs,
		argsTable;

	if (opt_parentTplName) {
		parentArgs = argsCache[opt_parentTplName];
	}

	argsTable = argsCache[tplName] = {};

	var scope;
	for (let i = 0; i < argsList.length; i++) {
		let arg = argsList[i].split('=');
		arg[0] = arg[0].trim();

		if (arg.length > 1) {
			arg[1] = arg.slice(1).join('=').trim();
			arg.splice(2, arg.length);
		}

		if (scopeModRgxp.test(arg[0])) {
			if (scope) {
				this.error(`invalid "${this.name}" declaration`);

				return {
					str: '',
					defs: '',
					defParams: '',
					scope: void 0
				};

			} else {
				scope = arg[0].replace(scopeModRgxp, '');
			}
		}

		argsTable[arg[0]] = {
			i: i,
			key: arg[0],
			value: arg[1] && this.pasteDangerBlocks(arg[1].trim())
		};
	}

	if (parentArgs) {
		for (let key in parentArgs) {
			if (!parentArgs.hasOwnProperty(key)) {
				continue;
			}

			let el = parentArgs[key],
				current = argsTable[key];

			let cVal = current &&
				current.value === void 0;

			if (el.value !== void 0) {
				if (!argsTable[key]) {
					argsTable[key] = {
						local: true,
						i: el.i,
						key: key,
						value: el.value
					};

				} else if (cVal) {
					argsTable[key].value = el.value;
				}
			}
		}
	}

	argsList = [];
	var localVars = [];

	for (let key in argsTable) {
		if (!argsTable.hasOwnProperty(key)) {
			continue;
		}

		let el = argsTable[key];

		if (el.local) {
			localVars[el.i] = el;

		} else {
			argsList[el.i] = el;
		}
	}

	var decl = '',
		defParams = '';

	for (let i = 0; i < argsList.length; i++) {
		let el = argsList[i];
		el.key = el.key.replace(scopeModRgxp, '');

		decl += el.key;
		constICache[tplName][el.key] = el;

		if (el.value !== void 0) {
			defParams += `${el.key} = ${el.key} != null ? ${el.key} : ${this.prepareOutput(el.value, true)};`;
		}

		if (i !== argsList.length - 1) {
			decl += ',';
		}
	}

	var defs = '';
	for (let i = 0; i < localVars.length; i++) {
		let el = localVars[i];

		if (!el) {
			continue;
		}

		defs += `${this.needPrfx ? ALB : ''}{__const__ ${el.key.replace(scopeModRgxp, '')} = ${el.value}}`;
	}

	return {
		str: decl,
		scope: scope,
		defs: defs,
		defParams: defParams
	};
};