/*!
 * API для работы с Jade-Like синтаксисом
 */

(() => {
	var alb = ADV_LEFT_BLOCK,
		lb = LEFT_BLOCK,
		rb = RIGHT_BLOCK;

	var commandRgxp = /([^\s]+).*/,
		rightWSRgxp = /\s*$/,
		nonBlockCommentRgxp = /([^\\])\/\/\/(\s?)(.*)/,
		lastSymbolRgxp = new RegExp(`(${alb}|\\\\)$`);

	/**
	 * Вернуть объект-описание преобразованной части шаблона из
	 * Jade-Like синтаксиса в стандартный
	 *
	 * @param {string} str - исходная строка
	 * @param {number} i - номер начальной итерации
	 * @return {{str: string, length: number, error: (boolean|null|undefined)}}
	 */
	DirObj.prototype.toBaseSyntax = function (str, i) {
		var ws = !this.tolerateWhitespace;
		var clrL = 0,
			init = true,
			spaces = 0,
			space = '';

		var struct,
			res = '';

		var length = 0,
			tSpace = 0;

		function f(struct, chains, obj) {
			if (struct.block) {
				if (chains[struct.name] && chains[struct.name][obj.name]) {
					obj.block = true;
					obj.name = struct.name;

				} else {
					let tmp = rightWSRgxp.exec(res)[0];
					res = res.replace(rightWSRgxp, '');
					res += genEndDir(struct, ws, struct.space) +
						(tmp ? `${struct.adv}${lb}__&-__${rb}` : '') + tmp;
				}
			}
		}

		for (let j = i - 1; ++j < str.length;) {
			length++;

			let el = str.charAt(j),
				next = str.charAt(j + 1);

			let next2str = el + next,
				diff2str = str.substring(j + 1, j + 3);

			if (nextLineRgxp.test(el)) {
				tSpace++;

				if (next2str === '\r\n') {
					continue;
				}

				if (clrL) {
					if (clrL === 1) {
						res += `${alb}${lb}__&-__${rb}`;
					}

					res += el;
				}

				clrL++;
				init = true;

				spaces = 0;
				space = '\n';

			} else if (init) {
				if (whiteSpaceRgxp.test(el)) {
					spaces++;
					space += el;
					tSpace++;

				} else {
					let nextSpace = false;

					init = false;
					clrL = 0;

					if (el === alb) {
						if (shortMap[diff2str]) {
							nextSpace = whiteSpaceRgxp.test(str.charAt(j + 3));

						} else if (shortMap[next]) {
							nextSpace = whiteSpaceRgxp.test(str.charAt(j + 2));

						} else {
							nextSpace = whiteSpaceRgxp.test(next);
						}

					} else {
						if (shortMap[next2str]) {
							nextSpace = whiteSpaceRgxp.test(str.charAt(j + 2));

						} else {
							nextSpace = whiteSpaceRgxp.test(next);
						}
					}

					let dir = (shortMap[el] || shortMap[next2str]) && nextSpace,
						decl = getLineDesc(
							str,
							nextSpace && baseShortMap[el] || el === IGNORE_COMMAND ? j + 1 : j,
							Boolean(dir),
							next2str === MULT_COMMENT_START
						);

					if (!decl) {
						this.error('invalid syntax');
						return {
							str: '',
							length: 0,
							error: true
						};
					}

					let replacer;

					if (el === alb) {
						replacer = replacers[diff2str] ||
							replacers[next] ||
							replacers[next2str] ||
							replacers[el];

					} else {
						replacer = replacers[next2str] ||
							replacers[el];
					}

					if (replacer) {
						decl.name = replacer(decl.name).replace(commandRgxp, '$1');
					}

					let adv = el === alb ?
						alb : '';

					let s = dir ? adv + lb : '',
						e = dir ? rb : '';

					let obj = {
						dir: dir,
						name: decl.name,
						spaces: spaces,
						space: space,
						parent: null,
						block: dir && block[decl.name],
						adv: adv
					};

					if (struct) {
						if (struct.spaces < spaces && struct.block) {
							obj.parent = struct;

							if (!obj.adv && struct.adv) {
								obj.block = false;
							}

						} else if (struct.spaces === spaces || struct.spaces < spaces && !struct.block) {
							obj.parent = struct.parent;

							if (!obj.adv && struct.parent && struct.parent.adv) {
								obj.block = false;
							}

							f(struct, chains, obj);

						} else {
							while (struct.spaces >= spaces) {
								f(struct, chains, obj);
								struct = struct
									.parent;

								if (!struct) {
									return {
										str: res,
										length: length - tSpace - 1
									};
								}
							}

							obj.parent = struct;
						}
					}

					let parts,
						txt;

					decl.command = decl.command.replace(lastSymbolRgxp, '\\$1');

					if (dir) {
						if (decl.sComment) {
							parts = [decl.command];

						} else {
							parts = decl.command.split(INLINE_COMMAND);
						}

						txt = parts.slice(1).join(INLINE_COMMAND);
						txt = txt && txt.trim();
					}

					struct = obj;
					res += space + s + (dir ? parts[0] : decl.command).replace(nonBlockCommentRgxp, '$1/*$2$3$2*/') + e;

					let tmp = decl.length - 1;
					tSpace = 0;

					length += tmp;
					j += tmp;

					if (dir && txt) {
						let inline = {
							dir: false,
							spaces: spaces + 1,
							space: '',
							parent: obj,
							block: false,
							adv: ''
						};

						inline.parent = obj;
						struct = inline;
						res += txt;
					}
				}
			}
		}

		while (struct) {
			if (struct.block) {
				res += genEndDir(struct, ws, struct.space);
			}

			struct = struct
				.parent;
		}

		return {
			str: res,
			length: length
		};
	};

	/**
	 * Вернуть строку окончания блоковой директивы
	 *
	 * @param {!Object} dir - объект-описание директивы
	 * @param {boolean} ws - если true, то лишние пробельные символы вырезаются
	 * @param {string} space - доступное свободное пространство
	 * @return {string}
	 */
	function genEndDir(dir, ws, space) {
		var s = dir.adv + lb;

		if (ws) {
			space = `${s}__&+__${rb}\n${(space || '').substring(1)}`;

		} else {
			space = '\n';
		}

		return `${space}${s}__end__${rb}${s}__cutLine__${rb}`;
	}

	/**
	 * Вернуть объект описание строки в Jade-Like синтаксисе
	 *
	 * @param {string} str - исходная строка
	 * @param {number} i - номер начальной итерации
	 * @param {boolean} dir - если true, то идёт декларация директивы
	 * @param {boolean} comment - если true, то идёт декларация мультистрочного комментария
	 * @return {{command: string, length: number, name: string, lastEl: string, sComment: boolean}}
	 */
	function getLineDesc(str, i, dir, comment) {
		var res = '',
			name = '';

		var lastEl = '',
			lastElI = 0,
			length = -1;

		var sComment = false,
			inline = false;

		var concatLine = false,
			nmBrk = null;

		for (let j = i - 1; ++j < str.length;) {
			let el = str.charAt(j),
				next2Str = el + str.charAt(j + 1);

			length++;

			if (nextLineRgxp.test(el)) {
				let prevEl = lastEl,
					brk = false;

				lastEl = '';

				if (comment) {
					res += el;

				} else if (!sComment) {
					if (dir && str.charAt(j - 2) === ' ') {
						brk = prevEl === CONCAT_END;

						if (prevEl === CONCAT_COMMAND || brk) {
							res = res.substring(0, lastElI) + el + res.substring(lastElI + 1);
						}

						if (concatLine && !brk) {
							continue;
						}

						if (prevEl === CONCAT_COMMAND) {
							concatLine = true;
							continue
						}
					}
				}

				if (comment || concatLine && !brk) {
					sComment = false;
					continue;
				}

				return {
					command: res,
					length: length,
					name: name,
					lastEl: lastEl,
					sComment: !inline && sComment
				};

			} else {
				if (comment) {
					comment = next2Str !== MULT_COMMENT_END;

				} else if (!sComment) {
					comment = next2Str === MULT_COMMENT_START;

					if (!comment) {
						sComment = next2Str + str.charAt(j + 2) === SINGLE_COMMENT;
					}
				}

				if (dir && !inline && !comment && !sComment) {
					inline = str.substring(j, j + INLINE_COMMAND.length) === INLINE_COMMAND;
				}

				let whiteSpace = lineWhiteSpaceRgxp.test(el);

				if (whiteSpace) {
					if (nmBrk === false) {
						nmBrk = true;
					}

				} else {
					lastEl = el;
					lastElI = res.length;
				}

				if (!nmBrk && !whiteSpace) {
					if (nmBrk === null) {
						nmBrk = false;
					}

					name += el;
				}

				if (nmBrk !== null) {
					res += el;
				}
			}
		}

		if (dir && lastEl === CONCAT_END && res.charAt(lastElI - 1) === ' ') {
			res = res.substring(0, lastElI) + res.substring(lastElI + 1);
		}

		return {
			command: res,
			length: length,
			name: name,
			lastEl: lastEl,
			sComment: !inline && sComment
		};
	}
})();
