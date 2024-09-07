# semantic-release-path-filter

A plugin for semantic-release that filters commits based on file paths before passing them to other semantic-release plugins.

## Installation

```bash
npm install --save-dev @psm14/semantic-release-path-filter
```

## Usage

This plugin wraps around other semantic-release plugins and filters the commits they receive based on file paths.

```json
{
  "plugins": [
    [
      "@psm14/semantic-release-path-filter",
      {
        "path": "plugin",
        "plugin": "@semantic-release/commit-analyzer"
      }
    ],
    [
      "@psm14/semantic-release-path-filter",
      {
        "path": "plugin",
        "plugin": "@semantic-release/release-notes-generator"
      }
    ],
    [
      "@psm14/semantic-release-path-filter",
      {
        "path": "plugin",
        "plugin": "@semantic-release/git"
      }
    ],
    [
      "@psm14/semantic-release-path-filter",
      {
        "path": "plugin",
        "plugin": "@semantic-release/github"
      }
    ]
  ]
}
```

The `plugin` option may be a string or an array consisting of the name and a configuration object.
