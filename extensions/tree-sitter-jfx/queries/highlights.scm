; Highlights for FlexJson (.jfx) files

; Comments
(comment) @comment

; Strings
(double_quoted_string) @string
(single_quoted_string) @string
(unquoted_string) @string
(escape_sequence) @string.escape

; Numbers
(number) @number

; Booleans
(true) @constant.builtin.boolean
(false) @constant.builtin.boolean

; Null
(null) @constant.builtin

; Object keys (property names)
(pair
  key: (string) @property)
(pair
  key: (unquoted_key) @property)

; Punctuation
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
":" @punctuation.delimiter
"," @punctuation.delimiter
