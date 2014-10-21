(() => {
	Snakeskin.addDirective(
		'attr',

		{
			placement: 'template',
			notEmpty: true,
			text: true
		},

		function (command) {
			this.startInlineDir();
			if (this.isReady()) {
				let str = '',
					groups = this.splitAttrsGroup(command);

				for (let i = -1; ++i < groups.length;) {
					let el = groups[i];

					str += this.returnAttrDecl(
						el.attr,
						el.group,
						el.separator
					);
				}

				this.append(str);
			}
		}
	);

	var escapeEqRgxp = /===|==|([\\]+)=/g,
		escapeOrRgxp = /\|\||([\\]+)\|/g;

	var unEscapeEqRgxp = /__SNAKESKIN_EQ__(\d+)_(\d+)_/g,
		unEscapeOrRgxp = /__SNAKESKIN_OR__(\d+)_(\d+)_/g;

	function escapeEq(sstr, $1) {
		if ($1 && $1.length % 2 === 0) {
			return sstr;
		}

		return `__SNAKESKIN_EQ__${sstr.split('=').length}_${$1.length}_`;
	}

	function escapeOr(sstr, $1) {
		if ($1 && $1.length % 2 === 0) {
			return sstr;
		}

		return `__SNAKESKIN_OR__${sstr.split('|').length}_${$1.length}_`;
	}

	function unEscapeEq(sstr, $1, $2) {
		return new Array(Number($2)).join('\\') + new Array(Number($1)).join('=');
	}

	function unEscapeOr(sstr, $1, $2) {
		return new Array(Number($2)).join('\\') + new Array(Number($1)).join('|');
	}

	/**
	 * Вернуть строку декларации XML атрибутов
	 *
	 * @param {string} str - исходная строка
	 * @param {?string=} [opt_group] - название группы
	 * @param {?string=} [opt_separator='-'] - разделитель группы
	 * @param {?boolean=} [opt_classLink=false] - если true, то значения для атрибута class
	 *     будут сохраняться во временную переменную
	 *
	 * @return {string}
	 */
	DirObj.prototype.returnAttrDecl = function (str, opt_group, opt_separator, opt_classLink) {
		var rAttr = this.attr,
			rEscape = this.attrEscape;

		this.attr = true;
		this.attrEscape = true;

		opt_group = opt_group || '';
		opt_separator = opt_separator || '-';

		str = str
			.replace(escapeHTMLRgxp, escapeHTML)
			.replace(escapeOrRgxp, escapeOr);

		var parts = str.split('|'),
			res = '',
			ref = this.bemRef;

		var s = ADV_LEFT_BLOCK + LEFT_BLOCK,
			e = RIGHT_BLOCK;

		for (let i = -1; ++i < parts.length;) {
			parts[i] = parts[i]
				.replace(unEscapeOrRgxp, unEscapeOr)
				.replace(escapeEqRgxp, escapeEq);

			let arg = parts[i].split('='),
				empty = arg.length !== 2;

			if (empty) {
				arg[1] = this.doctype === 'xml' ?
					arg[0] : '';
			}

			arg[0] = arg[0].trim().replace(unEscapeEqRgxp, unEscapeEq);
			arg[1] = arg[1].trim().replace(unEscapeEqRgxp, unEscapeEq);

			res += /* cbws */`
				__STR__ = \'\';
				__J__ = 0;
			`;

			if (opt_group) {
				arg[0] = opt_group + opt_separator + arg[0];

			} else {
				arg[0] = arg[0].charAt(0) === '-' ?
					`data-${arg[0].slice(1)}` : arg[0];
			}

			arg[0] = this.replaceDangerBlocks(
				`'${this.pasteTplVarBlocks(arg[0])}'`
			);

			let vals = arg[1].split(' ');

			for (let j = -1; ++j < vals.length;) {
				let val = vals[j].trim();

				if (val.charAt(0) === '&' && ref) {
					val = `${s}'${this.replaceTplVars(ref, true)}'|bem '${this.replaceTplVars(val.substring('&amp;'.length), true)}'${e}`;
					val = this.replaceTplVars(val);
				}

				val = this.prepareOutput(
					this.replaceDangerBlocks(`'${this.pasteTplVarBlocks(val)}'`), true
				) || '';

				res += /* cbws */`
					if ((${val}) != null && (${val}) !== '') {
						__STR__ += __J__ ? ' ' + ${val} : ${val};
						__J__++;
					}
				`;
			}

			res += `if ((${arg[0]}) != null && (${arg[0]}) != '' && (__STR__ || ${empty})) {`;
			let tmp = /* cbws */`
				if (__NODE__) {
					__NODE__.setAttribute(${arg[0]}, __STR__);

				} else {
					${this.wrap(`' ' + ${arg[0]} + (__STR__ ? '="' + __STR__ + '"' : '')`)}
				}
			`;

			if (opt_classLink) {
				res += /* cbws */`
					if (__TMP__[(${arg[0]})] != null) {
						__TMP__[(${arg[0]})] += __STR__;

					} else {
						${tmp}
					}
				`;

			} else {
				res += tmp;
			}

			res += '}';
		}

		this.attr = rAttr;
		this.attrEscape = rEscape;

		return res;
	};

	/**
	 * Разбить строку декларации атрибута на группы
	 *
	 * @param {string} str - исходная строка
	 * @return {!Array}
	 */
	DirObj.prototype.splitAttrsGroup = function (str) {
		var rAttr = this.attr,
			rEscape = this.attrEscape;

		this.attr = true;
		this.attrEscape = true;

		str = this.replaceTplVars(str, null, true);
		var groups = [];

		var group = '',
			attr = '',
			sep = '';

		var pOpen = 0;
		var separator = {
			'-': true,
			':': true,
			'_': true
		};

		for (let i = -1; ++i < str.length;) {
			let el = str.charAt(i),
				next = str.charAt(i + 1);

			if (!pOpen) {
				if (separator[el] && next === '(') {
					pOpen++;
					i++;
					sep = el;
					continue;
				}

				if (el === '(') {
					pOpen++;
					sep = '';
					continue;
				}
			}

			if (pOpen) {
				if (el === '(') {
					pOpen++;

				} else if (el === ')') {
					pOpen--;

					if (!pOpen) {
						groups.push({
							group: Snakeskin.Filters.html(group, true).trim(),
							separator: sep,
							attr: attr.trim()
						});

						group = '';
						attr = '';
						sep = '';

						i++;
						continue;
					}
				}
			}

			if (!pOpen) {
				group += el;

			} else {
				attr += el;
			}
		}

		if (group && !attr) {
			groups.push({
				group: null,
				separator: null,
				attr: group.trim()
			});
		}

		this.attr = rAttr;
		this.attrEscape = rEscape;

		return groups;
	};
})();
