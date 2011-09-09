var CM = function() {
  var Init = function() {
    CM.UIManager.InitUI();
  };
  return {
    DN: {},
    Components: {},
    UIManager: {},
    Settings: {},
    Strings: {},
    KeyboardListener: {},
    State: {
			Gates: {},
			GateCount: 0
    },
    DebugA: null,
    DebugB: null,

    Init: Init
  };
} ();


CM.NetMan = function() {
  return {
  };
}();

CM.UIManager = function() {
  var loadAsset = function(url, onLoaded) {
    if(!Crafty.assets[url]) {
      Crafty.load([url], onLoaded);
    } else {
      onLoaded();
    }
  };

  return {
		Context: undefined,
    InitUI: function() {
      var keyboardListener = new Keyboard({
        active: true
      });
			CM.UIManager.Context = $('dfCanvas').getContext('2d');
      CM.UIManager.KeyboardListener = keyboardListener;
      CM.GateTypes.each(function(gt) {
        var li = new Element('li', {text: gt.prototype.name, class: 'gate'});
				var e = gt.prototype.generateElement(false);
				li.adopt(e);
        $('gateList').adopt(li);
				var drag = new Drag.Move(e, {
					snap: 0,
					droppables: [$('dfArea')],
					checkDroppables: true,
					onDrop: function(el, droppable, e) {
						if(droppable) {
							var gate = new gt('u' + CM.State.GateCount);
							CM.State.GateCount++;
							CM.State.Gates[gate.id] = gate;
							gate.place(e.client.x, e.client.y);
							CM.UIManager.DrawLines();
						}
						el.removeClass('dragging');
						el.setStyles({left: el.originalX, top: el.originalY});
					},
					onSnap: function(el) {
						el.addClass('dragging');
						el.originalX = el.getStyle('left');
						el.originalY = el.getStyle('top');
					},
				});
      });
    },
		DrawLines: function() {
			CM.UIManager.Context.beginPath();
			CM.UIManager.Context.clearRect(0, 0, CM.Settings.ViewWidth, CM.Settings.ViewHeight);
			for(var id in CM.State.Gates) {
				var gate = CM.State.Gates[id];
				gate.inElements.each(function(input) {
					if(input.value[0] == 'u' && input.value != id) {
						var tg = CM.State.Gates[input.value]; //Target gate
						CM.UIManager.Context.beginPath();
						CM.UIManager.Context.moveTo(input.getLeft(), input.getTop());
						CM.UIManager.Context.lineTo(tg.element.getLeft()+60, tg.element.getTop()+30);
						CM.UIManager.Context.strokeStyle = tg.lineColor;
						CM.UIManager.Context.stroke();
					}
				});
			}
		},
		PlaceGate: function(gate) {
			$('dfArea').adopt(gate.element);
			for(var id in CM.State.Gates) {
				var g = CM.State.Gates[id];
				gate.inElements.each(function(el) {
					var o = new Element('option', {text: g.id}); //Add other gates output to new gates input
					el.adopt(o);
				});
				if(g != gate) {
					g.inElements.each(function(el) {
						var o = new Element('option', {text: gate.id}); //Add new gates output to other gates input
						el.adopt(o);
					});
				}
			}
		}
  };
}();

window.addEvent('domready', CM.Init);