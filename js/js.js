var Overlay = {
	
	initialize: function (xml) {
		
		this.build(xml);
		this.addEvents();
	},

	build: function (xml) {
		var html = '';
		var body = $('body');
		this.closeImg = $('<img />', { 
		  	src: './images/close-button.png',
		  	alt: 'Close',
		  	width: '15'
		});
		var content = document.createElement('div');
		$(content).addClass('overlay-content');
		content.innerText = xml;

		body.addClass('shadow');
		this.overlay = document.createElement('div');
		$(this.overlay).addClass('overlay animate');

		
		$(this.overlay).append(this.closeImg);
		$(this.overlay).append(content);
		body.append($(this.overlay));

	},

	addEvents: function () {
		var self = this;
		this.closeImg.click (function() {
			$(self.overlay).remove();
			$('body').removeClass('shadow');
		});
	},

}

var Tree = {

	initialize: function (selector, pathList, fileList) {
		html_ = [];
		tree_ = {};
		this.$el = $(selector);
	
		this.render(this.buildFromPathList(pathList));

		this.$el.html(html_.join('')).tree({
		    expanded: 'li:first'
		});

		var fileNodes = this.$el.get(0).querySelectorAll("[data-type='file']");
		for (var i = 0, fileNode; fileNode = fileNodes[i]; ++i) {
		    fileNode.dataset['index'] = i;
		}

		this.addEvents(fileList);
	},

	addEvents: function (fileList) {
		var target;
		var file;

		this.$el.click(function (event) {

			target = event.target;

			if (target.nodeName === 'A' && target.dataset['type'] === 'file') {
				file = fileList[target.dataset['index']];
				Overlay.initialize(file);
			}
		});
	},

	buildFromPathList: function (paths) {

      	for (var i = 0, path; path = paths[i]; ++i) {
	        var pathParts = path.split('/');
	        var subObj = tree_;
	        
	        for (var j = 0, folderName; folderName = pathParts[j]; ++j) {
	          	if (!subObj[folderName]) {
	            	subObj[folderName] = j < pathParts.length - 1 ? {} : null;
	          	}
	          	subObj = subObj[folderName];
	        }
	    }
	    return tree_;
    },

    render: function(object) {
      	if (object) {
	        for (var folder in object) {
	          	if (!object[folder]) {
	            	html_.push('<li><a href="#" data-type="file">', folder, '</a></li>');
	          	} else {
		            html_.push('<li><a href="#">', folder, '</a>');
		            html_.push('<ul>');
		            this.render(object[folder]);
		            html_.push('</ul>');
		         }
	        }
      	}
    }
}

var Converter = {
	
	initialize: function () {

		this.fileInput = document.getElementById('file-input');
		this.outeputPlaceholder = document.getElementById('obj-output');
		this.addEvents();
	},
	reset: function () {
		this.i18nObject = {};
		this.pathList = [];
		this.files = [];
		this.fileContentsList = [];
	},
	addEvents: function () {
		var self = this;

		this.fileInput.addEventListener('change', function (e) {
			self.reset();	
			self.openFolder(e.target);
		});
		var clipboard = new Clipboard('.btn');

	},

	openFolder: function (input) {
		this.files = input.files;
		var file;
		var i = 0;

		if (!this.files.length) {
			return;
		}
		for (i = 0; i < this.files.length; i++) {

			file = this.files[i];
			this.getLan(file, i);
		};
		Tree.initialize('#folder-struct', this.pathList, this.fileContentsList);
		$('#files').addClass('full');

	},

	readXMLFile: function (file, lan, index) {

		var reader = new FileReader();
        var self = this;

        reader.onload = function (event) {
          	self.XMLText = reader.result;
          	self.fileContentsList.push(self.XMLText);

          	self.cleanXMLText();
          	self.createI18nObject(lan);
	        
	        if (index == self.files.length - 1) {
				self.buildHTMLOutput();		
				console.log(self.i18nObject)
			}

        };

        reader.readAsText(file);

	},

	getLan: function (file, index) {
		var filePath = file.webkitRelativePath;
		var regEx = /\/(.*?)\//;
		var matches = regEx.exec(filePath);

		if (!matches || !matches.length) {
			regEx = /(.*?)\//;
			matches = regEx.exec(filePath);
		}
		if (filePath.indexOf('strings.xml') === -1 || !matches || !matches.length) {
			
			alert('You did not choose the folder "i18n" or something is not correct.');
			return;
		}
		this.pathList.push(filePath);
		this.readXMLFile(file, matches[1], index);
	},

	cleanXMLText: function () {
		
		this.XMLText = this.XMLText.replace(/<!--[\s\S]*?-->/g, ''); //remove comments
		this.XMLText = this.XMLText.replace(/<\?xml[\s\S]*?\?>/g, ''); //remove xml tag
		this.XMLText = this.XMLText.replace(/<resources>/, '');
		this.XMLText = this.XMLText.replace(/<\/resources>/, '');
		this.XMLText = this.XMLText.replace(/^\s*[\r\n]/gm, ''); //remove empty lines

	}, 

	createI18nObject: function (lan) {
		this.i18nObject[lan] = {};

		var valueRegEx = /<string\b[^>]*>([\s\S]*?)<\/string>/gm;
		var keyRegEx = / name="([^"]*)"/;
		var objectValueMatches;
		var objectKeyMatches;

		while (objectValueMatches = valueRegEx.exec(this.XMLText)) {

			objectKeyMatches = keyRegEx.exec(objectValueMatches[0]);
			this.i18nObject[lan][objectKeyMatches[1]] = objectValueMatches[1];
		}
	},
	
	buildHTMLOutput: function () {
		var html = '{' + '\n';

		for (var key in this.i18nObject) {
			
			html += key + ': {' + '\n';

			for (var string in this.i18nObject[key]) {
				html += string + ':' + '\"' + this.i18nObject[key][string] + '\",\n';
			}
			
			html += '},' + '\n';
		}
		html += '}';

		this.outeputPlaceholder.innerText = html;

	}
}


document.addEventListener("DOMContentLoaded", function(event) {
    Converter.initialize();
 });