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
      var emptyRuns = 0;
      while(stillGates) {
        stillGates = false;
        emptyRuns++;
        for(var id in CM.State.Gates) {
          if(CM.State.Values[id] === undefined) {
            stillGates = true;
            var gate = CM.State.Gates[id];
            var allDefined = true;
            for(var i = 0; i < gate.inputCount; i++) {
              var val = gate.inElements[i].value;
              gate.inValues[i] = CM.State.Values[val];
              if(CM.State.Values[val] === undefined) {
                if (emptyRuns > 2){
                  gate.inValues[i] = 0;
                } else {
                  allDefined = false;
                }
              }
            }
            if(allDefined) {
              var result = gate.execute();
              CM.State.Values[gate.id] = result;
              $('output'+gate.id).setStyle('background-color', result ? 'red' : 'blue');
              emptyRuns = 0;
            }
          }
        }
      }
      CM.UIManager.DrawLines();
    },
    SaveFile: function() {
        var data = '## DIGIFLEX - Kopplingsboxen, Version 1\r\n';
        for(v in CM.State.Variables) {
            data += '/iv['+i+']' + v + '\r\n';
        });
        var i = 0;
        for(var key in CM.State.Gates) {
            var gate = CM.State.Gates[key];
            data += '>NUM:'+i+',TYPE:'+gate.type+',X='+gate.x+',Y='+gate.y+'\r\n';
            gate.inElements.each(function(e, i) {
                data += 'IV['+i+']'+e+'\r\n';
            });
            data += '<\r\n';
            i++;
        }
        data += '##<\r\n';
        var uriData = "data:application/octet-stream," + encodeURIComponent(content);
        var win = window.open(uriData, 'fileWindow');
    }
  };
} ();


CM.NetMan = function() {
  return {
  };
}();

CM.UIManager = function() {
  var clean = function() {
    for(var id in CM.State.Gates) {
      var gate = CM.State.Gates[id];
      gate.element.dispose();
    }
    CM.State.GateCount = 0;
    CM.State.Gates = {};
    CM.State.Variables = {};
    CM.State.Values = {'0': 0, '1': 1};
    CM.UIManager.InitVariableElements();
  };
  
  var handleFileSelect = function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    clean();
    reader.onload = function(e) {
      var result = e.target.result.split('\r\n>');
      // Input variables
      var ivRegex = /iv\[\d\]([a-zA-Z0-9]+)/g;
      var gateRegex = /NUM:(\d+),TYPE:(\d),X=(\d+),Y=(\d+)\s+((?:IV\[\d{1,2}\][^s]+?\r\n)+)/
      var inputRegex = /IV\[\d{1,2}\]([^s]+?)\r\n/g
      var i = 0;
      var match = ivRegex.exec(result[0]);
      while(match) {
        while(!$('varTB' + i)) {
          CM.UIManager.AddVariable();
        }
        $('varTB' + i).value = match[1];
        $('varTB' + i).fireEvent('change');
        match = ivRegex.exec(result[0]);
        i++;
      }

      //Initialize
      var matches = [];
      for(var i = 1; i < result.length; i++) {
        var match = gateRegex.exec(result[i]);
        if(match) {
          matches.push(match);
          var gate = new CM.GateTypes[parseInt(match[2])-1]('u'+match[1]);
          CM.State.GateCount++;
  				CM.State.Gates[gate.id] = gate;
        }
      }
      //Second loop to place and assign in variables to each gate
      matches.each(function(match, i) {
        var gate = CM.State.Gates['u'+match[1]];
        gate.place({x: parseInt(match[3])-200, y: parseInt(match[4])});
        var j = 0;
        var inMatch = inputRegex.exec(match[5]);
        while(inMatch) {
          var ie = gate.inElements[j];
          var val = inMatch[1];
          ie.set('value', val);
          inMatch = inputRegex.exec(match[5]);
          j++;
        }
      });
  		CM.UIManager.DrawLines();
    };
    reader.readAsText(file, 'utf-8');
  };

  return {
		Context: undefined,
		AddVariable: function(name) {
		  name = typeof name === undefined ? '': name;
		  var i = $$('.varRow').length;
			var row = new Element('tr', {class: 'varRow'}).inject($('varTable'));
			var nameCell = new Element('td');
			var valueCell = new Element('td');
			var nameBox = new Element('input', {id: 'varTB' + i, type: 'text', placeHolder: 'Variabelnamn', class: 'input'});
			nameBox.index = i;
			nameBox.oldName = '';
			nameBox.addEvent('change', function(e) {
			  CM.State.Variables[this.value] = $('varSel'+this.index).value;
			  delete CM.State.Variables[this.oldName];
			  CM.UIManager.RenameVariable(this.oldName, this.value);
			  this.oldName = this.value;
			});
			var valueSelect = new Element('select', {id: 'varSel' + i, class: 'input'}).adopt(new Element('option', {value: 0, text: '0'}), new Element('option', {value: 1, text: '1'}));
      valueSelect.index = i;
      valueSelect.addEvent('change', function(e) {
        CM.State.Variables[$('varTB' + this.index).value] = this.value;
        CM.Execute();
      });
			nameCell.adopt(nameBox);
			valueCell.adopt(valueSelect);
			row.adopt([nameCell, valueCell]);
		},
		InitVariableElements: function() {
		  $('varTable').empty();
			for(var i = 0; i < CM.Settings.VariableCount; i++) {
			  CM.UIManager.AddVariable();
			}
		},
    InitUI: function() {
      var keyboardListener = new Keyboard({
        active: true
      });
      $$('a.returnFalse').addEvent('click', function(e) { return false; });
      $('menuFileNew').addEvent('click', function(e) { clean(); return false; });
      $('menuFileSave').addEvent('click', function(e) { CM.SaveFile(); });
      $('menuFileOpen').addEvent('click', function(e) {$('file').click();});
      $('newVarButton').addEvent('click', function(e) {CM.UIManager.AddVariable(); });
			paper.setup($('dfCanvas'));
			CM.UIManager.Context = $('dfCanvas').getContext('2d');
      CM.UIManager.KeyboardListener = keyboardListener;
      CM.UIManager.InitVariableElements();
			$('executeButton').addEvent('click', function(e) {
			  CM.Execute();
			});
      CM.GateTypes.each(function(gt) {
        //Add dragndrop gates to the view
        var li = new Element('li', {text: gt.prototype.name, class: 'gate'});
				var e = gt.prototype.generateElement(false);
				li.adopt(e);
				li.setStyle('height', 35+gt.prototype.height+'px');
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
							gate.place(el.getPosition($('dfArea')));
							CM.UIManager.DrawLines();
						}
						el.removeClass('dragging');
						el.setPosition(el.originalPosition);
					},
					onSnap: function(el) {
					  if(!e.hasClass('dragging')) {
						  el.addClass('dragging');
						  el.originalPosition = el.getPosition();
						}
					}
				});
				//Add items to the menu
        var li = new Element('li');
        var a = new Element('a', {href: '#', text: gt.prototype.name});
        a.addEvent('click', function(event) {
          e.originalPosition = e.getPosition();
          e.setPosition({x: event.client.x - e.getCoordinates().width/2, y: event.client.y - e.getCoordinates().height/2});
          e.addClass('dragging');
          e.fireEvent('mousedown', event);
          return false;
        });
        li.adopt(a);
        $('gateMenuList').adopt(li);
      });
      $('file').addEvent('change', handleFileSelect);
    },
		DrawLines: function() {
			CM.UIManager.Context.beginPath();
			CM.UIManager.Context.clearRect(0, 0, CM.Settings.ViewWidth, CM.Settings.ViewHeight);
			paper.project.activeLayer.removeChildren();
			for(var id in CM.State.Gates) {
				var gate = CM.State.Gates[id];
				gate.inElements.each(function(input) {
					if(input.value[0] == 'u' && input.value != id) {
						var tg = CM.State.Gates[input.value]; //Target gate
						var startCords = input.getCoordinates($('dfCanvas'));
						var endCords = tg.element.getCoordinates($('dfCanvas'));
            var path = new paper.Path();  
            var start = new paper.Point(startCords.left, startCords.top+startCords.height/2);
            var end = new paper.Point(endCords.left+endCords.width+20, endCords.top+endCords.height/2);
            path.strokeColor = $('output'+tg.id).getStyle('background-color');
            path.moveTo(start);
            var next = start.add([ -30, 0 ]);
            path.lineTo(next);
            next = next.add(0,  - (start.y - end.y));
            path.lineTo(next);
            path.lineTo(end.add([30, 0]));
            path.lineTo(end);
					}
				});
        paper.view.draw();
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
				  for(var i = 0; i < el.options.length; i++) {
				    if(el.options[i].value == gate.id) {
				      return; //Do not add if gate already added (for file load when severla gates are initialized at the same time)
				    }
				  }
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