CM.Gate = new Class({
	Implements: [Options],
	options: {
		onUpdate: function(options) {
			this.setOptions(options);
		}
	},
	initialize: function(options) {
		var self = this;
		self.setOptions(options);
	}
});