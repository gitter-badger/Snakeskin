'use strict';

/*!
 * Snakeskin
 * https://github.com/SnakeskinTpl/Snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/Snakeskin/blob/master/LICENSE
 */

import Snakeskin from '../core';
import { ws } from '../helpers/string';
import { any } from '../helpers/gcc';
import { emptyCommandParams } from '../consts/regs';

const types = {
	'css': 'text/css'
};

Snakeskin.addDirective(
	'style',

	{
		block: true,
		group: ['style', 'tag', 'output'],
		placement: 'template',
		selfInclude: false,
		trim: {
			left: true,
			right: true
		}
	},

	function (command) {
		if (this.autoReplace) {
			this.autoReplace = false;
			this.structure.params.autoReplace = true;
		}

		if (!this.isReady()) {
			return;
		}

		if (command) {
			command = command.replace(emptyCommandParams, 'css $1');

		} else {
			command = 'css';
		}

		const
			parts = this.getTokens(command),
			type = types[parts[0].toLowerCase()] || this.replaceTplVars(parts[0]);

		this.append(this.getXMLTagDecl('style', `(type = ${type}) ${parts.slice(1).join(' ')}`));
	},

	function () {
		if (this.structure.params.autoReplace) {
			this.autoReplace = true;
		}

		this.append($=> this.getEndXMLTagDecl('style'));
	}
);
