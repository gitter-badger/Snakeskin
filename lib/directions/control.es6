Snakeskin.addDirective(
	'break',

	{

	},

	function (command) {
		var combo = this.getGroup('cycle', 'async');
		combo['proto'] = true;

		var cycles = this.getGroup('cycle'),
			async = this.getGroup('async');

		var inside = this.has(combo),
			insideCallback = this.has(this.getGroup('callback')),
			insideProto = inside === 'proto' || this.proto;

		if (!cycles[inside] && !async[inside] && !insideProto) {
			return this.error(`directive "${this.name}" can only be used with a cycles, "proto" or a async series`);
		}

		this.startInlineDir();
		this.space = true;

		if (this.isSimpleOutput()) {
			if (command === 'proto') {
				if (!insideProto) {
					return this.error('proto is not defined');
				}

				this.save(this.prepareOutput('break __I_PROTO__;', true));
				return;
			}

			if (cycles[inside]) {
				if (inside === insideCallback) {
					this.save('return false;');

				} else {
					this.save('break;');
				}

			} else if (async[inside]) {
				if (inside === 'waterfall') {
					this.save('return arguments[arguments.length - 1](false);');

				} else {
					this.save(`
						if (typeof arguments[0] === 'function') {
							return arguments[0](false);
						}

						return false;
					`);
				}

			} else {
				this.save(this.prepareOutput('break __I_PROTO__;', true));
			}
		}
	}
);

Snakeskin.addDirective(
	'continue',

	{

	},

	function (command) {
		var combo = this.getGroup('cycle', 'async');
		combo['proto'] = true;

		var cycles = this.getGroup('cycle'),
			async = this.getGroup('async');

		var inside = this.has(combo),
			insideCallback = this.has(this.getGroup('callback')),
			insideProto = inside === 'proto' || this.proto;

		if (!cycles[inside] && !async[inside] && !insideProto) {
			return this.error(`directive "${this.name}" can only be used with a cycles, "proto" or a async series`);
		}

		this.startInlineDir();
		this.space = true;

		if (this.isSimpleOutput()) {
			if (command === 'proto') {
				if (!insideProto) {
					return this.error('proto is not defined');
				}

				this.save(this.prepareOutput('continue __I_PROTO__;', true));
				return;
			}

			if (cycles[inside]) {
				if (inside === insideCallback) {
					this.save('return;');

				} else {
					this.save('continue;');
				}

			} else if (async[inside]) {
				if (inside === 'waterfall') {
					this.save('return arguments[arguments.length - 1]();');

				} else {
					this.save(`
						if (typeof arguments[0] === 'function') {
							return arguments[0]();
						}

						return;
					`);
				}

			} else {
				this.save(this.prepareOutput('continue __I_PROTO__;', true));
			}
		}
	}
);