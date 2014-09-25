(() => {
	/**
	 * Преобразовать заданное значение в объект
	 *
	 * @expose
	 * @param {?} val - объект, строка для парсинга или URL
	 * @param {?string=} [opt_base] - базовый URL
	 * @return {!Object}
	 */
	Snakeskin.toObj = function (val, opt_base) {
		if (typeof val !== 'string') {
			return val;
		}

		var res;

		if (IS_NODE) {
			let path = require('path');
			let fs = require('fs'),
				exists = fs['existsSync'] || path['existsSync'];

			let old = val;
			if (opt_base) {
				val = path['resolve'](path['dirname'](opt_base), path['normalize'](val));
			}

			if (exists(val)) {
				res = require(val);

				if (res) {
					return res;
				}

				val = fs['readFileSync'](val).toString();

			} else {
				val = old;
			}
		}

		try {
			res = JSON.parse(val);

		} catch (ignore) {
			try {
				res = eval(`(${val})`);

			} catch (ignore) {
				res = {};
			}
		}

		return Object(res || {});
	};

	/**
	 * Расширить объект a объектом b
	 * (глубокое расширение)
	 *
	 * @param {!Object} a
	 * @param {!Object} b
	 * @return {!Object}
	 */
	function extend(a, b) {
		for (let key in b) {
			if (!b.hasOwnProperty(key)) {
				continue;
			}

			if (a[key] instanceof Object && b[key] instanceof Object) {
				extend(a[key], b[key]);

			} else {
				a[key] = b[key];
			}
		}

		return a;
	}

	/**
	 * Вернуть объект, расширенный с помощью заданных объектов
	 *
	 * @param {!Object} base - базовый расширяющий объект
	 * @param {Object=} [opt_adv] - дополнительный расширяющий объект
	 * @param {Object=} [opt_initial] - объект инициализации
	 * @return {!Object}
	 */
	function mix(base, opt_adv, opt_initial) {
		var obj = opt_initial || {};

		if (opt_adv) {
			for (let key in opt_adv) {
				if (!opt_adv.hasOwnProperty(key)) {
					continue;
				}

				obj[key] = opt_adv[key];
			}
		}

		return extend(obj, base);
	}

	function setSSFlag(command) {
		this.startInlineDir();

		var file = this.info['file'],
			init = false;

		var root = this.params[0],
			last = this.params[this.params.length - 1],
			params = last;

		var cache,
			parentCache,
			tplName = this.tplName;

		if (tplName) {
			cache =
				outputCache[tplName]['flag'] = outputCache[tplName]['flag'] || {};

			if (this.parentTplName) {
				parentCache = outputCache[this.parentTplName] && outputCache[this.parentTplName]['flag'];
			}
		}

		if (last['@root'] || (file === void 0 || last['@file'] !== file) || (tplName && last['@tplName'] !== tplName)) {
			init = true;
			params = {
				'@file': file,
				'@tplName': tplName
			};

			let inherit = (obj) => {
				for (let key in obj) {
					if (!obj.hasOwnProperty(key)) {
						continue;
					}

					if (key.charAt(0) !== '@' && key in root) {
						params[key] =
							this[key] = obj[key];
					}
				}
			};

			inherit(last);

			if (parentCache) {
				inherit(parentCache);
			}

			this.params.push(params);
		}

		var parts = command.split(' ');
		var flag = parts[0].trim(),
			value = this.evalStr('return ' + this.pasteDangerBlocks(parts.slice(1).join(' ').trim()));

		var includeMap = {
			'language': true,
			'macros': true
		};

		if (flag in root) {
			if (includeMap[flag]) {
				value = mix(
					Snakeskin.toObj(value, file),

					init ?
						params[flag] : null,

					init ?
						null : params
				);

				if (flag === 'macros') {
					this.setMacros(value, null, init);
				}
			}

			params[flag] = value;
			this[flag] = value;

			if (cache) {
				if (flag === 'inlineIterators' && parentCache && value !== parentCache[flag]) {
					return this.error('flag "inlineIterators" can\'t be overridden in the child template');
				}

				cache[flag] = value;
			}
		}
	}

	Snakeskin.addDirective(
		'setSSFlag',

		{
			placement: 'global',
			notEmpty: true,
			replacers: {
				'@=': (cmd) => cmd.replace('@=', 'setSSFlag ')
			}
		},

		setSSFlag
	);

	Snakeskin.addDirective(
		'__setSSFlag__',

		{
			notEmpty: true,
			replacers: {
				'@=': (cmd) => cmd.replace('@=', 'setSSFlag ')
			}
		},

		setSSFlag
	);
})();
