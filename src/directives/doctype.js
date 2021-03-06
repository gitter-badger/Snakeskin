'use strict';

/*!
 * Snakeskin
 * https://github.com/SnakeskinTpl/Snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/Snakeskin/blob/master/LICENSE
 */

import Snakeskin from '../core';

const types = {
	'1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" ' +
		'"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',

	'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" ' +
		'"http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',

	'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" ' +
		'"http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',

	'html': '<!DOCTYPE html>',
	'mathml 1.0': '<!DOCTYPE math SYSTEM "http://www.w3.org/Math/DTD/mathml1/mathml.dtd">',
	'mathml 2.0': '<!DOCTYPE math PUBLIC "-//W3C//DTD MathML 2.0//EN" "http://www.w3.org/Math/DTD/mathml2/mathml2.dtd">',

	'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" ' +
		'"http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">',

	'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" ' +
		'"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',

	'svg 1.0': '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" ' +
		'"http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">',

	'svg 1.1 basic': '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1 Basic//EN" ' +
		'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-basic.dtd">',

	'svg 1.1 full': '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
		'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',

	'svg 1.1 tiny': '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1 Tiny//EN" ' +
		'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-tiny.dtd">',

	'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" ' +
		'"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',

	'xml': '<?xml version="1.0" encoding="utf-8" ?>'
};

Snakeskin.addDirective(
	'doctype',

	{
		group: ['doctype', 'output'],
		placement: 'template',
		renderModesWhitelist: ['stringConcat', 'stringBuffer']
	},

	function (command) {
		command = (command || 'html').toLowerCase();

		const
			type = types[command] || '';

		if (!type) {
			return this.error('invalid doctype');
		}

		this.doctype = command !== 'html' ? 'xml' : type;
		this.append(
			this.out(`__INLINE_TAGS__ = Snakeskin.inlineTags['${command}'] || Snakeskin.inlineTags['html'];`, {unsafe: true}) +
			this.wrap(`'${type}'`)
		);
	}

);
