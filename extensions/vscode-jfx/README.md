# JFX - FlexJson Language Support for VS Code

Syntax highlighting and language support for FlexJson (`.jfx`) files in Visual Studio Code.

## Features

- **Syntax highlighting** for `.jfx` files
- **Comment support** - both `//` line comments and `/* */` block comments
- **Flexible string syntax** - double quotes, single quotes, and unquoted strings
- **Auto-closing pairs** for brackets and quotes
- **Code folding** support

## What is FlexJson?

FlexJson is JSON with comments and flexible syntax. It's designed for configuration files where you want:

- Comments to document your config
- Less strict quoting requirements
- Full JSON compatibility when needed

### Example `.jfx` file

```jfx
/* Application Configuration
** Version 1.0
*/
{
  // Database settings
  database: {
    host: localhost,
    port: 5432,
    name: "my-app-db"
  },
  
  // Feature flags
  features: {
    'dark-mode': true,
    beta: false
  },
  
  /* Logging configuration
     Levels: debug, info, warn, error */
  logLevel: info
}
```

## Installation

### From VSIX file

1. Download the `.vsix` file from releases
2. In VS Code, open Command Palette (`Ctrl+Shift+P`)
3. Run "Extensions: Install from VSIX..."
4. Select the downloaded file

### From source

```bash
cd extensions/vscode-jfx
npm install
npm run package
```

Then install the generated `.vsix` file.

## Usage

Simply create or open a file with the `.jfx` extension. The syntax highlighting will be applied automatically.

## Related

- [flex-json](https://www.npmjs.com/package/flex-json) - The FlexJson parsing library for Node.js
- [FlexJson GitHub](https://github.com/tedtyree/FlexJson) - Source repository

## License

MIT
