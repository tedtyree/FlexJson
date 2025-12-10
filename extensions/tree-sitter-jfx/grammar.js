/**
 * Tree-sitter grammar for FlexJson (.jfx) files
 * 
 * FlexJson is JSON with:
 * - Line comments (//)
 * - Block comments (/* */)
 * - Single-quoted strings
 * - Unquoted strings (for simple values)
 */

module.exports = grammar({
  name: 'jfx',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  rules: {
    // Entry point
    document: $ => optional($._value),

    // Values
    _value: $ => choice(
      $.object,
      $.array,
      $.string,
      $.number,
      $.true,
      $.false,
      $.null,
      $.unquoted_string,
    ),

    // Object: { key: value, ... }
    object: $ => seq(
      '{',
      optional($.object_content),
      '}',
    ),

    object_content: $ => seq(
      $.pair,
      repeat(seq(',', $.pair)),
      optional(','), // trailing comma allowed
    ),

    pair: $ => seq(
      field('key', $._key),
      ':',
      field('value', $._value),
    ),

    _key: $ => choice(
      $.string,
      $.unquoted_key,
    ),

    unquoted_key: $ => /[a-zA-Z_$][a-zA-Z0-9_$]*/,

    // Array: [ value, ... ]
    array: $ => seq(
      '[',
      optional($.array_content),
      ']',
    ),

    array_content: $ => seq(
      $._value,
      repeat(seq(',', $._value)),
      optional(','), // trailing comma allowed
    ),

    // Strings
    string: $ => choice(
      $.double_quoted_string,
      $.single_quoted_string,
    ),

    double_quoted_string: $ => seq(
      '"',
      repeat(choice(
        $.string_content,
        $.escape_sequence,
      )),
      '"',
    ),

    single_quoted_string: $ => seq(
      "'",
      repeat(choice(
        $.single_string_content,
        $.escape_sequence,
      )),
      "'",
    ),

    string_content: $ => token.immediate(prec(1, /[^"\\\n]+/)),
    
    single_string_content: $ => token.immediate(prec(1, /[^'\\\n]+/)),

    escape_sequence: $ => token.immediate(seq(
      '\\',
      choice(
        /["\\/bfnrt']/,
        /u[0-9a-fA-F]{4}/,
      ),
    )),

    // Unquoted strings (for values only, not containing special chars)
    unquoted_string: $ => /[a-zA-Z_$][a-zA-Z0-9_$.-]*/,

    // Numbers
    number: $ => {
      const decimal_digits = /\d+/;
      const signed_integer = seq(optional('-'), decimal_digits);
      const decimal_integer = choice(
        '0',
        seq(/[1-9]/, optional(decimal_digits)),
      );
      const exponent_part = seq(
        choice('e', 'E'),
        optional(choice('+', '-')),
        decimal_digits,
      );
      return token(seq(
        optional('-'),
        decimal_integer,
        optional(seq('.', decimal_digits)),
        optional(exponent_part),
      ));
    },

    // Literals
    true: $ => 'true',
    false: $ => 'false',
    null: $ => 'null',

    // Comments
    comment: $ => choice(
      $.line_comment,
      $.block_comment,
    ),

    line_comment: $ => token(seq('//', /.*/)),

    block_comment: $ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/',
    )),
  },
});
