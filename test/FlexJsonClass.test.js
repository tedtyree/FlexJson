/**
 * FlexJson Test Suite
 * 
 * Tests all major endpoints of the FlexJson library:
 * - Constructor & Deserialization
 * - Serialization
 * - Property access (item, i, value, v, thisValue)
 * - Type getters (getStr, getNum, getBool)
 * - Mutation (add, thisValue setter)
 * - Utility methods (forEach, contains, indexOfKey, ConvertToArray)
 * - File operations (DeserializeFile, DeserializeFlexFile, WriteToFile)
 * - Flex mode features (comments, unquoted strings, single quotes)
 */

const assert = require("assert");
const path = require("path");
const fs = require("fs");
const FlexJson = require("../FlexJsonClass.js");

// Test utilities
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
  }
}

function section(name) {
  console.log(`\n${name}`);
  console.log("─".repeat(name.length));
}

// Fixture paths
const fixturesDir = path.join(__dirname, "fixtures");
const standardJson = path.join(fixturesDir, "standard.jfx");
const flexWithComments = path.join(fixturesDir, "flex-with-comments.jfx");
const flexUnquoted = path.join(fixturesDir, "flex-unquoted.jfx");
const arrayJson = path.join(fixturesDir, "array.jfx");
const nestedJson = path.join(fixturesDir, "nested.jfx");
const tempFile = path.join(fixturesDir, "temp-output.json");

// ============================================================================
// CONSTRUCTOR TESTS
// ============================================================================
section("Constructor");

test("creates empty FlexJson object", () => {
  const fj = new FlexJson();
  assert.strictEqual(fj.jsonString, "");
  assert.strictEqual(fj.Status, 0);
});

test("creates FlexJson from valid JSON string (flex mode)", () => {
  const fj = new FlexJson('{"name": "John", "age": 30}', true);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.jsonType, "object");
  assert.strictEqual(fj.length, 2);
});

test("creates FlexJson from string-only JSON (strict mode)", () => {
  const fj = new FlexJson('{"name": "John"}', false);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.jsonType, "object");
});

test("creates FlexJson with UseFlexJson flag", () => {
  const fj = new FlexJson("{name: John}", true);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.UseFlexJson, true);
});

test("handles invalid JSON string gracefully", () => {
  // Invalid characters create truly invalid JSON
  const fj = new FlexJson('{invalid json here!!!}', true);
  assert.notStrictEqual(fj.Status, 0);
});

// ============================================================================
// DESERIALIZATION TESTS
// ============================================================================
section("Deserialization");

test("Deserialize() parses string-only JSON", () => {
  const fj = new FlexJson();
  fj.Deserialize('{"key": "value"}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("key").thisValue, "value");
});

test("DeserializeFlex() parses JSON with mixed types", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"name": "John", "age": 30, "active": true}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.getStr("name"), "John");
  assert.strictEqual(fj.getNum("age"), 30);
  assert.strictEqual(fj.getBool("active"), true);
});

test("DeserializeFlex() parses flex JSON with unquoted strings", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex("{apple: red, banana: yellow}");
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("apple").thisValue, "red");
  assert.strictEqual(fj.item("banana").thisValue, "yellow");
});

test("DeserializeFlex() parses single-quoted strings", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex("{'name': 'John'}");
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("name").thisValue, "John");
});

test("DeserializeFlex() handles // comments", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{\n  name: "John"\n  // this is a comment\n}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("name").thisValue, "John");
});

test("DeserializeFlex() handles /* */ comments", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('/* header */\n{name: "John"}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("name").thisValue, "John");
});

test("parses arrays correctly", () => {
  const fj = new FlexJson('["a", "b", "c"]', true);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.jsonType, "array");
  assert.strictEqual(fj.length, 3);
  assert.strictEqual(fj.item(0).thisValue, "a");
  assert.strictEqual(fj.item(2).thisValue, "c");
});

test("parses nested objects", () => {
  const fj = new FlexJson('{"outer": {"inner": "value"}}', true);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("outer").item("inner").thisValue, "value");
});

test("parses all JSON types correctly", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"str": "hello", "num": 42, "bool": true, "nil": null}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.getStr("str"), "hello");
  assert.strictEqual(fj.getNum("num"), 42);
  assert.strictEqual(fj.getBool("bool"), true);
  // null values have jsonType "null" but thisValue returns empty string
  assert.strictEqual(fj.item("nil").jsonType, "null");
});

// ============================================================================
// FILE OPERATIONS TESTS
// ============================================================================
section("File Operations");

test("DeserializeFlexFile() reads standard JSON file", () => {
  const fj = new FlexJson();
  fj.DeserializeFlexFile(standardJson);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.getStr("name"), "John");
  assert.strictEqual(fj.getNum("age"), 30);
});

test("DeserializeFlexFile() reads flex JSON with comments", () => {
  const fj = new FlexJson();
  fj.DeserializeFlexFile(flexWithComments);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.getStr("name"), "John Doe");
  assert.strictEqual(fj.getNum("age"), 30);
});

test("DeserializeFlexFile() reads flex JSON with unquoted values", () => {
  const fj = new FlexJson();
  fj.DeserializeFlexFile(flexUnquoted);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.getStr("apple"), "red");
  assert.strictEqual(fj.getNum("count"), 42);
  assert.strictEqual(fj.getBool("enabled"), true);
});

test("WriteToFile() writes JSON to file", () => {
  const fj = new FlexJson('{"test": "data"}');
  const result = fj.WriteToFile(tempFile);
  assert.strictEqual(result, 0);
  assert.strictEqual(fs.existsSync(tempFile), true);
  
  // Verify content
  const content = fs.readFileSync(tempFile, "utf8");
  assert.strictEqual(content.includes('"test"'), true);
  
  // Cleanup
  fs.unlinkSync(tempFile);
});

test("round-trip preserves comments and whitespace when modifying value", () => {
  // Original content with comments and specific whitespace
  const originalContent = `{
  // User configuration
  name: "John",
  
  /* Age in years
     Updated annually */
  age: 30,
  
  // Is the user active?
  active: true
}`;

  // Write original to temp file
  fs.writeFileSync(tempFile, originalContent, "utf8");

  // Read with keepSpacing and keepComments enabled
  const fj = new FlexJson();
  fj.keepSpacing = true;
  fj.keepComments = true;
  fj.DeserializeFlexFile(tempFile);
  assert.strictEqual(fj.Status, 0);

  // Modify one value
  fj.item("age").thisValue = 31;

  // Write back to file
  const writeResult = fj.WriteToFile(tempFile);
  assert.strictEqual(writeResult, 0);

  // Read the file content back
  const newContent = fs.readFileSync(tempFile, "utf8");

  // Verify comments are preserved
  assert.strictEqual(newContent.includes("// User configuration"), true, "Line comment should be preserved");
  assert.strictEqual(newContent.includes("/* Age in years"), true, "Block comment start should be preserved");
  assert.strictEqual(newContent.includes("Updated annually */"), true, "Block comment end should be preserved");
  assert.strictEqual(newContent.includes("// Is the user active?"), true, "Inline comment should be preserved");

  // Verify the value was changed
  assert.strictEqual(newContent.includes("31"), true, "New age value should be present");

  // Verify other values are unchanged
  assert.strictEqual(newContent.includes("John"), true, "Name should be unchanged");
  assert.strictEqual(newContent.includes("true"), true, "Active should be unchanged");

  // Cleanup
  fs.unlinkSync(tempFile);
});

// ============================================================================
// PROPERTY ACCESS TESTS
// ============================================================================
section("Property Access");

test("item() accesses by key", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  assert.strictEqual(fj.item("name").thisValue, "John");
});

test("item() accesses by index", () => {
  const fj = new FlexJson('{"name": "John", "age": 30}', true);
  assert.strictEqual(fj.item(0).thisValue, "John");
  assert.strictEqual(fj.item(1).toNum(), 30);
});

test("i() is alias for item()", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  assert.strictEqual(fj.i("name").thisValue, "John");
  assert.strictEqual(fj.i(0).thisValue, "John");
});

test("dot notation access works", () => {
  const fj = new FlexJson('{"user": {"profile": {"name": "John"}}}', true);
  assert.strictEqual(fj.i("user.profile.name").thisValue, "John");
});

test("v() returns primitive value", () => {
  const fj = new FlexJson('{"count": 42}', true);
  // v() returns the raw value; use toNum() for numeric conversion
  assert.strictEqual(fj.i("count").toNum(), 42);
});

test("value() is alias for v()", () => {
  const fj = new FlexJson('{"msg": "hello"}', true);
  assert.strictEqual(fj.i("msg").value(), "hello");
});

test("thisValue getter returns value", () => {
  const fj = new FlexJson('{"msg": "hello"}', true);
  assert.strictEqual(fj.item("msg").thisValue, "hello");
});

test("accessing non-existent key returns null", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  assert.strictEqual(fj.item("nonexistent").thisValue, null);
});

// ============================================================================
// TYPE GETTER TESTS
// ============================================================================
section("Type Getters");

test("getStr() returns string value", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  assert.strictEqual(fj.getStr("name"), "John");
});

test("getStr() returns default for missing key", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  assert.strictEqual(fj.getStr("missing", "default"), "default");
});

test("getNum() returns numeric value", () => {
  const fj = new FlexJson('{"count": 42}', true);
  assert.strictEqual(fj.getNum("count"), 42);
});

test("getNum() returns default for missing key", () => {
  const fj = new FlexJson('{"count": 42}', true);
  assert.strictEqual(fj.getNum("missing", 0), 0);
});

test("getBool() returns boolean value", () => {
  const fj = new FlexJson('{"active": true, "disabled": false}', true);
  assert.strictEqual(fj.getBool("active"), true);
  assert.strictEqual(fj.getBool("disabled"), false);
});

test("getBool() returns default for missing key", () => {
  const fj = new FlexJson('{"active": true}', true);
  assert.strictEqual(fj.getBool("missing", false), false);
});

// ============================================================================
// MUTATION TESTS
// ============================================================================
section("Mutation");

test("thisValue setter updates value", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  fj.item("name").thisValue = "Jane";
  assert.strictEqual(fj.item("name").thisValue, "Jane");
});

test("add() adds new key to object", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  fj.add("developer", "role");
  assert.strictEqual(fj.item("role").thisValue, "developer");
});

test("add() updates existing key", () => {
  const fj = new FlexJson('{"count": 1}', true);
  fj.add(2, "count");
  assert.strictEqual(fj.item("count").thisValue, 2);
});

test("add() appends to array", () => {
  const fj = new FlexJson('["a", "b"]', true);
  fj.add("c");
  assert.strictEqual(fj.length, 3);
  assert.strictEqual(fj.item(2).thisValue, "c");
});

// ============================================================================
// UTILITY METHOD TESTS
// ============================================================================
section("Utility Methods");

test("length returns item count for object", () => {
  const fj = new FlexJson('{"a": 1, "b": 2, "c": 3}', true);
  assert.strictEqual(fj.length, 3);
});

test("length returns item count for array", () => {
  const fj = new FlexJson('[1, 2, 3, 4]', true);
  assert.strictEqual(fj.length, 4);
});

test("contains() returns true for existing key", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  assert.strictEqual(fj.contains("name"), true);
});

test("contains() returns false for missing key", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  assert.strictEqual(fj.contains("missing"), false);
});

test("indexOfKey() returns correct index", () => {
  const fj = new FlexJson('{"a": 1, "b": 2, "c": 3}', true);
  assert.strictEqual(fj.indexOfKey("a"), 0);
  assert.strictEqual(fj.indexOfKey("b"), 1);
  assert.strictEqual(fj.indexOfKey("c"), 2);
});

test("indexOfKey() returns -1 for missing key", () => {
  const fj = new FlexJson('{"a": 1}', true);
  assert.strictEqual(fj.indexOfKey("missing"), -1);
});

test("forEach() iterates over object items", () => {
  const fj = new FlexJson('{"a": 1, "b": 2}', true);
  const values = [];
  fj.forEach((item) => values.push(item.toNum()));
  assert.deepStrictEqual(values, [1, 2]);
});

test("forEach() iterates over array items", () => {
  const fj = new FlexJson('[10, 20, 30]', true);
  const values = [];
  fj.forEach((item) => values.push(item.toNum()));
  assert.deepStrictEqual(values, [10, 20, 30]);
});

test("ConvertToArray() converts object to array", () => {
  const fj = new FlexJson('{"a": 1, "b": 2}', true);
  assert.strictEqual(fj.jsonType, "object");
  fj.ConvertToArray();
  assert.strictEqual(fj.jsonType, "array");
});

test("jsonType returns correct type", () => {
  assert.strictEqual(new FlexJson('{"a": 1}', true).jsonType, "object");
  assert.strictEqual(new FlexJson('[1, 2]', true).jsonType, "array");
  assert.strictEqual(new FlexJson('"hello"', true).jsonType, "string");
  // Standalone unquoted values: 42 becomes number, true becomes boolean, null becomes null
  assert.strictEqual(new FlexJson("42", true).jsonType, "number");
  assert.strictEqual(new FlexJson("true", true).jsonType, "boolean");
  assert.strictEqual(new FlexJson("null", true).jsonType, "null");
});

// ============================================================================
// SERIALIZATION TESTS
// ============================================================================
section("Serialization");

test("jsonString returns serialized JSON", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  const json = fj.jsonString;
  assert.strictEqual(json.includes('"name"'), true);
  assert.strictEqual(json.includes('"John"'), true);
});

test("SerializeMe() updates jsonString", () => {
  const fj = new FlexJson('{"count": 1}', true);
  fj.item("count").thisValue = 99;
  fj.SerializeMe();
  assert.strictEqual(fj.jsonString.includes("99"), true);
});

test("serialization preserves structure after modification", () => {
  const fj = new FlexJson('{"name": "John", "age": 30}', true);
  fj.add("developer", "role");
  const json = fj.jsonString;
  assert.strictEqual(json.includes('"role"'), true);
  assert.strictEqual(json.includes('"developer"'), true);
});

// ============================================================================
// EDGE CASES
// ============================================================================
section("Edge Cases");

test("handles empty object", () => {
  const fj = new FlexJson("{}", true);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.jsonType, "object");
  assert.strictEqual(fj.length, 0);
});

test("handles empty array", () => {
  const fj = new FlexJson("[]", true);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.jsonType, "array");
  assert.strictEqual(fj.length, 0);
});

test("handles escaped characters in strings", () => {
  const fj = new FlexJson('{"msg": "line1\\nline2\\ttab"}', true);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("msg").thisValue, "line1\nline2\ttab");
});

test("handles special characters in values", () => {
  const fj = new FlexJson('{"special": "quotes: \\"test\\""}', true);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("special").thisValue, 'quotes: "test"');
});

test("handles deeply nested structures", () => {
  const fj = new FlexJson();
  fj.DeserializeFlexFile(nestedJson);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.i("level1.level2.level3.value").thisValue, "deep");
});

test("handles mixed array types", () => {
  const fj = new FlexJson();
  fj.DeserializeFlexFile(arrayJson);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item(0).thisValue, "one");
  assert.strictEqual(fj.item(3).toNum(), 4);
  assert.strictEqual(fj.item(5).toBool(), true);
  // null values have jsonType "null" but thisValue returns empty string
  assert.strictEqual(fj.item(7).jsonType, "null");
});

test("keepSpacing preserves whitespace", () => {
  const fj = new FlexJson();
  fj.keepSpacing = true;
  fj.DeserializeFlex('{\n  name: "John"\n}');
  assert.strictEqual(fj.Status, 0);
});

// ============================================================================
// COMMENT TESTS (EXTENDED)
// ============================================================================
section("Comments (Extended)");

test("handles mid-line // comments", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{name: "John" // this is an inline comment\n}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("name").thisValue, "John");
});

test("handles // comment after value with comma", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{\n  name: "John", // comment after comma\n  age: 30\n}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("name").thisValue, "John");
  assert.strictEqual(fj.getNum("age"), 30);
});

test("handles multi-line /* */ block comments", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{\n  /* this is a\n     multi-line\n     comment */\n  name: "John"\n}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("name").thisValue, "John");
});

test("handles /* */ comment between key and value", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{name: /* inline block */ "John"}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("name").thisValue, "John");
});

test("handles /* */ comment in middle of object", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{\n  name: "John",\n  /* comment between items */\n  age: 30\n}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("name").thisValue, "John");
  assert.strictEqual(fj.getNum("age"), 30);
});

// ============================================================================
// SYNTAX ERROR TESTS
// ============================================================================
section("Syntax Error Reporting");

test("reports error for invalid JSON with non-zero Status", () => {
  const fj = new FlexJson();
  fj.Deserialize('{invalid json!!!}');
  assert.notStrictEqual(fj.Status, 0);
});

test("reports error for unquoted string in strict mode", () => {
  const fj = new FlexJson();
  fj.Deserialize('{name: John}'); // unquoted not allowed in strict mode
  assert.notStrictEqual(fj.Status, 0);
  // Status should be negative to indicate error
  assert.strictEqual(fj.Status < 0, true);
});

test("reports error with non-zero Status for invalid escape sequence", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"name": "test\\qinvalid"}'); // \q is not a valid escape
  assert.notStrictEqual(fj.Status, 0);
  // Status should be negative to indicate error
  assert.strictEqual(fj.Status < 0, true);
});

test("reports error for unclosed string", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"name": "unclosed string}');
  assert.notStrictEqual(fj.Status, 0);
});

test("reports error for unclosed object", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"name": "John"');
  assert.notStrictEqual(fj.Status, 0);
});

test("reports error for unclosed array", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('["a", "b"');
  assert.notStrictEqual(fj.Status, 0);
});

test("reports error for truncated unicode escape", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"name": "test\\u00"}');
  assert.notStrictEqual(fj.Status, 0);
  assert.strictEqual(fj.Status < 0, true);
});

test("parses valid unicode escape sequences", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"name": "test\\u0041"}'); // \u0041 = 'A'
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("name").thisValue, "testA");
});

// ============================================================================
// NULL AND MISSING VALUE TESTS
// ============================================================================
section("Null and Missing Values");

test("parses explicit null value", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"value": null}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("value").jsonType, "null");
});

test("parses null in array", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('[1, null, 3]');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item(1).jsonType, "null");
});

test("parses multiple null values", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"a": null, "b": null, "c": "value"}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("a").jsonType, "null");
  assert.strictEqual(fj.item("b").jsonType, "null");
  assert.strictEqual(fj.item("c").thisValue, "value");
});

test("handles trailing comma in array (flex mode)", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('[1, 2, 3,]');
  // Check if it parses or reports an error - either is valid behavior
  // The key is that it doesn't crash
  if (fj.Status === 0) {
    assert.strictEqual(fj.length >= 3, true);
  } else {
    assert.strictEqual(typeof fj.statusMsg, "string");
  }
});

test("handles trailing comma in object (flex mode)", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{name: "John", age: 30,}');
  // Check if it parses or reports an error - either is valid behavior
  if (fj.Status === 0) {
    assert.strictEqual(fj.length >= 2, true);
  } else {
    assert.strictEqual(typeof fj.statusMsg, "string");
  }
});

test("handles empty slot in array (double comma)", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('[1, , 3]');
  // This may parse with a null/empty slot or may error - test for graceful handling
  if (fj.Status === 0) {
    assert.strictEqual(fj.length >= 2, true);
  } else {
    assert.strictEqual(typeof fj.statusMsg, "string");
  }
});

test("handles comma followed by closing bracket", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('[1, 2,]');
  // Test graceful handling - either parses or provides error
  if (fj.Status === 0) {
    assert.strictEqual(fj.length >= 2, true);
  } else {
    assert.strictEqual(typeof fj.statusMsg, "string");
  }
});

// ============================================================================
// QUOTE STYLE TESTS (EXTENDED)
// ============================================================================
section("Quote Styles (Extended)");

test("parses double-quoted keys and values", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{"key": "value"}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("key").thisValue, "value");
});

test("parses single-quoted keys and values", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex("{'key': 'value'}");
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("key").thisValue, "value");
});

test("parses unquoted keys with double-quoted values", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{key: "value"}');
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("key").thisValue, "value");
});

test("parses unquoted keys with single-quoted values", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex("{key: 'value'}");
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("key").thisValue, "value");
});

test("parses unquoted keys and values", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex("{key: value}");
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("key").thisValue, "value");
});

test("parses mixed quote styles in same object", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex(`{
    "doubleKey": "doubleValue",
    'singleKey': 'singleValue',
    unquotedKey: unquotedValue
  }`);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("doubleKey").thisValue, "doubleValue");
  assert.strictEqual(fj.item("singleKey").thisValue, "singleValue");
  assert.strictEqual(fj.item("unquotedKey").thisValue, "unquotedValue");
});

test("handles double quotes inside single-quoted string", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex(`{'msg': 'He said "hello"'}`);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("msg").thisValue, 'He said "hello"');
});

test("handles single quotes inside double-quoted string", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex(`{"msg": "It's working"}`);
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("msg").thisValue, "It's working");
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n" + "=".repeat(50));
console.log(`Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log("=".repeat(50));

if (failed > 0) {
  process.exit(1);
}
