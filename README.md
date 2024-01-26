# FlexJson

## Flexible JSON manipulation library for JavaScript.

## Table of Contents

- [Install](#install)
- [Usage](#usage)

## Install

```bash
# NPM
npm install flex-json

#PNPM
pnpm isntall flex-json

# Yarn
Yarn install flex-json

```

## Usage

```javascript
const { FlexJson } = require('flex-json');

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


### Contributing

1. Fork this repository.
2. Create new branch with feature name.
3. Create your feature.
4. Commit and set commit message with feature name.
5. Push your code to your fork repository.
6. Create pull request.

### Support

If you like this project, You can support us with starring ⭐ this repository.

### License

[MIT](LICENSE.txt)

Made with 💙
