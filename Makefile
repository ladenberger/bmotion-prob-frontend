default: compile

NODE_VERSION=0.12.0

export NVM_BIN=$(HOME)/.nvm/versions/node/v$(NODE_VERSION)/bin
export NVM_DIR=$(HOME)/.nvm
export NVM_PATH=$(HOME)/.nvm/versions/node/v$(NODE_VERSION)/lib/node
export PATH:=$(NVM_BIN):$(PATH)

$(NVM_BIN):
	. $(NVM_DIR)/nvm.sh; nvm install $(NODE_VERSION)

node: $(NVM_BIN)

npm: node
	$(NVM_BIN)/npm install -g npm@2.7.0

bower: node
	$(NVM_BIN)/npm install -g bower

requirejs: node
	$(NVM_BIN)/npm install -g requirejs

bowerdeps: bower
	$(NVM_BIN)/bower install

dist: clean compile

compile: bowerdeps uglify

uglify: requirejs
	$(NVM_BIN)/r.js -o build.js

clean: node bower
	rm -rf app/libs/bower/
	rm -rf bower_components/
	rm -rf node_modules/
	rm -rf dist
	rm -rf tmp
	$(NVM_BIN)/npm cache clean
	$(NVM_BIN)/bower cache clean

.PHONY: node npm bower bowerdeps compile dist clean uglify