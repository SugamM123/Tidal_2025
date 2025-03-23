{
  description = "Minimal ML Development Environment";

  nixConfig = {
    extra-substituters = [
      "https://cuda-maintainers.cachix.org"
      "https://nix-community.cachix.org"
    ];
    extra-trusted-public-keys = [
      "cuda-maintainers.cachix.org-1:0dq3bujKpuEPMCX6U4WylrUDZ9JyUG0VpVZa7CNfq5E="
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
    ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            cudaSupport = true;
          };
        };

        pythonPackages = ps: with ps; [
          flask
          manim
        ];

        # Create an FHS environment
        fhsEnv = pkgs.buildFHSUserEnv {
          name = "ml-fhs-env";
          targetPkgs = pkgs: with pkgs; [

            
            # Python with selected packages
            (python311.withPackages pythonPackages)
            
            # Node.js and npm for frontend
            nodejs_20
            nodePackages.npm
          ];
          profile = ''
            zsh
          '';
        };
      in
      {
        # Provide both the original shell and the FHS environment
        devShells = {
          default = fhsEnv.env;  # Use FHS as default
        };
      }
    );
}
