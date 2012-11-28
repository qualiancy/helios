
TESTS = test/*.js
REPORTER = spec

#
# Tests
# 

test: clean-test build
	@mkdir ./test/js
	@cp ./build/build.js ./test/js/build.js
	@cp ./node_modules/chai/chai.js ./test/js/chai.js
	@cp ./node_modules/mocha/mocha.js ./test/js/mocha.js
	@cp ./node_modules/mocha/mocha.css ./test/js/mocha.css
	@./node_modules/.bin/serve test

#
# Components
# 

build: components lib/*
	@./node_modules/.bin/component-build --dev

components: component.json
	@./node_modules/.bin/component-install --dev

#
# Coverage
# 

lib-cov:
	@rm -rf lib-cov
	@jscoverage lib lib-cov

#
# Clean up
# 

clean: clean-components clean-test

clean-components:
	@rm -rf build
	@rm -rf components

clean-test:
	@rm -fr ./test/js

.PHONY: clean clean-components test
