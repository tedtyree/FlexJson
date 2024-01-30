const FlexJson = require("./FlexJsonClass.js");
// Test case 1: Creating a new FlexJson object
const flexJson1 = new FlexJson();
console.log(flexJson1.jsonString); // Output: ""

// Test case 2: Creating a new FlexJson object with initial JSON
const initialJSON = '{"name": "John", "age": 30}';
const flexJson2 = new FlexJson(initialJSON);
console.log(flexJson2.jsonString); // Output: {"name": "John", "age": 30}

// Test case 3: Setting and getting the value of a FlexJson object
flexJson2.thisValue = "Hello";
console.log(flexJson2.thisValue); // Output: Hello

// Test case 4: Getting the length of a FlexJson object
console.log(flexJson2.length); // Output: 1

// Test case 5: Accessing a value using dot notation
console.log(flexJson2.item("name").thisValue); // Output: John

// Test case 6: Accessing a value using index
console.log(flexJson2.item(0).thisValue); // Output: Hello

// Test case 7: Converting a FlexJson object to an array
flexJson2.ConvertToArray();
console.log(flexJson2.jsonType); // Output: array

// Test case 8: Accessing a value in the converted array
console.log(flexJson2.item(0).thisValue); // Output: Hello

// Test case 9: Invalid JSON string
const invalidJSON = '{"name": "John, "age": 30}';
const flexJson3 = new FlexJson(invalidJSON);
console.log(flexJson3.jsonString); // Output: ""
console.log(flexJson3.Status); // Output: -1 (indicating an error)

// Test case 10: Accessing a non-existent value
console.log(flexJson2.item("nonexistent").thisValue); // Output: null
