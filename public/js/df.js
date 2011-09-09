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
    InitUI: function() {
      var keyboardListener = new Keyboard({
        active: true
      });
      CM.UIManager.KeyboardListener = keyboardListener;
      CM.Gates.each(function(gate) {
        var li = new Element('li', {id: 'gate'+gate.prototype.name, text: gate.prototype.name, class: 'gate'});
        li.addEventListener('click', function(e) {alert(gate.prototype.name);});
        $('gateList').adopt(li);
      });
    }
  };
}();

window.addEvent('domready', CM.Init);