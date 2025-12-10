# tree-sitter-jfx

Tree-sitter grammar for FlexJson (`.jfx`) files.

## What is FlexJson?

FlexJson is JSON with comments and flexible syntax, designed for configuration files:

- **Comments** - `//` line comments and `/* */` block comments
- **Flexible strings** - double quotes, single quotes, or unquoted
- **Trailing commas** - allowed in objects and arrays
- **Full JSON compatibility** - standard JSON is valid FlexJson

## Installation

### For Neovim

Add to your Tree-sitter configuration:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.jfx = {
  install_info = {
    url = "https://github.com/tedtyree/FlexJson",
    files = {"extensions/tree-sitter-jfx/src/parser.c"},
    branch = "main",
  },
  filetype = "jfx",
}

vim.filetype.add({
  extension = {
    jfx = "jfx",
  },
})
```

Then run `:TSInstall jfx`

### For other editors

See your editor's Tree-sitter integration documentation.

## Building from source

```bash
# Install dependencies
npm install

# Generate the parser
npm run generate

# Run tests
npm test
```

## Grammar highlights

The grammar supports:

| Feature | Example |
|---------|---------|
| Double-quoted strings | `"hello world"` |
| Single-quoted strings | `'hello world'` |
| Unquoted strings | `hello` |
| Line comments | `// comment` |
| Block comments | `/* comment */` |
| Numbers | `42`, `-3.14`, `1e10` |
| Booleans | `true`, `false` |
| Null | `null` |
| Trailing commas | `{a: 1,}` |

## Example

```jfx
/* Application Config */
{
  // Server settings
  server: {
    host: localhost,
    port: 3000
  },
  
  features: {
    'dark-mode': true,
    beta: false
  }
}
```

## Related

- [flex-json](https://www.npmjs.com/package/flex-json) - FlexJson parsing library
- [vscode-jfx](../vscode-jfx) - VS Code extension

## License

MIT
