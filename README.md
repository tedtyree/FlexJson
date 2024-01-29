# flex-json

## Flexible JSON manipulation library for JavaScript.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Why flex-json](#why-flex-json)
- [How the library works](#how-the-library-works)

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
const  FlexJson  = require('flex-json');

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
myJson.i('key').thisValue = 'new value'; // Set a new value for a key

// Convert JSON object to array
myJson.ConvertToArray();

// Access array elements
console.log(myJson.item(0).thisValue); // Access first element in the array

// Use new methods
myJson.forEach(item => {
    console.log(item.jsonString); // Iterate through each item and log JSON string
});

myJson.add('new item', 'newKey'); // Add a new item to the JSON object

console.log(myJson.indexOfKey('newKey')); // Get the index of a key in the JSON object

console.log(myJson.contains('key')); // Check if a key exists in the JSON object

console.log(myJson.getStr('key', 'default')); // Get string value by key with a default value

console.log(myJson.getNum('count', 0)); // Get numeric value by key with a default value

console.log(myJson.getBool('flag', false)); // Get boolean value by key with a default value

```

Serialization and Deserialization examples

```javascript
const FlexJson = require("flex-json");

// Create an instance of FlexJson
const flexJson = new FlexJson();

// Example: Deserialize JSON
const jsonString = '{"name": "John", "age": 30, "city": "New York"}';
flexJson.Deserialize(jsonString);

// Example: Serialize to JSON
flexJson.SerializeMe();

// Access serialized JSON string
const serializedJson = flexJson.SerializeMe();
console.log(serializedJson);
```

## Why flex-json

It is simply Json with comments! FlexJson was written to make JSON config files easy to manage and allow for comments. The library also makes it super easy to read a json file (often a config file), modify a single value, and save the file back to the file system without messing up the comments.

- Easy config file formatting
- Includes comments in both /* */ and // notation
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

- Like JavaScript, comments can be surrounded by  /* (start of comment) and */ (end of comment)

- Like JavaScript, when a  "//" is encountered, the remainder of the line is considered to be a comment

- Strings do not require quotes unless they contain special characters

- Strings can be quoted using double quotes or single quotes
  
When in flex mode, all of the following examples of Json are valid:

__example 1:__

```javascript
{apple: red, banana: yellow, 'sky': 'blue'}
```

__example 2:__

```javascript
{"apple": "red"
 ,'banana': 'yellow'
 // ,'sky': 'blue'  - this line is commented out
}
```

__example 3:__

```javascript
[ "one, is first"
  ,'two, is next'
  /* comment out remainder of array
  ,"three, is third"
  ,'four', is last"
  */
]
```

__Note__ that {number:"2"} is not the same as {number:2} because flex-json will see that the 2 without quotes is a valid number and load it as a numeric.

### Contributing

1. Fork this repository.
2. Create new branch with feature name.
3. Create your feature.
4. Commit and set commit message with feature name.
5. Push your code to your fork repository.
6. Create pull request.

### Support

If you like this project, You can support us with starring ⭐ this repository or donate to [uO.heartofkenya.com](https://u0.heartofkenya.com/).

### Acknowledgements

Special thanks to [u0.heartofKenya.com](https://u0.heartofkenya.com/) and [ebiashararahisi](https://ebiashararahisi.com/) for their work in Machakos, Kenya.

### License

[MIT](LICENSE.txt)

Made with 💙