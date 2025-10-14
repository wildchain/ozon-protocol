# Makefile for ozon-cli
# Cross-platform builds and release packaging

# Variables
BINARY_NAME := ozon-cli
VERSION := $(shell grep '^version' Cargo.toml | head -1 | cut -d '"' -f2)
RELEASE_DIR := release-artifacts

# Targets for compilation
TARGETS := aarch64-apple-darwin x86_64-unknown-linux-gnu

.PHONY: help build-mac build-linux build-all release clean

help:
	@echo "Available targets:"
	@echo "  build-mac      - Build for macOS (native)"
	@echo "  build-linux    - Build for Linux x86_64 (via zigbuild)"
	@echo "  build-all      - Build for all platforms"
	@echo "  release        - Create GitHub release tarballs"
	@echo "  clean          - Clean build artifacts"

# Build for macOS (native)
build-mac:
	@echo "Building for macOS (aarch64-apple-darwin)..."
	cargo build --release --target aarch64-apple-darwin

# Build for Linux using cargo-zigbuild
build-linux:
	@echo "Building for Linux (x86_64-unknown-linux-gnu)..."
	cargo zigbuild --release --target x86_64-unknown-linux-gnu

# Build for all platforms
build-all: build-mac build-linux
	@echo "✅ All builds complete!"

# Create release tarballs
release: build-all
	@echo "📦 Creating release artifacts..."
	@mkdir -p $(RELEASE_DIR)
	
	# macOS release
	@echo "Packaging macOS release..."
	@mkdir -p $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-macos-aarch64
	@cp target/aarch64-apple-darwin/release/$(BINARY_NAME) $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-macos-aarch64/
	@if [ -f README.md ]; then cp README.md $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-macos-aarch64/; fi
	@if [ -f LICENSE ]; then cp LICENSE $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-macos-aarch64/; fi
	@cd $(RELEASE_DIR) && tar -czf $(BINARY_NAME)-v$(VERSION)-macos-aarch64.tar.gz $(BINARY_NAME)-v$(VERSION)-macos-aarch64
	@rm -rf $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-macos-aarch64
	
	# Linux release
	@echo "Packaging Linux release..."
	@mkdir -p $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-linux-x86_64
	@cp target/x86_64-unknown-linux-gnu/release/$(BINARY_NAME) $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-linux-x86_64/
	@if [ -f README.md ]; then cp README.md $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-linux-x86_64/; fi
	@if [ -f LICENSE ]; then cp LICENSE $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-linux-x86_64/; fi
	@cd $(RELEASE_DIR) && tar -czf $(BINARY_NAME)-v$(VERSION)-linux-x86_64.tar.gz $(BINARY_NAME)-v$(VERSION)-linux-x86_64
	@rm -rf $(RELEASE_DIR)/$(BINARY_NAME)-v$(VERSION)-linux-x86_64
	
	@echo "✅ Release artifacts created in $(RELEASE_DIR)/"
	@echo ""
	@echo "📋 Files ready for GitHub release:"
	@ls -lh $(RELEASE_DIR)/*.tar.gz

# Verify binary architectures
verify:
	@echo "Verifying binary architectures..."
	@echo "\n🍎 macOS binary:"
	@file target/aarch64-apple-darwin/release/$(BINARY_NAME) || echo "macOS binary not found"
	@echo "\n🐧 Linux binary:"
	@file target/x86_64-unknown-linux-gnu/release/$(BINARY_NAME) || echo "Linux binary not found"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	cargo clean
	rm -rf $(RELEASE_DIR)
	@echo "✅ Clean complete!"