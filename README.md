# flex-json

Flex-json is an extended version of json that allows for comments and JS like formatting that is human readable and simplified. Also, edit Json files that have specific spacing and comments without losing the spacing and comments!.

## Highlights

- **Comment aware:** Parses `//` and `/* */` comments so you can document configs without breaking JSON.
- **Format preserving:** Keeps whitespace, indentation, and ordering intact when you round-trip files.
- **Editor-friendly API:** Navigate with `.i()`, `.item()`, `.forEach()`, `getStr/getNum/getBool`, and more.
- **File utilities:** Read/write straight from `.json` or `.jfx` files with `DeserializeFlexFile` and `WriteToFile`.
- **Strict or flex modes:** Opt into vanilla JSON parsing when you need it, or turn on the relaxed syntax.

## Maintainers

| Maintainer      | GitHub                                      | LinkedIn                                                 |
| --------------- | ------------------------------------------- | -------------------------------------------------------- |
| Ted Tyree       | [GitHub](https://github.com/tedtyree)       | [LinkedIn](https://www.linkedin.com/in/tedtyree/)        |
| Michael Njuguna | [GitHub](https://github.com/michaelnjuguna) | [LinkedIn](https://www.linkedin.com/in/michael-njuguna/) |

## Table of Contents

- [Why flex-json](#why-flex-json)
- [How the library works](#how-the-library-works)
- [Install](#install)
- [Usage](#usage)
- [Error Handling](#error-handling)
- [JFX File Type](#jfx-file-type)
- [Editor Support](#editor-support)

## Why flex-json

It's Json with comments! Javascript style (and Python style) Json format. FlexJson was written to make JSON config files easy to manage and allow for comments. The library also makes it super easy to read a json file (often a config file), modify a single value, and save the file back to the file system without losing the comments or messing up the formatting.

- Easy config file formatting
- Includes comments in both /\*\*/ and // notation
- Simple to edit Json files
- Allows for other JavaScript like features such as using either single quotes or double quotes.
- Can also be used within Node.js apps for other uses such as reading/writing JSON to/from database records and parsing loosely formatted Json in web page content.

## How the library works

### Flex-json syntax

BTW flex-json as a standard of syntax is not really all that new - it is very much in existence within JavaScript and other syntax standards. Here we just make it available in a library and to facilitate config file parsing and editing.

### Strict Mode

When in strict mode, the flex-json library reads JSON files in standard JSON format. Comments are not valid and double quotes are required around strings.

Note: If the library is flagged to preserve spacing, Json that has been read in from a file will be written with the same formatting. In other words, the carriage returns and white space are captured during the parsing process and used to re-format the output during the write process.

### Flex Mode

When in flex mode, the flex-json library has the following features:

- Like JavaScript, comments can be surrounded by /_(start of comment) and_/ (end of comment)

- Like JavaScript, when a "//" is encountered, the remainder of the line is considered to be a comment

- Strings do not require quotes unless they contain special characters

- Strings can be quoted using double quotes or single quotes

When in flex mode, all of the following examples of Json are valid:

**example 1:**

```javascript
{apple: red, banana: yellow, 'sky': 'blue'}
```

**example 2:**

```javascript
{"apple": "red"
 ,'banana': 'yellow'
 // ,'sky': 'blue'  - this line is commented out
}
```

**example 3:**

```javascript
[
  "one, is first",
  "two, is next",
  /* comment out remainder of array
  ,"three, is third"
  ,'four', is last"
  */
];
```

**Note** that {number:"2"} is not the same as {number:2} because flex-json will see that the 2 without quotes is a valid number and load it as a numeric.

## Install

```bash
# NPM
npm install flex-json

#PNPM
pnpm install flex-json

# Yarn
Yarn install flex-json

```

## Usage

```javascript
const FlexJson = require("flex-json");

// Create a FlexJson object
const myJson = new FlexJson('{"key": "value"}', true);

// Access properties
console.log(myJson.jsonString); // Get JSON string representation

// Modify properties
myJson.keepSpacing = true; // Preserve spacing during deserialization

// Check status and type
console.log(myJson.Status); // Get status
console.log(myJson.jsonType); // Get JSON type

// Manipulate JSON object
myJson.i("key").thisValue = "new value"; // Set a new value for a key

// Convert JSON object to array
myJson.ConvertToArray();

// Access array elements
console.log(myJson.item(0).thisValue); // Access first element in the array

// Use new methods
myJson.forEach((item) => {
  console.log(item.jsonString); // Iterate through each item and log JSON string
});

myJson.add("new item", "newKey"); // Add a new item to the JSON object

console.log(myJson.indexOfKey("newKey")); // Get the index of a key in the JSON object

console.log(myJson.contains("key")); // Check if a key exists in the JSON object

console.log(myJson.getStr("key", "default")); // Get string value by key with a default value

console.log(myJson.getNum("count", 0)); // Get numeric value by key with a default value

console.log(myJson.getBool("flag", false)); // Get boolean value by key with a default value
```

Serialization and Deserialization examples

```javascript
const FlexJson = require("flex-json");

const fj = new FlexJson();
fj.DeserializeFlex("{ name: John, age: 30 }");

// jsonString — preserves flex formatting (comments, whitespace, original style)
// Use this when writing back to a .jfx config file or keeping round-trip fidelity
console.log(fj.jsonString); // '{ name: John, age: 30 }'

// Stringify() — always returns compact standard JSON, strips all flex metadata
// Use this for API responses, JSON.parse(), or any standard JSON consumer
console.log(fj.Stringify()); // '{"name":"John","age":30}'

// toNative() — converts to a plain JS object/array/primitive
// Useful for passing to other libraries or further JS manipulation
const native = fj.toNative();
console.log(native); // { name: 'John', age: 30 }
```

Config file example (this is the best part!)

First create a json config file for example a text file c:/temp/my-config.json containing the following text…

```javascript
/* my-config
** this is an example of parsing
** and updating a json config file
*/
{
ParameterA: 'Apple',
ParameterB:'Banana'
}
```

In your node.js app run these commands…

```javascript
// setup parameters
let defaultCounter = 0;
let myConfigPath = "c:/temp/my-config.json";

// read json config file
let myConfig = new FlexJson();
myConfig.DeserializeFlexFile(myConfigPath);

// read CounterA and increment it by 1
// use default value to create CounterA if it does not exist
let counter = myConfig.getNum("CounterA", defaultCounter);
counter = counter + 1;
myConfig.add(counter, "CounterA");

// write config file back to file system
myConfig.WriteToFile(myConfigPath);
```

The first time this is run the output my-config.json will have a new parameter…
CounterA:1

And each new time this is run the counter will increase…
CounterA:2

## Error Handling

By default, FlexJson throws a `FlexJsonError` when parsing errors occur. This makes it easy to catch and handle errors using standard try/catch:

```javascript
const FlexJson = require("flex-json");

try {
  const fj = new FlexJson();
  fj.DeserializeFlex("{invalid json!!!}");
} catch (err) {
  console.log(err.name); // "FlexJsonError"
  console.log(err.status); // -159 (error code)
  console.log(err.message); // "Invalid character..."
}
```

### Silent Mode

If you prefer the legacy behavior where errors don't throw (useful for validation scenarios), set `throwOnError` to `false`:

```javascript
const fj = new FlexJson();
fj.throwOnError = false; // Disable throwing

fj.DeserializeFlex("{invalid json}");

if (fj.Status !== 0) {
  console.log("Parse failed:", fj.statusMsg);
  console.log("Error code:", fj.Status);
}
```

### Error Properties

| Property       | Description                                            |
| -------------- | ------------------------------------------------------ |
| `Status`       | Error code (0 = success, negative = error)             |
| `statusMsg`    | Human-readable error message                           |
| `throwOnError` | `true` (default) = throw errors, `false` = silent mode |

## JFX File Type

FlexJson files can use the `.jfx` file extension to distinguish them from standard JSON files. This allows editors to provide proper syntax highlighting for FlexJson's extended features.

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

  logLevel: info  // unquoted string value
}
```

### Reading `.jfx` files

```javascript
const FlexJson = require("flex-json");

const config = new FlexJson();
config.DeserializeFlexFile("config.jfx");

console.log(config.getStr("database.host")); // "localhost"
```

## Editor Support

The FlexJson library parses `.jfx` files at runtime, but your code editor needs a separate extension for syntax highlighting. Editor extensions are **not** installed automatically with `npm install`.

### VS Code

Install the **JFX - FlexJson Language Support** extension:

**Option 1: From VSIX (manual install)**

1. Download the `.vsix` file from [releases](https://github.com/tedtyree/FlexJson/releases)
2. In VS Code, open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run `Extensions: Install from VSIX...`
4. Select the downloaded `.vsix` file

**Option 2: Build from source**

```bash
cd extensions/vscode-jfx
npm install
npm run package
# Then install the generated .vsix file as above
```

The extension provides:

- Syntax highlighting for `.jfx` files
- Comment support (`//` and `/* */`)
- Bracket matching and auto-closing
- Code folding

### Neovim (Tree-sitter)

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

### Other Editors

The Tree-sitter grammar in `extensions/tree-sitter-jfx/` can be used with any editor that supports Tree-sitter (Emacs, Helix, Zed, etc.). See your editor's documentation for setup instructions.

### Contributing

1. Fork this repository.
2. Create new branch with feature name.
3. Create your feature.
4. Commit and set commit message with feature name.
5. Push your code to your fork repository.
6. Create pull request.

### Backlog

- Add support for """ and ''' multi-line quotes
- Publish as a VS Code extension
- Publish to Open VSX

### Support

If you like this project, you can support us by starring ⭐ this repository or donating to [un0.org](https://un0.org/).

### Acknowledgements

Special thanks to [un0.org](https://un0.org/) and [eBiashara Rahisi Ltd](https://ebiashararahisi.com/) for their work in Machakos, Kenya.

### License

[MIT](LICENSE.txt)
