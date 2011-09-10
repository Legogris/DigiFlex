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
      Variables: {},
			Gates: {},
			GateCount: 0,
			Values: { '0': 0, '1': 1 }
    },
    DebugA: null,
    DebugB: null,

    Init: Init,
    Execute: function() {
      CM.State.Values =  { '0': 0, '1': 1 };
      var stillVars = true;
      while(stillVars) {
        stillVars = false;
        for(var key in CM.State.Variables) {
          if(CM.State.Values[key] === undefined) {
            stillVars = true;
            var val = CM.State.Variables[key];
            if(CM.State.Values[val] !== undefined) {
              CM.State.Values[key] = CM.State.Values[val];
            }
          }
        }
      }
      var stillGates = true;
      while(stillGates) {
        stillGates = false;
        for(var id in CM.State.Gates) {
          if(CM.State.Values[id] === undefined) {
            stillGates = true;
            var gate = CM.State.Gates[id];
            var allDefined = true;
            for(var i = 0; i < gate.inputCount; i++) {
              var val = gate.inElements[i].value;
              if(CM.State.Values[val] === undefined) {
                allDefined = false;
              }
              gate.inValues[i] = CM.State.Values[val];
            }
            if(allDefined) {
              var result = gate.execute();
              CM.State.Values[gate.id] = result;
              $('output'+gate.id).setStyle('background-color', result ? 'red' : 'blue');
            }
          }
        }
      }
    }
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
			for(var i = 0; i < CM.Settings.VariableCount; i++) {
				var row = new Element('tr').inject($('varTable'));
				var nameCell = new Element('td');
				var valueCell = new Element('td');
				var nameBox = new Element('input', {id: 'varTB' + i, type: 'text', placeHolder: 'Variabelnamn'});
				nameBox.index = i;
				nameBox.oldName = '';
				nameBox.addEvent('change', function(e) {
				  CM.State.Variables[this.value] = $('varSel'+this.index).value;
				  delete CM.State.Variables[this.oldName];
				  CM.UIManager.RenameVariable(this.oldName, this.value);
				  this.oldName = this.value;
				});
				var valueSelect = new Element('select', {id: 'varSel' + i}).adopt(new Element('option', {value: 0, text: '0'}), new Element('option', {value: 1, text: '1'}));
        valueSelect.index = i;
        valueSelect.addEvent('change', function(e) {
          CM.State.Variables[$('varTB' + this.index).value] = this.value;
        });
				nameCell.adopt(nameBox);
				valueCell.adopt(valueSelect);
				row.adopt([nameCell, valueCell]);
			}
			$('executeButton').addEvent('click', function(e) {
			  CM.Execute();
			});
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
		RenameVariable: function(oldName, newName) {
		  $$('select').each(function(select) {
		    if(typeof oldName !== undefined && oldName != '') {
  		    var options = select.getElements('option');
  		    for(var i in options) {
  		      var o = options[i];
  		      if(o.value == oldName) {
  		        if(newName == '') {
  		          o.dispose();
  		        }
  		        o.value = o.text = newName;
  		        return;
  		      }
  		    }
  	    }
		    //If we get here, there is no existing option with the old name, so make a new one!
		    select.adopt(new Element('option', {text: newName}));
		  });
		},
		PlaceGate: function(gate) {
			$('dfArea').adopt(gate.element);
			for(var id in CM.State.Gates) {
				var g = CM.State.Gates[id];
				if(g !== gate) {
  				gate.inElements.each(function(el) {
  					var o = new Element('option', {text: g.id, value: g.id}); //Add other gates output to new gates input
  					el.adopt(o);
  				});
				}
				g.inElements.each(function(el) {
					var o = new Element('option', {text: gate.id, value: gate.id}); //Add new gate as input for every gate
					el.adopt(o);  				  
				});
			}
			for(var key in CM.State.Variables) {
				gate.inElements.each(function(el) {
					var o = new Element('option', {text: key, value: key}); //Add variables to new gates input
					el.adopt(o);
				});
			}
		}
  };
}();

window.addEvent('domready', CM.Init);