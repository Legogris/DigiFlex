CM.Gate = new Class({
	Implements: [Options],
	type: 0,
	symbol: '',
	reverses: false,
	inputCount: 1,
	x: 0,
	y: 0,
	id: undefined,
	inValues: [],
	inElements: [],
	outValue: undefined,
	element: undefined,
	lineColor: '#e22',
	options: {
		onUpdate: function(options) {
			this.setOptions(options);
		}
	},
	initialize: function(id, options) {
		var self = this;
		self.setOptions(options);
		self.id = id;
	},
	generateElement: function(withHooks) {
    var e = new Element('div', {id: 'gt'+this.name, class: 'gate', html: this.symbol});
		if(withHooks) {
			for(var i = 0; i < this.inputCount; i++) {
				var r = new Element('select', {class: 'input'}).adopt(new Element('option', {value: 0, text: '0'}), new Element('option', {value: 1, text: '1'}));
				if(this.inputCount == 1) {
					r.setStyle('top', '16px');
				} else {
					r.setStyle('top', (50/this.inputCount)*i+'px');
				}
				r.addEvent('mousedown', function(e) {e.stopPropagation();});
				r.addEvent('change', function() {CM.UIManager.DrawLines();});
				this.inElements.push(r);
				e.adopt(r);
			}
			var r = new Element('span', {id: 'output'+this.id, class: 'output', text: this.id});
			if(this.reverses) {
			  var s = new Element('span', {text: 'o', class: 'negator'});
			  e.adopt(s);
			  r.addClass('nOutput');
			}
			e.adopt(r)
		}
		return e;
	},
	place: function(x, y) {
		this.element = this.generateElement(true);
		this.element.setStyles({left: x, top: y});
		var drag = new Drag.Move(this.element, {
			container: $('dfArea'),
			onDrop: function() {
				CM.UIManager.DrawLines();
			}
		});
		CM.UIManager.PlaceGate(this);
	}
});

CM.XOR = new Class({
    Implements: [CM.Gate],
    name: 'XOR',
    type: 1,
    inputCount: 2,
    reverses: false,
    symbol: '= 1',
		lineColor: '#e2e',
    execute: function() {
        return this.inValues[0] ^ this.inValues[1];
    }
});

CM.Invertor = new Class({
    Implements: [CM.Gate],
    name: 'Inverterare',
    type: 2,
    inputCount: 1,
    reverses: true,
    symbol: '1',
    execute: function() {
        return !this.inValues[0];
    }
});

CM.AND = new Class({
    Implements: [CM.Gate],
    name: '2-ing AND',
    type: 3,
    inputCount: 2,
    reverses: false,
    symbol: '&',
		lineColor: '#22e',
    execute: function() {
        return this.inValues[0] && this.inValues[1];
    }
});

CM.OR = new Class({
    Implements: [CM.Gate],
    name: '2-ing OR',
    type: 4,
    inputCount: 2,
    reverses: false,
    symbol: '&ge; 1',
		lineColor: '#2ee',
    execute: function() {
        return this.inValues[0] || this.inValues[1];
    }
});

CM.NAND = new Class({
    Implements: [CM.AND],
    name: '2-ing NAND',
    type: 5,
    reverses: true,
		lineColor: '#22e',
    execute: function() {
        return !(this.inValues[0] && this.inValues[1]);
    }
});

CM.NAND3 = new Class({
    Implements: [CM.AND],
    name: '3-ing NAND',
    type: 6,
    inputCount: 3,
    reverses: true,
		lineColor: '#22e',
    execute: function() {
        return !(this.inValues[0] && this.inValues[1] && this.inValues[2]);
    }
});

CM.NOR = new Class({
    Implements: [CM.OR],
    name: '2-ing NOR',
    type: 7,
    reverses: true,
    execute: function() {
        return !(this.inValues[0] || this.inValues[1]);
    }
});
CM.GateTypes = [CM.XOR, CM.Invertor, CM.AND, CM.OR, CM.NAND, CM.NAND3, CM.NOR];