/**
 * FlexJson - Flexible JSON manipulation library for JavaScript
 * Supports comments, single/double/unquoted strings, and preserves formatting
 */
declare class FlexJson {
  /**
   * Creates a new FlexJson instance
   * @param initialJSON - Optional JSON string to parse
   * @param useFlexJsonFlag - If true, enables FlexJson mode (comments, unquoted strings, etc.)
   */
  constructor(initialJSON?: string, useFlexJsonFlag?: boolean);

  // ============================================================================
  // Properties
  // ============================================================================

  /** Status code: 0 = OK, negative = error */
  readonly Status: number;

  /** Error/status message from last operation */
  readonly statusMsg: string;

  /** JSON type: "object", "array", "string", "number", "boolean", or "null" */
  readonly jsonType: string;

  /** Serialized JSON string representation */
  jsonString: string;

  /** Number of items (for object/array) or 1 (for primitives) */
  readonly length: number;

  /** Key name (for items within an object) */
  key: string;

  /** Enable FlexJson mode (comments, unquoted strings, single quotes) */
  UseFlexJson: boolean;

  /** Preserve whitespace during deserialization */
  keepSpacing: boolean;

  /** Preserve comments during deserialization */
  keepComments: boolean;

  /** Allow single-quoted strings (default: true) */
  ALLOW_SINGLE_QUOTE_STRINGS: boolean;

  /** Encode single quotes when serializing (default: false) */
  ENCODE_SINGLE_QUOTES: boolean;

  /** Parent FlexJson object (for nested items) */
  Parent: FlexJson | null;

  /** Get/set the primitive value of this item */
  thisValue: string | number | boolean | null;

  // ============================================================================
  // Deserialization Methods
  // ============================================================================

  /**
   * Deserialize a JSON string (strict mode)
   * @param jsonString - The JSON string to parse
   * @param start - Starting position in the string (default: 0)
   * @param okToClip - Allow extra content after JSON (default: false)
   * @returns Status code (0 = success, negative = error)
   */
  Deserialize(jsonString: string, start?: number, okToClip?: boolean): number;

  /**
   * Deserialize a FlexJson string (flex mode with comments, unquoted strings, etc.)
   * @param jsonString - The FlexJson string to parse
   * @param start - Starting position in the string (default: 0)
   * @param okToClip - Allow extra content after JSON (default: false)
   * @returns Status code (0 = success, negative = error)
   */
  DeserializeFlex(jsonString: string, start?: number, okToClip?: boolean): number;

  /**
   * Deserialize JSON from a file (strict mode)
   * @param filePath - Path to the JSON file
   * @param okToClip - Allow extra content after JSON (default: false)
   * @returns Status code (0 = success, negative = error)
   */
  DeserializeFile(filePath: string, okToClip?: boolean): number;

  /**
   * Deserialize FlexJson from a file (flex mode)
   * @param filePath - Path to the FlexJson file
   * @param okToClip - Allow extra content after JSON (default: false)
   * @param spacingFlag - Keep spacing: -1=ignore, 0=false, 1=true (default: 1)
   * @param commentsFlag - Keep comments: -1=ignore, 0=false, 1=true (default: 1)
   * @returns Status code (0 = success, negative = error)
   */
  DeserializeFlexFile(
    filePath: string,
    okToClip?: boolean,
    spacingFlag?: number,
    commentsFlag?: number
  ): number;

  // ============================================================================
  // Serialization Methods
  // ============================================================================

  /**
   * Serialize the FlexJson object to a JSON string
   * Updates the jsonString property
   * @returns Status code (0 = success, negative = error)
   */
  SerializeMe(): number;

  /**
   * Write the FlexJson object to a file
   * @param filePath - Path to write the file
   * @returns Status code (0 = success, -1 = write error, -2 = invalid object)
   */
  WriteToFile(filePath: string): number;

  // ============================================================================
  // Item Access Methods
  // ============================================================================

  /**
   * Get a child item by key or index
   * @param idx - Key name (string) or index (number), supports dot notation for nested access
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   * @returns The child FlexJson item, or a null FlexJson if not found
   */
  item(idx: string | number, dotNotation?: boolean): FlexJson;

  /**
   * Alias for item()
   * @param idx - Key name (string) or index (number)
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   * @returns The child FlexJson item, or a null FlexJson if not found
   */
  i(idx: string | number, dotNotation?: boolean): FlexJson;

  /**
   * Get the primitive value of this item or a child item
   * @param idx - Optional key/index to access child first
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   * @returns The primitive value, or null for objects/arrays
   */
  v(idx?: string | number, dotNotation?: boolean): string | number | boolean | null;

  /**
   * Alias for v()
   * @param idx - Optional key/index to access child first
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   * @returns The primitive value, or null for objects/arrays
   */
  value(idx?: string | number, dotNotation?: boolean): string | number | boolean | null;

  // ============================================================================
  // Type-Safe Getters
  // ============================================================================

  /**
   * Get a string value by key with a default fallback
   * @param idx - Key name, supports dot notation
   * @param defaultValue - Value to return if key not found (default: "")
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   * @returns The string value or default
   */
  getStr(idx: string, defaultValue?: string, dotNotation?: boolean): string;

  /**
   * Get a numeric value by key with a default fallback
   * @param idx - Key name, supports dot notation
   * @param defaultValue - Value to return if key not found (default: 0)
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   * @returns The numeric value or default
   */
  getNum(idx: string, defaultValue?: number, dotNotation?: boolean): number;

  /**
   * Get a boolean value by key with a default fallback
   * @param idx - Key name, supports dot notation
   * @param defaultValue - Value to return if key not found (default: false)
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   * @returns The boolean value or default
   */
  getBool(idx: string, defaultValue?: boolean, dotNotation?: boolean): boolean;

  // ============================================================================
  // Type Conversion Methods
  // ============================================================================

  /**
   * Convert this item's value to a string
   * @param defaultValue - Value to return if conversion fails (default: "")
   * @returns The string value or default
   */
  toStr(defaultValue?: string): string;

  /**
   * Convert this item's value to a number
   * @param defaultValue - Value to return if conversion fails (default: 0)
   * @returns The numeric value or default
   */
  toNum(defaultValue?: number): number;

  /**
   * Convert this item's value to a boolean
   * @param defaultValue - Value to return if conversion fails (default: false)
   * @returns The boolean value or default
   */
  toBool(defaultValue?: boolean): boolean;

  // ============================================================================
  // Mutation Methods
  // ============================================================================

  /**
   * Add or update a value in the object/array
   * @param value - The value to add (primitive or FlexJson)
   * @param idx - Key name for objects (ignored for arrays)
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   */
  add(value: string | number | boolean | null | FlexJson, idx?: string, dotNotation?: boolean): void;

  /**
   * Clear the FlexJson object
   * @param clearParent - Also clear the Parent reference (default: true)
   */
  Clear(clearParent?: boolean): void;

  /**
   * Convert this FlexJson from an object to an array
   * Keys are discarded, only values are kept
   */
  ConvertToArray(): void;

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Check if a key exists in the object
   * @param idx - Key name to check, supports dot notation
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   * @returns True if the key exists
   */
  contains(idx: string, dotNotation?: boolean): boolean;

  /**
   * Get the index of a key in the object
   * @param search - Key name to find (case-insensitive)
   * @returns The index, or -1 if not found
   */
  indexOfKey(search: string): number;

  /**
   * Iterate over each item in the object/array
   * @param callback - Function called for each item
   */
  forEach(callback: (item: FlexJson) => void): void;

  /**
   * Get the internal array of child FlexJson items (for objects/arrays)
   * @param idx - Optional key/index to access child first
   * @param dotNotation - If true, split idx by "." for nested access (default: true)
   * @returns Array of FlexJson items, or null
   */
  toJsonArray(idx?: string | number, dotNotation?: boolean): FlexJson[] | null;

  /**
   * Set both keepSpacing and keepComments flags
   * @param spacingFlag - -1=ignore, 0=false, 1=true, or boolean
   * @param commentsFlag - -1=ignore, 0=false, 1=true, or boolean
   */
  keepSpacingAndComments(spacingFlag?: number | boolean, commentsFlag?: number | boolean): void;

  // ============================================================================
  // Static Methods
  // ============================================================================

  /**
   * Create a FlexJson object representing null
   * @returns A new FlexJson with type "null"
   */
  static CreateNull(): FlexJson;
}

export = FlexJson;
