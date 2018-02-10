# [EditorConfig][] for [Visual Studio Code][]
[![Travis Build Status][travis-img]][travis] [![Gitter][chat-img]][chat]

[travis]: https://travis-ci.org/editorconfig/editorconfig-vscode
[travis-img]: https://travis-ci.org/editorconfig/editorconfig-vscode.svg?branch=master
[chat-img]: https://img.shields.io/badge/Gitter-Join_the_EditorConfig_VSCode_chat-brightgreen.svg
[chat]: https://gitter.im/editorconfig/editorconfig-vscode

This plugin [attempts](#known-issues) to override user/workspace settings with settings found in `.editorconfig` files. No additional or vscode-specific files are required. As with any EditorConfig plugin, if `root=true` is not specified, EditorConfig [will continue to look](http://editorconfig.org/#file-location) for an `.editorconfig` file outside of the project.

### This repository is specific to the [EditorConfig Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig). Internally, it uses the [`editorconfig` npm package](https://www.npmjs.com/package/editorconfig), which is one of a few [EditorConfig](http://editorconfig.org) cores available.

See also:
- [Visual Studio Code](https://code.visualstudio.com/)
- [EditorConfig Site](http://editorconfig.org)
- [EditorConfig Issue Tracker](https://github.com/editorconfig/editorconfig/issues)
- [EditorConfig Wiki](https://github.com/editorconfig/editorconfig/wiki)


Feel free to submit any issues you may have via the [issue tracker](https://github.com/editorconfig/editorconfig-vscode/issues).

## Installation

```
ext install EditorConfig
```

## Supported Properties

* `indent_style`
* `indent_size`
* `tab_width`
* `end_of_line`
* `insert_final_newline`
* `trim_trailing_whitespace`

## On the backlog

* `charset`

## Known Issues

* [`trim_trailing_whitespace = false` is not applied when user/workspace setting of `files.trimTrailingWhitespace` is set to `true`.](https://github.com/editorconfig/editorconfig-vscode/issues/153) 

[Visual Studio Code]: https://code.visualstudio.com/
[EditorConfig]: http://editorconfig.org/
