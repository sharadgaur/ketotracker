.PHONY: help install dev build preview deploy clean lint commit push release open

# ─── Config ──────────────────────────────────────────────────────────────────
APP_NAME   := ketotracker
SITE_URL   := https://sharadgaur.github.io/$(APP_NAME)
DIST_DIR   := dist
NODE_BIN   := ./node_modules/.bin

# ─── Default ─────────────────────────────────────────────────────────────────
help: ## Show this help
	@echo ""
	@echo "  🥗 $(APP_NAME) — Development & Deployment"
	@echo ""
	@echo "  Usage: make <target>"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Setup ───────────────────────────────────────────────────────────────────
install: ## Install dependencies
	npm install

node_modules: package.json
	npm install
	@touch node_modules

# ─── Development ─────────────────────────────────────────────────────────────
dev: node_modules ## Start local dev server (hot reload)
	$(NODE_BIN)/vite

preview: build ## Preview the production build locally
	$(NODE_BIN)/vite preview

# ─── Build ───────────────────────────────────────────────────────────────────
build: node_modules ## Build for production
	$(NODE_BIN)/vite build
	@echo ""
	@echo "  ✅ Built to ./$(DIST_DIR)/"
	@ls -lh $(DIST_DIR)/assets/*.js | awk '{print "     " $$5 "  " $$9}'

# ─── Deploy ──────────────────────────────────────────────────────────────────
deploy: build ## Build and deploy to GitHub Pages
	$(NODE_BIN)/gh-pages -d $(DIST_DIR)
	@echo ""
	@echo "  🚀 Deployed to $(SITE_URL)"
	@echo "     (may take 1-2 min to propagate)"

# ─── Git shortcuts ───────────────────────────────────────────────────────────
commit: ## Git add all and commit (usage: make commit m="your message")
	git add -A
	git commit -m "$(m)"

push: ## Push to origin main
	git push origin main

release: commit push deploy ## Commit, push, and deploy (usage: make release m="your message")
	@echo ""
	@echo "  🎉 Released! Live at $(SITE_URL)"

# ─── Utilities ───────────────────────────────────────────────────────────────
open: ## Open the live site in browser
	open $(SITE_URL)

open-local: dev ## Open local dev server in browser
	open http://localhost:5173/$(APP_NAME)/

clean: ## Remove build artifacts and node_modules
	rm -rf $(DIST_DIR) node_modules
	@echo "  🧹 Cleaned $(DIST_DIR)/ and node_modules/"

lint: node_modules ## Check for common issues
	@echo "  Checking build..."
	@$(NODE_BIN)/vite build 2>&1 | tail -5
	@echo ""
	@echo "  Checking dist/index.html base paths..."
	@grep -o 'src="[^"]*"' $(DIST_DIR)/index.html || true
	@echo ""
	@echo "  Checking package.json homepage..."
	@node -e "const p=require('./package.json'); console.log('  homepage:', p.homepage)"
	@echo ""
	@echo "  Checking vite base config..."
	@grep "base:" vite.config.js || true
	@echo ""
	@echo "  ✅ Lint complete"
