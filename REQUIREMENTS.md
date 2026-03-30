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

- `add(value, key)` — add or update a key/value; supports dot notation paths
- `ConvertToArray()` — convert an object node to an array
- `thisValue` — directly set the value on a node
- `Clear()` — reset the node

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

### 6. Serialization / Deserialization

- `Deserialize(str)` — parse standard JSON string
- `DeserializeFlex(str)` — parse flex-format string
- `DeserializeFile(path)` — read and parse a file (strict mode)
- `DeserializeFlexFile(path, spacing?, comments?)` — read and parse a flex file, optionally preserving spacing/comments
- `SerializeMe()` — serialize back to a JSON string
- `WriteToFile(path)` — write serialized output to file system

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
