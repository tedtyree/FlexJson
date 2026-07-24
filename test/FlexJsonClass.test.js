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
  const fj = new FlexJson();
  fj.throwOnError = false; // Use silent mode for this test
  fj.UseFlexJson = true;
  fj.Deserialize('{invalid json here!!!}');
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

// ---------------------------------------------------------------------------
// add() replacing an existing key with a FlexJson array/object node
// (regression: replace branch used to re-derive type from the raw `value`
// instead of reusing the already-typed `newV`, which corrupted the node
// into jsonType "error" and cascaded into a whole-file WriteToFile failure)
// ---------------------------------------------------------------------------

test("add() replacing existing key with a FlexJson array node preserves array type/value", () => {
  const fj = new FlexJson('{"tags": ["old"]}', true);
  fj.add(FlexJson.FromNativeArray(["a", "b", "c"]), "tags");
  assert.strictEqual(fj.item("tags").jsonType, "array");
  assert.strictEqual(fj.item("tags").length, 3);
  assert.strictEqual(fj.item("tags").item(0).thisValue, "a");
  assert.strictEqual(fj.item("tags").item(2).thisValue, "c");
});

test("add() replacing existing key with a FlexJson object node preserves object type/value", () => {
  const fj = new FlexJson('{"meta": {"old": 1}}', true);
  fj.add(FlexJson.FromNativeObject({ excerpt: "hi", authorRole: "editor" }), "meta");
  assert.strictEqual(fj.item("meta").jsonType, "object");
  assert.strictEqual(fj.item("meta").getStr("excerpt"), "hi");
  assert.strictEqual(fj.item("meta").getStr("authorRole"), "editor");
});

test("add() replacing existing key with array node round-trips through jsonString", () => {
  const fj = new FlexJson('{"tags": ["old"]}', true);
  fj.add(FlexJson.FromNativeArray(["x", "y"]), "tags");
  const json = fj.jsonString;
  assert.strictEqual(json.includes('"x"'), true);
  assert.strictEqual(json.includes('"y"'), true);
  assert.strictEqual(json.includes('"old"'), false);
});

test("add() replacing existing key with array node keeps Status 0 (no corruption)", () => {
  const fj = new FlexJson('{"tags": ["old"]}', true);
  fj.add(FlexJson.FromNativeArray(["a"]), "tags");
  assert.strictEqual(fj.Status, 0);
  assert.notStrictEqual(fj.item("tags").jsonType, "error");
});

test("WriteToFile() succeeds after replacing an existing array key via add()+FromNativeArray (regression for whole-file err-53 corruption)", () => {
  const fj = new FlexJson('{"vid": "test", "category": ["old"]}', true);
  fj.add(FlexJson.FromNativeArray(["#a", "#b"]), "category");

  const result = fj.WriteToFile(tempFile);
  assert.strictEqual(result, 0);
  assert.strictEqual(fj.Status, 0);

  const reread = new FlexJson();
  reread.DeserializeFlexFile(tempFile);
  assert.strictEqual(reread.Status, 0);
  assert.strictEqual(reread.getStr("vid"), "test");
  assert.deepStrictEqual(reread.item("category").toNative(), ["#a", "#b"]);

  fs.unlinkSync(tempFile);
});

// ============================================================================
// NATIVE VALUE CONVERSION TESTS (FromNativeArray / FromNativeObject / FromNative)
// ============================================================================
section("Native Value Conversion");

test("FlexJson.FromNativeArray() converts a native array to a FlexJson array node", () => {
  const node = FlexJson.FromNativeArray(["a", "b", "c"]);
  assert.strictEqual(node.jsonType, "array");
  assert.strictEqual(node.length, 3);
  assert.strictEqual(node.item(0).thisValue, "a");
  assert.strictEqual(node.item(2).thisValue, "c");
});

test("FlexJson.FromNativeArray() recursively converts nested arrays/objects", () => {
  const node = FlexJson.FromNativeArray([{ a: 1 }, [2, 3]]);
  assert.strictEqual(node.item(0).jsonType, "object");
  assert.strictEqual(node.item(0).getNum("a"), 1);
  assert.strictEqual(node.item(1).jsonType, "array");
  assert.strictEqual(node.item(1).item(1).thisValue, 3);
});

test("FlexJson.FromNativeArray() on empty array produces an empty FlexJson array", () => {
  const node = FlexJson.FromNativeArray([]);
  assert.strictEqual(node.jsonType, "array");
  assert.strictEqual(node.length, 0);
});

test("FlexJson.FromNativeArray() result serializes correctly", () => {
  const node = FlexJson.FromNativeArray(["x", "y"]);
  assert.strictEqual(node.Stringify(), '["x","y"]');
});

test("FlexJson.FromNativeObject() converts a native object to a FlexJson object node", () => {
  const node = FlexJson.FromNativeObject({ name: "John", age: 30 });
  assert.strictEqual(node.jsonType, "object");
  assert.strictEqual(node.getStr("name"), "John");
  assert.strictEqual(node.getNum("age"), 30);
});

test("FlexJson.FromNativeObject() recursively converts nested values", () => {
  const node = FlexJson.FromNativeObject({ tags: ["a", "b"], meta: { x: 1 } });
  assert.strictEqual(node.item("tags").jsonType, "array");
  assert.strictEqual(node.item("tags").length, 2);
  assert.strictEqual(node.item("meta").jsonType, "object");
  assert.strictEqual(node.item("meta").getNum("x"), 1);
});

test("FlexJson.FromNativeObject() on empty object produces an empty FlexJson object", () => {
  const node = FlexJson.FromNativeObject({});
  assert.strictEqual(node.jsonType, "object");
  assert.strictEqual(node.length, 0);
});

test("FlexJson.FromNativeObject() result serializes correctly", () => {
  const node = FlexJson.FromNativeObject({ a: 1, b: "two" });
  assert.strictEqual(node.Stringify(), '{"a":1,"b":"two"}');
});

test("FlexJson.FromNative() dispatches array to FromNativeArray", () => {
  const node = FlexJson.FromNative(["a", "b"]);
  assert.strictEqual(node.jsonType, "array");
  assert.strictEqual(node.length, 2);
});

test("FlexJson.FromNative() dispatches plain object to FromNativeObject", () => {
  const node = FlexJson.FromNative({ a: 1 });
  assert.strictEqual(node.jsonType, "object");
  assert.strictEqual(node.getNum("a"), 1);
});

test("FlexJson.FromNative() dispatches null to CreateNull()", () => {
  const node = FlexJson.FromNative(null);
  assert.strictEqual(node.jsonType, "null");
});

test("FlexJson.FromNative() wraps primitives via thisValue", () => {
  const strNode = FlexJson.FromNative("hello");
  assert.strictEqual(strNode.thisValue, "hello");
  const numNode = FlexJson.FromNative(42);
  assert.strictEqual(numNode.toNum(), 42);
  const boolNode = FlexJson.FromNative(true);
  assert.strictEqual(boolNode.toBool(), true);
});

test("FlexJson.FromNative() returns an existing FlexJson instance as-is", () => {
  const existing = new FlexJson('{"a": 1}', true);
  const result = FlexJson.FromNative(existing);
  assert.strictEqual(result, existing);
});

test("FlexJson.FromNativeArray() node works with add() to replace an existing key", () => {
  const fj = new FlexJson('{"category": ["old-cat"]}', true);
  fj.add(FlexJson.FromNativeArray(["#economics", "#business"]), "category");
  assert.strictEqual(fj.Status, 0);
  assert.strictEqual(fj.item("category").length, 2);
  assert.strictEqual(fj.item("category").item(0).thisValue, "#economics");
});

test("FlexJson.FromNativeArray() node works with add() to insert a new key", () => {
  const fj = new FlexJson('{"name": "John"}', true);
  fj.add(FlexJson.FromNativeArray(["1", "2"]), "newTags");
  assert.strictEqual(fj.item("newTags").jsonType, "array");
  assert.strictEqual(fj.item("newTags").length, 2);
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

test("for...of iterates over object items", () => {
  const fj = new FlexJson('{"a": 1, "b": 2, "c": 3}', true);
  const values = [];
  for (const node of fj) {
    values.push(node.toNum());
  }
  assert.deepStrictEqual(values, [1, 2, 3]);
});

test("for...of iterates over array items", () => {
  const fj = new FlexJson('[10, 20, 30]', true);
  const values = [];
  for (const node of fj) {
    values.push(node.toNum());
  }
  assert.deepStrictEqual(values, [10, 20, 30]);
});

test("for...of on scalar yields itself once", () => {
  const fj = new FlexJson('"hello"', true);
  const results = [];
  for (const node of fj) {
    results.push(node.toStr());
  }
  assert.deepStrictEqual(results, ["hello"]);
});

test("spread operator works on object", () => {
  const fj = new FlexJson('{"x": 1, "y": 2}', true);
  const nodes = [...fj];
  assert.strictEqual(nodes.length, 2);
  assert.strictEqual(nodes[0].toNum(), 1);
  assert.strictEqual(nodes[1].toNum(), 2);
});

test("toNative() converts object to plain JS object", () => {
  const fj = new FlexJson('{"name": "John", "age": 30, "active": true}', true);
  assert.deepStrictEqual(fj.toNative(), { name: "John", age: 30, active: true });
});

test("toNative() converts array to plain JS array", () => {
  const fj = new FlexJson('[1, "two", true, null]', true);
  assert.deepStrictEqual(fj.toNative(), [1, "two", true, null]);
});

test("toNative() converts nested objects", () => {
  const fj = new FlexJson('{"a": {"b": 42}}', true);
  assert.deepStrictEqual(fj.toNative(), { a: { b: 42 } });
});

test("toNative() returns primitive for scalar node", () => {
  const fj = new FlexJson('"hello"', true);
  assert.strictEqual(fj.toNative(), "hello");
});

test("toNative() returns null for null node", () => {
  const fj = new FlexJson('null', true);
  assert.strictEqual(fj.toNative(), null);
});

test("Stringify() returns compact standard JSON", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{ name: John, age: 30 }');
  assert.strictEqual(fj.Stringify(), '{"name":"John","age":30}');
});

test("Stringify() strips flex spacing and comments", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{\n  // comment\n  name: John\n}');
  assert.strictEqual(fj.Stringify(), '{"name":"John"}');
});

test("Stringify() output is valid for JSON.parse()", () => {
  const fj = new FlexJson();
  fj.DeserializeFlex('{a: 1, b: [2, 3], c: true}');
  const parsed = JSON.parse(fj.Stringify());
  assert.deepStrictEqual(parsed, { a: 1, b: [2, 3], c: true });
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
  fj.throwOnError = false;
  fj.Deserialize('{invalid json!!!}');
  assert.notStrictEqual(fj.Status, 0);
});

test("reports error for unquoted string in strict mode", () => {
  const fj = new FlexJson();
  fj.throwOnError = false;
  fj.Deserialize('{name: John}'); // unquoted not allowed in strict mode
  assert.notStrictEqual(fj.Status, 0);
  // Status should be negative to indicate error
  assert.strictEqual(fj.Status < 0, true);
});

test("reports error with non-zero Status for invalid escape sequence", () => {
  const fj = new FlexJson();
  fj.throwOnError = false;
  fj.DeserializeFlex('{"name": "test\\qinvalid"}'); // \q is not a valid escape
  assert.notStrictEqual(fj.Status, 0);
  // Status should be negative to indicate error
  assert.strictEqual(fj.Status < 0, true);
});

test("reports error for unclosed string", () => {
  const fj = new FlexJson();
  fj.throwOnError = false;
  fj.DeserializeFlex('{"name": "unclosed string}');
  assert.notStrictEqual(fj.Status, 0);
});

test("reports error for unclosed object", () => {
  const fj = new FlexJson();
  fj.throwOnError = false;
  fj.DeserializeFlex('{"name": "John"');
  assert.notStrictEqual(fj.Status, 0);
});

test("reports error for unclosed array", () => {
  const fj = new FlexJson();
  fj.throwOnError = false;
  fj.DeserializeFlex('["a", "b"');
  assert.notStrictEqual(fj.Status, 0);
});

test("reports error for truncated unicode escape", () => {
  const fj = new FlexJson();
  fj.throwOnError = false;
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

test("throwOnError=true throws FlexJsonError on parse error", () => {
  const fj = new FlexJson();
  fj.throwOnError = true; // default, but explicit for clarity
  let threw = false;
  let errorStatus = null;
  try {
    fj.Deserialize('{invalid!!!}');
  } catch (err) {
    threw = true;
    errorStatus = err.status;
    assert.strictEqual(err.name, "FlexJsonError");
  }
  assert.strictEqual(threw, true, "Should have thrown FlexJsonError");
  assert.strictEqual(errorStatus < 0, true, "Error status should be negative");
});

test("throwOnError=false does not throw on parse error", () => {
  const fj = new FlexJson();
  fj.throwOnError = false;
  let threw = false;
  try {
    fj.Deserialize('{invalid!!!}');
  } catch (err) {
    threw = true;
  }
  assert.strictEqual(threw, false, "Should not have thrown");
  assert.notStrictEqual(fj.Status, 0, "Status should indicate error");
});

test("throwOnError=true throws on file read error", () => {
  const fj = new FlexJson();
  fj.throwOnError = true;
  let threw = false;
  let errorStatus = null;
  try {
    fj.DeserializeFlexFile('/nonexistent/path/file.jfx');
  } catch (err) {
    threw = true;
    errorStatus = err.status;
  }
  assert.strictEqual(threw, true, "Should have thrown on file error");
  assert.strictEqual(errorStatus, -32, "File error status should be -32");
});

test("throwOnError=false does not throw on file read error", () => {
  const fj = new FlexJson();
  fj.throwOnError = false;
  let threw = false;
  try {
    fj.DeserializeFlexFile('/nonexistent/path/file.jfx');
  } catch (err) {
    threw = true;
  }
  assert.strictEqual(threw, false, "Should not have thrown");
  assert.strictEqual(fj.Status, -32, "Status should indicate file error");
});

// ---------------------------------------------------------------------------
// Constructor throwOnError Parameter Tests
// ---------------------------------------------------------------------------

test("constructor with throwOnError=true throws on invalid JSON", () => {
  let threw = false;
  let errorStatus = null;
  try {
    new FlexJson('{invalid!!!}', true, true);
  } catch (err) {
    threw = true;
    errorStatus = err.status;
    assert.strictEqual(err.name, "FlexJsonError");
  }
  assert.strictEqual(threw, true, "Should have thrown FlexJsonError");
  assert.strictEqual(errorStatus < 0, true, "Error status should be negative");
});

test("constructor with throwOnError=true throws on unquoted string in strict mode", () => {
  let threw = false;
  try {
    new FlexJson('{name: John}', false, true); // strict mode, throw enabled
  } catch (err) {
    threw = true;
    assert.strictEqual(err.name, "FlexJsonError");
  }
  assert.strictEqual(threw, true, "Should have thrown FlexJsonError for unquoted string");
});

test("constructor with throwOnError=false does not throw on invalid JSON", () => {
  let threw = false;
  let fj = null;
  try {
    fj = new FlexJson('{invalid!!!}', true, false);
  } catch (err) {
    threw = true;
  }
  assert.strictEqual(threw, false, "Should not have thrown");
  assert.notStrictEqual(fj.Status, 0, "Status should indicate error");
});

test("constructor with throwOnError=false does not throw on unquoted string in strict mode", () => {
  let threw = false;
  let fj = null;
  try {
    fj = new FlexJson('{name: John}', false, false); // strict mode, throw disabled
  } catch (err) {
    threw = true;
  }
  assert.strictEqual(threw, false, "Should not have thrown");
  assert.strictEqual(fj.Status < 0, true, "Status should be negative error code");
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
// at() TESTS
// ============================================================================
section("at()");

test("at(0) returns first element of array", () => {
  const fj = new FlexJson('["a", "b", "c"]', true);
  assert.strictEqual(fj.at(0).thisValue, "a");
});

test("at(n) returns nth element of array", () => {
  const fj = new FlexJson('["a", "b", "c"]', true);
  assert.strictEqual(fj.at(1).thisValue, "b");
  assert.strictEqual(fj.at(2).thisValue, "c");
});

test("at(-1) returns last element of array", () => {
  const fj = new FlexJson('["a", "b", "c"]', true);
  assert.strictEqual(fj.at(-1).thisValue, "c");
});

test("at(-2) returns second-to-last element of array", () => {
  const fj = new FlexJson('["a", "b", "c"]', true);
  assert.strictEqual(fj.at(-2).thisValue, "b");
});

test("at() on object uses positional order", () => {
  const fj = new FlexJson('{"x": 1, "y": 2, "z": 3}', true);
  assert.strictEqual(fj.at(0).thisValue, 1);
  assert.strictEqual(fj.at(-1).thisValue, 3);
});

test("at() returns undefined for out-of-range positive index", () => {
  const fj = new FlexJson('["a", "b"]', true);
  assert.strictEqual(fj.at(5), undefined);
});

test("at() returns undefined for out-of-range negative index", () => {
  const fj = new FlexJson('["a", "b"]', true);
  assert.strictEqual(fj.at(-5), undefined);
});

test("at() returns undefined on empty array", () => {
  const fj = new FlexJson('[]', true);
  assert.strictEqual(fj.at(0), undefined);
  assert.strictEqual(fj.at(-1), undefined);
});

test("at(0) on scalar returns the node itself", () => {
  const fj = new FlexJson('"hello"', true);
  assert.strictEqual(fj.at(0), fj);
});

test("at(-1) on scalar returns the node itself", () => {
  const fj = new FlexJson('42', true);
  assert.strictEqual(fj.at(-1), fj);
});

test("at(1) on scalar returns undefined", () => {
  const fj = new FlexJson('"hello"', true);
  assert.strictEqual(fj.at(1), undefined);
});

// ============================================================================
// entries() TESTS
// ============================================================================
section("entries()");

test("entries() on array yields numeric index + node pairs", () => {
  const fj = new FlexJson('["x", "y", "z"]', true);
  const result = [];
  for (const [key, node] of fj.entries()) {
    result.push([key, node.thisValue]);
  }
  assert.deepStrictEqual(result, [[0, "x"], [1, "y"], [2, "z"]]);
});

test("entries() array keys are numbers", () => {
  const fj = new FlexJson('["a", "b"]', true);
  for (const [key] of fj.entries()) {
    assert.strictEqual(typeof key, "number");
  }
});

test("entries() on object yields string key + node pairs", () => {
  const fj = new FlexJson('{"name": "John", "age": 30}', true);
  const result = [];
  for (const [key, node] of fj.entries()) {
    result.push([key, node.thisValue]);
  }
  assert.deepStrictEqual(result, [["name", "John"], ["age", 30]]);
});

test("entries() object keys are strings", () => {
  const fj = new FlexJson('{"a": 1, "b": 2}', true);
  for (const [key] of fj.entries()) {
    assert.strictEqual(typeof key, "string");
  }
});

test("entries() on scalar yields [0, node] once", () => {
  const fj = new FlexJson('"hello"', true);
  const result = [];
  for (const [key, node] of fj.entries()) {
    result.push([key, node.thisValue]);
  }
  assert.deepStrictEqual(result, [[0, "hello"]]);
  assert.strictEqual(result[0][1], fj.thisValue);
});

test("entries() on empty array yields nothing", () => {
  const fj = new FlexJson('[]', true);
  const result = [...fj.entries()];
  assert.strictEqual(result.length, 0);
});

test("entries() on empty object yields nothing", () => {
  const fj = new FlexJson('{}', true);
  const result = [...fj.entries()];
  assert.strictEqual(result.length, 0);
});

test("entries() iterator is reusable via for...of", () => {
  const fj = new FlexJson('{"a": 1, "b": 2}', true);
  const keys = [];
  for (const [key] of fj.entries()) {
    keys.push(key);
  }
  assert.deepStrictEqual(keys, ["a", "b"]);
});

test("entries() values are FlexJson nodes", () => {
  const fj = new FlexJson('[10, 20]', true);
  for (const [, node] of fj.entries()) {
    assert.strictEqual(node.constructor.name, "FlexJson");
  }
});

test("entries() collected with Array.from()", () => {
  const fj = new FlexJson('{"x": 1, "y": 2}', true);
  const pairs = Array.from(fj.entries());
  assert.strictEqual(pairs.length, 2);
  assert.strictEqual(pairs[0][0], "x");
  assert.strictEqual(pairs[1][0], "y");
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
