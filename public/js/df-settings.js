if(CM === undefined) { var CM = {}; }

CM.Settings = {
	BackgroundColor: '#000',
	ViewWidth: 600,
	ViewHeight: 600
};


if(typeof module != 'undefined') {
    module.exports = CM.Settings;
}