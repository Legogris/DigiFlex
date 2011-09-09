CM.Gate = new Class({
	Implements: [Options],
    type: 0,
    symbol: '',
    reverses: false,
    inputCount: 1,
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

CM.XOR = new Class({
    Implements: [CM.Gate],
    name: 'XOR',
    type: 1,
    inputCount: 2,
    reverses: false,
    symbol: '= 1',
    execute: function(x, y) {
        return x ^ y;
    }
});

CM.Invertor = new Class({
    Implements: [CM.Gate],
    name: 'Inverterare',
    type: 2,
    inputCount: 1,
    reverses: true,
    symbol: '1',
    execute: function(x) {
        return !x;
    }
});

CM.Gates = [CM.XOR, CM.Invertor];