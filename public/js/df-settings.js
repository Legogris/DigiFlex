if(CM === undefined) { var CM = {}; }

CM.Settings = {
	BackgroundColor: '#000',
	ViewWidth: 1000,
	ViewHeight: 800,
	VariableCount: 4
};


if(typeof module != 'undefined') {
    module.exports = CM.Settings;
}