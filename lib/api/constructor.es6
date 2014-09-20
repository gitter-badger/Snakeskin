Snakeskin.DirObj = DirObj;

/**
 * Объект управления директивами
 *
 * @constructor
 * @param {string} src - исходный текст шаблона
 *
 * @param {!Object} params - дополнительные параметры
 * @param {?function(!Error)=} [params.onError] - функция обратного вызова для обработки ошибок при трансляции
 *
 * @param {boolean} params.throws - если true, то в случае ошибки и отсутствия обработчика ошибок -
 *     будет сгенерирована ошибка
 *
 * @param {boolean} params.commonJS - если true, то шаблон компилируется с экспортом в стиле commonJS
 * @param {boolean} params.interface - если true, то все директивы template трактуются как interface
 *     и при наследовании можно задавать необъявленные родительские шаблоны
 *
 * @param {boolean} params.inlineIterators - если true, то итераторы forEach и forIn
 *     будут развёрнуты в циклы
 *
 * @param {boolean} params.autoReplace - если false, то Snakeskin не делает дополнительных преобразований
 *     последовательностей
 *
 * @param {Object=} [params.macros] - таблица символов для преобразования последовательностей
 *
 * @param {boolean} params.xml - если false, то Snakeskin не делает дополнительных
 *     проверок текста как xml (экранируются атрибуты и проверяется закрытость тегов)
 *
 * @param {boolean} params.localization - если false, то блоки ` ... ` не заменяются на вызов i18n
 * @param {string} params.i18nFn - название функции для i18n
 * @param {Object=} [params.language] - таблица фраз для локализации (найденные фразы будут заменены по ключу)
 *
 * @param {boolean} params.escapeOutput - если false, то на вывод значений через директиву output
 *     не будет накладываться фильтр html
 *
 * @param {string} params.renderMode - режим ренедеринга шаблонов, доступные варианты:
 *
 *     1) stringConcat - рендеринг шаблона в строку с простой конкатенацией через оператор сложения;
 *     2) stringBuffer - рендеринг шаблона в строку с конкатенацией через Snakeskin.StringBuffer;
 *     3) dom - рендеринг шаблона в набор команд из DOM API.
 *
 * @param {Array=} [params.lines] - массив строк шаблона (листинг)
 * @param {DirObj=} [params.parent] - ссылка на родительский объект
 *
 * @param {?boolean=} [params.needPrfx] - если true, то директивы декларируются как #{ ... }
 * @param {?number=} [params.prfxI] - глубина префиксных директив
 *
 * @param {Array=} [params.scope] - область видимости (контекст) директив
 * @param {Object=} [params.vars] - объект локальных переменных
 * @param {Array=} [params.consts] - массив деклараций констант
 *
 * @param {Object=} [params.proto] - объект корневого прототипа
 * @param {Object=} [params.info] - дополнительная информация о запуске
 *     (используется для сообщений об ошибках)
 */
function DirObj(src, params) {
	for (let key in this) {
		if (this[key] && this[key].init) {
			this[key] = this[key].init();
		}
	}

	/** @type {DirObj} */
	this.parent = params.parent;

	/** @type {boolean} */
	this.throws = params.throws;

	/** @type {?function(!Error)} */
	this.onError = params.onError || null;

	/** @type {!Array} */
	this.scope = params.scope || [];

	/** @type {Object} */
	this.proto = params.proto;

	/** @type {Object} */
	this.info = params.info;

	/** @type {number} */
	this.prfxI = params.prfxI || 0;

	/** @type {boolean} */
	this.needPrfx = params.needPrfx || false;

	/** @type {!Array} */
	this.lines = params.lines || [''];

	/**
	 * @expose
	 * @type {string}
	 */
	this.renderMode = params.renderMode;

	/**
	 * @expose
	 * @type {boolean}
	 */
	this.inlineIterators = params.inlineIterators;

	/**
	 * @expose
	 * @type {boolean}
	 */
	this.xml = params.xml;

	/**
	 * @expose
	 * @type {boolean}
	 */
	this.escapeOutput = params.escapeOutput;

	/**
	 * @expose
	 * @type {boolean}
	 */
	this.interface = params.interface;

	/**
	 * @expose
	 * @type {Object}
	 */
	this.commonJS = params.commonJS;

	/**
	 * @expose
	 * @type {boolean}
	 */
	this.autoReplace = params.autoReplace !== false;

	/**
	 * @expose
	 * @type {(Object|undefined)}
	 */
	this.macros = params.macros;

	/**
	 * @expose
	 * @type {boolean}
	 */
	this.localization = params.localization;

	/**
	 * @expose
	 * @type {string}
	 */
	this.i18nFn = params.i18nFn;

	/**
	 * @expose
	 * @type {(Object|undefined)}
	 */
	this.language = params.language;

	/**
	 * Стек изменямых параметров локализации
	 * (те параметры, которые можно изменить директивой)
	 * @type {!Array}
	 */
	this.params = [
		{
			'@root': true,
			renderMode: this.renderMode,
			inlineIterators: this.inlineIterators,
			xml: this.xml,
			escapeOutput: this.escapeOutput,
			interface: this.interface,
			commonJS: this.commonJS,
			autoReplace: this.autoReplace,
			macros: this.macros,
			localization: this.localization,
			i18nFn: this.i18nFn,
			language: this.language
		}
	];

	if (params.consts) {
		/** @type {(Array|undefined)} */
		this.consts = params.consts;
	}

	/**
	 * Если true, то трансляция сбрасывается
	 * @type {boolean}
	 */
	this.brk = false;

	/**
	 * Название активной директивы
	 * @type {?string}
	 */
	this.name = null;

	/**
	 * Таблица директив, которые могут идти после исходной
	 * @type {Object}
	 */
	this.after = null;

	/**
	 * Если false, то шаблон не вставляется в результирующую JS строку
	 * @type {boolean}
	 */
	this.canWrite = true;

	// Флаги работы с пробельными символами
	// >>>

	/** @type {boolean} */
	this.space = false;

	/** @type {boolean} */
	this.prevSpace = false;

	/** @type {boolean} */
	this.strongSpace = false;

	/** @type {number} */
	this.superStrongSpace = 0;

	/** @type {number} */
	this.freezeLine = 0;

	/** @type {RegExp} */
	this.ignoreRgxp = null;

	/** @type {boolean} */
	this.attr = false;

	// <<<

	/**
	 * Номер активной итерации
	 * @type {number}
	 */
	this.i = -1;

	/**
	 * Дерево блоков (прототипы, блоки, константы)
	 * @type {Object}
	 */
	this.blockStructure = null;

	/**
	 * Таблица блоков (прототипы, блоки, константы)
	 * @type {Object}
	 */
	this.blockTable = null;

	/**
	 * Структура шаблонов
	 * @type {!Object}
	 */
	this.structure = {
		name: 'root',

		/** @type {?{name: string, parent: Object, params: !Object, stack: !Array, vars: Object, children: Array, sys: boolean, strong: boolean}} */
		parent: null,

		params: {},
		stack: [],

		vars: params.vars || {},
		children: [],

		sys: false,
		strong: false
	};

	/**
	 * Если true, то директива не имеет закрывающей части
	 * @type {?boolean}
	 */
	this.inline = null;

	/**
	 * Если true, то директива считается текстовой
	 * @type {boolean}
	 */
	this.text = false;

	/**
	 * Текст, который будет возвращён шаблоном
	 * после выхода из директив группы callback
	 * @type {(string|boolean|null)}
	 */
	this.deferReturn = null;

	/**
	 * Содержимое скобок (Escaper)
	 * @type {!Array}
	 */
	this.quotContent = [];

	/**
	 * Содержимое директив (для replaceTplVars)
	 * @type {!Array}
	 */
	this.dirContent = [];

	/**
	 * Содержимое блоков cdata
	 * @type {!Array}
	 */
	this.cDataContent = [];

	/**
	 * Таблица подключённых файлов
	 * @type {!Object}
	 */
	this.files = {};

	/**
	 * Объект модуля
	 * @type {{exports, require, id, key, root, filename, parent, children, loaded}}
	 */
	this.module = {
		exports: {},
		require: IS_NODE ?
			require : null,

		id: 0,
		key: [],

		root: null,
		filename: this.info['file'],
		parent: IS_NODE ?
			module : null,

		children: [],
		loaded: true
	};

	var s = ADV_LEFT_BLOCK + LEFT_BLOCK,
		e = RIGHT_BLOCK;

	/**
	 * Исходный текст шаблона
	 * @type {string}
	 */
	this.source = String(src)
		.replace(new RegExp(`${s}cdata${e}([\\s\\S]*?)${s}(?:\\/cdata|end cdata)${e}`, 'gm'), (sstr, data) => {
			this.cDataContent.push(data);

			return '' +
				// Количество добавляемых строк
				`${s}__appendLine__ ${(data.match(/[\n\r]/g) || '').length}${e}` +

				// Метка для замены CDATA
				`__CDATA__${this.cDataContent.length - 1}_`
				;
		});

	/**
	 * Результирующий JS код
	 * @type {string}
	 */
	this.res = '';

	if (!this.proto) {
		let decl = `
			var __ROOT__ = this,
				self = this;

			var \$C = this.\$C != null ? this.\$C : Snakeskin.Vars.\$C,
				async = this.async != null ? this.async: Snakeskin.Vars.async;

			var __\$C__ = \$C,
				__async__ = async;

			var __APPEND__ = Snakeskin.appendChild,
				__FILTERS__ = Snakeskin.Filters,
				__VARS__ = Snakeskin.Vars,
				__LOCAL__ = Snakeskin.LocalVars,
				__STR__,
				__TMP__,
				__J__;

			var \$_ = __LOCAL__['\$_${uid}'];
		`;

		this.res += `
			This code is generated automatically, don\'t alter it. */
			(function () {
		`;

		if (this.commonJS) {
			this.res += `
				var Snakeskin = global.Snakeskin;

				exports['init'] = function (obj) {
					Snakeskin = Snakeskin || obj instanceof Object ?
						obj : require(obj);

					delete exports.init;
					exec.call(exports);

					return exports;
				};

				function exec() {
					${decl}
			`;

		} else {
			this.res += decl;
		}
	}
}