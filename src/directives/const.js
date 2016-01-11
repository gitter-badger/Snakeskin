'use strict';

/*!
 * Snakeskin
 * https://github.com/SnakeskinTpl/Snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/Snakeskin/blob/master/LICENSE
 */

import Snakeskin from '../core';
import { scopeMod } from '../consts/regs';
import { SYS_CONSTS } from '../consts/literals';
import { $consts, $constPositions } from '../consts/cache';

Snakeskin.addDirective(
	'const',

	{
		deferInit: true,
		group: ['const', 'inherit', 'inlineInherit']
	},

	function (command, commandLength) {
		const
			{tplName} = this;

		if (!tplName) {
			Snakeskin.Directives['global'].call(this, ...arguments);
			return;
		}

		this.startInlineDir('const');

		const
			output = command.slice(-1) === '?';

		if (output) {
			command = command.slice(0, -1);
		}

		const
			parts = command.split('=');

		if (!parts[1] || !parts[1].trim()) {
			return this.error(`invalid "${this.name}" declaration`);
		}

		let
			prop = parts[0].trim();

		if (scopeMod.test(prop)) {
			prop = this.out(prop, {unsafe: true});
		}

		const
			name = this.pasteDangerBlocks(prop).replace(/\[(['"`])(.*?)\1]/g, '.$2');

		if (!/[.\[]/.test(prop)) {
			this.consts.push(`var ${prop};`);
		}

		const
			str = `${prop} = ${this.out(parts.slice(1).join('='), {unsafe: !output})};`;

		this.text = output;
		this.append(output ? this.wrap(str) : str);

		if (this.isAdvTest()) {
			if ($consts[tplName][name]) {
				return this.error(`the constant "${name}" is already defined`);
			}

			if (this.vars[tplName][name]) {
				return this.error(`the constant "${name}" is already defined as variable`);
			}

			if (SYS_CONSTS[name]) {
				return this.error(`can't declare the constant "${name}", try another name`);
			}

			const
				parentTpl = this.parentTplName,
				start = this.i - this.startTemplateI;

			let
				parent,
				insideCallBlock = this.hasParentBlock('block', true);

			if (parentTpl) {
				parent = $consts[parentTpl][name];
			}

			if (insideCallBlock && insideCallBlock.name === 'block' && !insideCallBlock.params.args) {
				insideCallBlock = false;
			}

			$consts[tplName][name] = {
				block: Boolean(insideCallBlock || parentTpl && parent && parent.block),
				from: start - commandLength,
				needPrfx: this.needPrfx,
				output: output ? '?' : null,
				to: start
			};

			if (!insideCallBlock) {
				$constPositions[tplName] = start + 1;
			}
		}
	}

);
