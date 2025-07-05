PACKAGE_ID := $(shell sed -n -r -e "s/\s*id\s*:\s*['\"](.+)['\"],/\1/ p" startos/manifest.ts)
INGREDIENTS := $(shell start-cli s9pk list-ingredients 2> /dev/null)

.PHONY: all clean install check-deps check-init check-ts ingredients

.DELETE_ON_ERROR:

all: ${PACKAGE_ID}.s9pk
	@echo " Done!"
	@echo " Filesize:$(shell du -h $(PACKAGE_ID).s9pk) is ready"

check-deps:
	@if ! command -v start-cli > /dev/null; then \
		echo "Error: start-cli not found. Please install it first."; \
		exit 1; \
	fi
	@if ! command -v npm > /dev/null; then \
		echo "Error: npm (Node Package Manager) not found. Please install Node.js and npm."; \
		exit 1; \
	fi

check-init:
	@if [ ! -f ~/.startos/developer.key.pem ]; then \
		start-cli init; \
	fi

check-ts: node_modules
	@npm run check

ingredients: $(INGREDIENTS)
	@echo "Re-evaluating ingredients..."

${PACKAGE_ID}.s9pk: $(INGREDIENTS) | check-deps check-init
	@$(MAKE) --no-print-directory ingredients
	start-cli s9pk pack

javascript/index.js: $(shell find startos -name "*.ts") tsconfig.json node_modules package.json check-ts
	npm run build
	$(eval INGREDIENTS := $(shell start-cli s9pk list-ingredients))

assets:
	mkdir -p assets

node_modules: package-lock.json
	npm ci

package-lock.json: package.json
	npm i

clean:
	rm -rf ${PACKAGE_ID}.s9pk
	rm -rf javascript
	rm -rf node_modules

install: | check-deps check-init
	@if [ ! -f ~/.startos/config.yaml ]; then echo "You must define \"host: http://server-name.local\" in ~/.startos/config.yaml config file first."; exit 1; fi
	@echo -e "\nInstalling to $$(grep -v '^#' ~/.startos/config.yaml | cut -d'/' -f3) ...\n"
	@[ -f $(PACKAGE_ID).s9pk ] || ( $(MAKE) && echo -e "\nInstalling to $$(grep -v '^#' ~/.startos/config.yaml | cut -d'/' -f3) ...\n" )
	@start-cli package install -s $(PACKAGE_ID).s9pk
