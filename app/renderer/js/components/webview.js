"use strict";

const DomainUtil = require(__dirname + '/../utils/domain-util.js');
const {linkIsInternal, skipImages} = require(__dirname + '/../../../main/link-helper');

const BaseComponent = require(__dirname + '/../components/base.js');

class WebView extends BaseComponent {
	constructor(params) {
		super();
	
        const {$root, url, index, name, nodeIntegration} = params;
        this.$root = $root;
        this.index = index;
        this.name = name;
        this.url = url;
        this.nodeIntegration = nodeIntegration;

        this.zoomFactor = 1;
        this.loading = true;
	}

	template() {
		return `<webview
                    id="webview-${this.index}"
                    class="disabled"
                    src="${this.url}"
                    ${this.nodeIntegration ? 'nodeIntegration' : ''}
                    disablewebsecurity
                    preload="js/preload.js"
                    webpreferences="allowRunningInsecureContent, javascript=yes">
                </webview>`;
    }

	init() {
		this.$el = this.generateNodeFromTemplate(this.template());
		this.$root.appendChild(this.$el);

		this.registerListeners();
	}

	registerListeners() {
		this.$el.addEventListener('new-window', event => {
			const {url} = event;
			const domainPrefix = this.domainUtil.getDomain(this.index).url;

			if (linkIsInternal(domainPrefix, url) && url.match(skipImages) === null) {
				event.preventDefault();
				this.$el.loadURL(url);
			} else {
                event.preventDefault();
			    shell.openExternal(url);
            }
		});

		this.$el.addEventListener('dom-ready', this.show.bind(this));
	}

    getBadgeCount() {
        const title = this.$el.getTitle();
		let messageCountInTitle = (/\(([0-9]+)\)/).exec(title);
		return messageCountInTitle ? Number(messageCountInTitle[1]) : 0;
    }

    show() {
        this.$el.classList.remove('disabled');
        this.$el.focus();
        this.loading = false;
    }

    hide() {
        this.$el.classList.add('disabled');
    }

    load() {
		if (this.$el) {
			// this.updateBadge(index);
			this.show();
		} else {
            this.init();
		}
    }
}

module.exports = WebView;