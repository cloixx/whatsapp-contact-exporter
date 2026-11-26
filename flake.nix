{
  description = "WhatsApp Contact Exporter for NixOS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
          };
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            chromium
            git
          ];

          shellHook = ''
            export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
            export PUPPETEER_EXECUTABLE_PATH="${pkgs.chromium}/bin/chromium"
            export PROJECT_ROOT="$(pwd)"
            echo "=========================================================="
            echo " WhatsApp Contact Exporter environment ready!"
            echo " Node.js: $(node --version)"
            echo " npm:     $(npm --version)"
            echo " Chromium: ${pkgs.chromium}/bin/chromium"
            echo "=========================================================="
          '';
        };
      });
}
