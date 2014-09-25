Snakeskin.addDirective(
	'eval',

	{
		sys: true,
		block: true,
		placement: 'global'
	},

	function () {
		this.startDir(null, {
			from: this.res.length
		});
	},

	function () {
		var params = this.structure.params;
		params._res = this.res;
		this.res = this.res.substring(0, params.from);
	}
);
