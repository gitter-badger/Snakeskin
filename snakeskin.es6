module.exports = exports = require('./build/snakeskin.min');
var fs = require('fs');

/**
 * Вернуть true, если заданный файл шаблонов соответствует скомпилированному
 * по временной метке
 *
 * @param {string} source - путь к исходному файлу
 * @param {string} result - путь к скомпилированному файлу
 * @return {boolean}
 */
exports.check = function (source, result) {
	if (!fs.existsSync(result)) {
		return false;
	}

	var label = fs.statSync(source).mtime,
		code = fs.readFileSync(result).toString();

	var resLabel = /label <([\d]+)>/.exec(code);

	if (!resLabel) {
		return false;
	}

	return label.valueOf() == resLabel[1];
};

/**
 * Скомпилировать заданный файл и вернуть ссылку на полученный объект
 *
 * @param {string} src - путь к файлу шаблонов
 * @param {Object=} [opt_params] - дополнительные параметры компиляции
 * @return {!Object}
 */
exports.compileFile = function (src, opt_params) {
	opt_params = opt_params || {};
	opt_params.commonJS = true;

	var source = fs.readFileSync(src).toString(),
		resSrc = `${src}.js`;

	var tpls;

	if (!this.check(src, resSrc)) {
		fs.writeFileSync(resSrc, this.compile(source, opt_params, {file: src}));
	}

	tpls = require(resSrc);

	if (tpls.init) {
		tpls.init(this);
	}

	return tpls;
};

/**
 * Скомпилировать заданный файл и вернуть ссылку на главную функцию
 *
 * @param {string} src - путь к файлу шаблонов
 * @param {Object=} [opt_params] - дополнительные параметры компиляции
 * @param {?string=} [opt_tplName] - имя запускаемого шаблона
 * @return {Function}
 */
exports.execFile = function (src, opt_params, opt_tplName) {
	var tpls = this.compileFile(src, opt_params),
		tpl;

	if (opt_tplName) {
		tpl = tpls[opt_tplName];

	} else {
		tpl = tpls[src.split('.').slice(0, -1).join('.')] || tpls.main || tpls[Object.keys(tpls)[0]];
	}

	return tpl || null;
};

/**
 * Скомпилировать заданный текст и вернуть ссылку на главную функцию
 *
 * @param {string} txt - исходный текст
 * @param {Object=} [opt_params] - дополнительные параметры компиляции
 * @param {?string=} [opt_tplName] - имя запускаемого шаблона
 * @return {Function}
 */
exports.exec = function (txt, opt_params, opt_tplName) {
	var tpls = {},
		tpl;

	opt_params = opt_params || {};
	opt_params.context = tpls;

	this.compile(txt, opt_params);

	if (opt_tplName) {
		tpl = tpls[opt_tplName];

	} else {
		tpl = tpls.main || tpls[Object.keys(tpls)[0]];
	}

	return tpl || null;
};