(() => {
	var types = {
		'js': 'text/javascript',
		'dart': 'application/dart',
		'coffee': 'application/coffeescript',
		'ts': 'application/typescript',
		'cljs': 'application/clojurescript',
		'ls': 'application/livescript',
		'json': 'application/json',
		'html': 'text/html'
	};

	Snakeskin.addDirective(
		'script',

		{
			placement: 'template',
			block: true,
			selfInclude: false
		},

		function (command) {
			this.startDir();

			if (!this.tolerateWhitespace) {
				this.skipSpace = true;
			}

			if (this.autoReplace) {
				this.autoReplace = false;
				this.structure.params.autoReplace = true;
			}

			if (this.isReady()) {
				if (command) {
					command = command.replace(emptyCommandParamsRgxp, 'js $1');

				} else {
					command = 'js';
				}

				let parts = splitBySpace(command),
					type = parts[0],
					dom = !this.domComment && this.renderMode === 'dom';

				let str,
					desc = types[type.toLowerCase()] || this.replaceTplVars(type);

				if (dom) {
					str = /* cbws */`
						__NODE__ = document.createElement('script');
						__NODE__.type = '${desc}';
					`;

				} else {
					str = this.wrap(`'<script type="${desc}"'`);
				}

				this.append(str);

				if (parts.length > 1) {
					let args = [].slice.call(arguments);

					args[0] = parts.slice(1).join(' ');
					args[1] = args[0].length;

					Snakeskin.Directions['attr'].apply(this, args);
					this.inline = false;
				}

				if (dom) {
					str = this.returnPushNodeDecl();

				} else {
					str = this.wrap('\'>\'');
				}

				this.append(str);
			}
		},

		function () {
			if (!this.tolerateWhitespace) {
				this.skipSpace = true;
			}

			if (this.structure.params.autoReplace) {
				this.autoReplace = true;
			}

			let str;

			if (!this.domComment && this.renderMode === 'dom') {
				str = '__RESULT__.pop();';

			} else {
				str = this.wrap('\'</script>\'');
			}

			this.append(str);
		}
	);
})();