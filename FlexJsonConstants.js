// jsonTypeEnum Values - Numeric representation of jsonType
//NOTE: The NUMBER VALUES are critical to the SORT() routine
//  So that FlexJson arrays get sorted in this order: NULL, Number, String, Boolean, Array, Object, Error
const jsonTypeEnum_null = 0;
const jsonTypeEnum_number = 1;
const jsonTypeEnum_string = 2;
const jsonTypeEnum_boolean = 3;
const jsonTypeEnum_array = 10;
const jsonTypeEnum_object = 11;
const jsonTypeEnum_error = 90;
const jsonTypeEnum_invalid = 99;

// Indicates status of deserialize process.  
// Order of numbers is important! (because we check for _status >= ST_STRING)
const ST_BEFORE_ITEM=0;
const ST_EOL_COMMENT=1;
const ST_AST_COMMENT=2;
const ST_EOL_COMMENT_POST=3;
const ST_AST_COMMENT_POST=4;
const ST_STRING=10;
const ST_STRING_NO_QUOTE=12;
const ST_AFTER_ITEM=99;

const NEWLINE="\r\n";

const typeObject = "object";
const typeArray = "array";
const typeString = "string";
const typeNumber = "number";
const typeBoolean = "boolean";
const typeNull = "null";

module.exports = {
	jsonTypeEnum_null
	,jsonTypeEnum_number
	,jsonTypeEnum_string
	,jsonTypeEnum_boolean
	,jsonTypeEnum_array
	,jsonTypeEnum_object
	,jsonTypeEnum_error
	,jsonTypeEnum_invalid
	,ST_BEFORE_ITEM
	,ST_EOL_COMMENT
	,ST_AST_COMMENT
	,ST_EOL_COMMENT_POST
	,ST_AST_COMMENT_POST
	,ST_STRING
	,ST_STRING_NO_QUOTE
	,ST_AFTER_ITEM
	,NEWLINE
	,typeObject
	,typeArray
	,typeString
	,typeNumber
	,typeBoolean
	,typeNull
}
