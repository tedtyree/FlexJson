# FlexJson Requirements

## Overview

FlexJson is a JavaScript library for parsing, manipulating, and serializing JSON with extended syntax support (comments, unquoted/single-quoted strings, trailing commas). Primary use case is config file round-trip editing without losing formatting or comments.

---

## Functional Requirements

### 1. Parsing Modes

| Mode | Behavior |
|------|----------|
| **Strict** | Standard JSON only — double-quoted keys/values, no comments |
| **Flex** | Extended syntax: `//` and `/* */` comments, single or unquoted strings, trailing commas |

### 2. Flex Syntax Support

- Block comments: `/* ... */`
- Line comments: `// ...`
- Unquoted string values (auto-typed as string, number, boolean, or null)
- Single-quoted strings as equivalent to double-quoted
- Trailing commas in objects and arrays

### 3. Round-Trip Preservation

- When `keepSpacing` is enabled, whitespace is captured during parse and restored on serialize
- When `keepComments` is enabled, comments are preserved through serialize
- `keepSpacingAndComments(spacing_flag, comments_flag)` controls both

### 4. Data Access API

- `i(idx)` / `item(idx)` — access child by key name or integer index; supports dot notation
- `v(idx)` / `value(idx)` — get raw JS value (string, number, boolean, null, array, or object)
- `toStr()`, `toNum()`, `toBool()` — coerce current node to a primitive
- `getStr(key, default)`, `getNum(key, default)`, `getBool(key, default)` — typed get with default
- `contains(key)` — check if a key exists
- `indexOfKey(key)` — return index of a key in an object
- `forEach(callback)` — iterate children
- `length` — number of children

### 5. Data Mutation API

- `add(value, key)` — add or update a key/value; supports dot notation paths.
  - `value` may be a primitive (string, number, boolean, null) or an existing `FlexJson` node (object, array, or scalar) — **not** a raw native JS array or plain object (see [5c](#5c-native-value-conversion)).
  - Replacing an **existing** key must preserve the full type/value of whatever `value` resolves to — including object and array nodes, not just primitives. (Historical note: an earlier implementation re-derived the type from the raw `value` on replace instead of reusing the already-typed node, which silently corrupted array/object replacements — fixed; regression-covered by the "replace existing key with array/object" case.)
- `ConvertToArray()` — convert an object node to an array
- `thisValue` — directly set the value on a node. Accepts primitives or a `FlexJson` node only — **does not** accept a native JS array/object (`convertType()` treats these as an invalid type by design; see [5c](#5c-native-value-conversion) for the supported way to build a node from one).
- `Clear()` — reset the node

### 5c. Native Value Conversion

FlexJson's data model is "you build FlexJson trees," not "assign native JS values and have them silently absorbed." A raw JS array or plain object passed to `thisValue` (directly, or indirectly through `add()`) is intentionally treated as an invalid type — it is not auto-converted. To convert a native structure into a proper FlexJson tree first, use:

- **`FlexJson.FromNativeArray(arr)`** — converts a native JS array into a FlexJson array node, recursively converting each element.
- **`FlexJson.FromNativeObject(obj)`** — converts a native JS plain object into a FlexJson object node, recursively converting each value.
- **`FlexJson.FromNative(value)`** — dispatches by type: `null` → `CreateNull()`, array → `FromNativeArray()`, plain object → `FromNativeObject()`, existing `FlexJson` instance → returned as-is, primitive → wrapped via `thisValue`.

```javascript
// Replace an existing array-typed field with a new native array
jfx.add(FlexJson.FromNativeArray(["#leadership", "#community"]), "category");
```

### 5a. Native Iteration (Symbol.iterator)

FlexJson objects must be natively iterable via JavaScript's `for...of` loop by implementing `[Symbol.iterator]()`:

- **object / array node** — iterates children one FlexJson node at a time (same nodes returned by `i(idx)`)
- **scalar node** (string, number, boolean, null) — yields itself once, then stops

```javascript
// Example usage
for (const node of myFlexJson) {
  console.log(node.thisValue);
}
```

This makes FlexJson compatible with spread (`[...fj]`), destructuring, and all other JS iteration consumers.

### 5b. Array-Protocol Methods (`at()`, `entries()`)

FlexJson exposes two additional iteration helpers that mirror standard JavaScript array/object protocols:

- **`at(n)`** — returns the child at index `n`; negative values count from the end (`at(-1)` = last element). Returns `undefined` if out of range. On scalar nodes (string, number, boolean, null), `at(0)` and `at(-1)` return the node itself.
- **`entries()`** — returns an iterator of `[key, child]` pairs. For object nodes the key is the string key name; for array nodes it is the numeric index. On scalar nodes yields one pair: `[0, this]`.

**Design decision — `i()` does not support negative indices.**
`i()` / `item()` is the general-purpose internal accessor used throughout the class (by `add()`, `contains()`, `getStr()`, the iterators, etc.). It currently returns `null` for out-of-range values including negative numbers; callers may rely on that as an error sentinel. Negative-index support is intentionally provided only through `at()`, which makes the intent explicit and avoids a silent breaking change to the core lookup method.

### 6. Serialization / Deserialization

- `Deserialize(str)` — parse standard JSON string
- `DeserializeFlex(str)` — parse flex-format string
- `DeserializeFile(path)` — read and parse a file (strict mode)
- `DeserializeFlexFile(path, spacing?, comments?)` — read and parse a flex file, optionally preserving spacing/comments
- `SerializeMe()` — serialize back to a JSON string (returns status code; use `jsonString` to get the string)
- `jsonString` — property returning the serialized string; triggers `SerializeMe()` if needed
- `WriteToFile(path)` — write serialized output to file system
- `Stringify()` — always returns compact standard JSON (strips all flex metadata); use for API responses and any standard JSON consumer. To preserve flex formatting, use `jsonString` instead.
- `toNative()` — convert the FlexJson tree to a plain JavaScript value (`object`, `Array`, or primitive); used internally by `Stringify()` and available for direct use

### 7. Error Handling

- Default: throws `FlexJsonError` on parse failure
  - `err.name` → `"FlexJsonError"`
  - `err.status` → negative integer error code
  - `err.message` → human-readable description
- Silent mode: set `throwOnError = false` to suppress throws; check `Status` and `statusMsg` instead
- `Status` of `0` means success; negative values indicate error

### 8. File Type Support

- `.json` — standard JSON files
- `.jfx` — FlexJson extended format files (comments, unquoted strings)

---

## Non-Functional Requirements

- **Node.js compatibility** — CommonJS module (`require`)
- **No external runtime dependencies** — uses only Node.js built-ins (`fs`)
- **Round-trip fidelity** — files read and written with `keepSpacing`/`keepComments` must not alter unmodified content

---

## Out of Scope

- Multi-line string literals (`"""` / `'''`) — planned backlog item
- Browser/ESM bundle — not currently supported
- Schema validation

---

## Editor Support (separate artifact)

A VS Code extension (`JFX - FlexJson Language Support`) and Tree-sitter grammar provide syntax highlighting for `.jfx` files. These are installed independently from the npm package.
