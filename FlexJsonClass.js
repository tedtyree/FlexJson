const FlexJsonConstants = require("./FlexJsonConstants.js");
const FlexJsonPosition = require("./FlexJsonPosition.js");
const FlexJsonMeta = require("./FlexJsonMeta.js");
const fs = require("fs");
const StringBuilder = require("string-builder");
const { trackingStats, statusMsg,tmpStatusMsg } = require( "./get/index.js");

class FlexJson {
  _status = 0;
  _jsonType = "";
  _key = null;
  _value = null;
  _value_valid = false;
  _jsonString = "";
  _jsonString_valid = false;

  Parent;
  ALLOW_SINGLE_QUOTE_STRINGS = true;
  ENCODE_SINGLE_QUOTES = false;

  _UseFlexJson = false;

  _meta = null;
  _NoStatsOrMsgs = false;

  constructor(InitialJSON, UseFlexJsonFlag) {
    if (UseFlexJsonFlag == true || UseFlexJsonFlag == false) {
      this.UseFlexJson = UseFlexJsonFlag;
    }
    if (InitialJSON) {
      this.Deserialize(InitialJSON + "", 0, false);
    }
  }

  createMetaIfNeeded(force = false) {
    if (this._NoStatsOrMsgs && !force) {
      return;
    } // Do not track stats/message/meta-data
    if (!this._meta) {
      this._meta = {};
    }
  }

  // get trackingStats() {
  //   if (this._meta == null) return false;
  //   if (this._meta.stats == null) return false;
  //   return true;
  // }
  // use the imported trackingStats function instead

  get trackingStats() {
    return trackingStats(this._meta);
  }


  get statusMsg() {
    // if (this._meta != null) {
    //   if (this._meta.statusMsg != null) {
    //     return this._meta.statusMsg;
    //   }
    // }
    // return "";
    return statusMsg(this._meta || "");
  }
  set statusMsg(value) {
    if (this.NoStatsOrMsgs) {
      return;
    }
    this.createMetaIfNeeded();
    if (this._meta != null) {
      this._meta.statusMsg = value;
    }
    if (this._meta.msgLogOn) {
      if (this._meta != null) {
        this._meta.msgLog.add(value);
      }
    }
  }

  get tmpStatusMsg() {
    // if (this._meta != null) {
    //   if (this._meta.tmpStatusMsg != null) {
    //     return this._meta.tmpStatusMsg;
    //   }
    // }
    // return "";
    return tmpStatusMsg(this._meta || "");
  }
  set tmpStatusMsg(value) {
    this.createMetaIfNeeded();
    if (_meta != null) {
      _meta.tmpStatusMsg = value;
    }
  }

  get key() {
    return this._key;
  }

  set key(value) {
    this._key = "" + value; // convert to string (future: allow numeric key?)
  }

  get preSpace() {
    //if (this._meta != null) {
    //  if (this._meta.preSpace != null) {
    //    return this._meta.preSpace;
    //  }
    //}
    return (this._meta && this._meta.preSpace)?this._meta.preSpace:null;
  }

  set preSpace(value) {
    this.createMetaIfNeeded();
    if (this._meta != null) {
      this._meta.preSpace = value;
    }
  }

  get postSpace() {
    //if (this._meta != null) {
    //  if (this._meta.postSpace != null) {
    //    return this._meta.postSpace;
    //  }
    //}
    return (this._meta && this._meta.postSpace)?this._meta.postSpace:null;
  }

  set postSpace(value) {
    this.createMetaIfNeeded();
    if (this._meta != null) {
      this._meta.postSpace = value;
    }
  }

  get finalSpace() {
    if (this._meta != null) {
      if (this._meta.finalSpace != null) {
        return this._meta.finalSpace;
      }
    }
    return null;
  }

  set finalSpace(value) {
    this.createMetaIfNeeded();
    if (this._meta != null) {
      this._meta.finalSpace = value;
    }
  }

  get preKey() {
    if (this._meta != null) {
      if (this._meta.preKey != null) {
        return this._meta.preKey;
      }
    }
    return null;
  }

  set preKey(value) {
    this.createMetaIfNeeded();
    if (this._meta != null) {
      this._meta.preKey = value;
    }
  }

  get postKey() {
    if (this._meta != null) {
      if (this._meta.postKey != null) {
        return this._meta.postKey;
      }
    }
    return null;
  }

  set postKey(value) {
    this.createMetaIfNeeded();
    if (this._meta != null) {
      this._meta.postKey = value;
    }
  }

  get keepSpacing() {
    if (this._meta != null) {
      return this._meta.keepSpacing || false;
    }
    return false;
  }
  set keepSpacing(value) {
    this.createMetaIfNeeded();
    if (this._meta != null) {
      this._meta.keepSpacing = value;
    }
  }

  get keepComments() {
    if (this._meta != null) {
      return this._meta.keepComments || false;
    }
    return false;
  }
  set keepComments(value) {
    this.createMetaIfNeeded();
    if (this._meta != null) {
      this._meta.keepComments = value;
    }
  }

  get UseFlexJson() {
    return this._UseFlexJson;
  }
  set UseFlexJson(value) {
    this._UseFlexJson = value;
    this.InvalidateJsonString(1); // If we switch to FlexJson then all our stored JSON strings could be incorrect.
  }

  get Status() {
    return this._status;
  } // End Property

  get jsonType() {
    return this._jsonType;
  }

  get jsonString() {
    // if (trackingStats) { IncStats("stat_jsonString_get"); }
    if (this._status != 0) {
      return "";
    } // *** ERROR - status is invalid
    if (!this._jsonString_valid) {
      if (!this._value_valid) {
        // *** Neither is valid - this JSON object is null
        return "";
      } else {
        // *** First we need to serialize
        this.SerializeMe();
        if (this._status != 0) {
          return "";
        } // *** ERROR - status is invalid
        return this._jsonString;
      }
    } else {
      // jsonString was already valid.
      return this._jsonString;
    }
  } // end getJsonString()

  set jsonString(value) {
    //if (trackingStats) { IncStats("stat_jsonString_set"); }
    if (
      this._status == 0 &&
      this._jsonString_valid &&
      this._jsonString == value
    ) {
      return;
    } else {
      this.Clear(false, 1); // *** This clears _value AND notifies Parent that we have changed.
      this._jsonString = value;
      this._jsonString_valid = true; // *** This does not indicate 'valid JSON syntax' but only that the string has been populated.
    }
  } //End Set jsonString

  // Gets Array.Length or Dictionary.Count for array/object.  Gets 1 for all other types (string, number, null, etc.)  Returns 0 if _value is not valid.
  get length() {
    if (this._status != 0 || !this._value_valid) {
      return 0;
    }
    if (this._jsonType == "null") {
      return 0;
    }
    if (this._jsonType != "array" && this._jsonType != "object") {
      return 1;
    }
    // otherwise we are a _jsonType="object" or _jsonType="array"
    try {
      return this._value.length;
    } catch {
      return -1;
    } //Error occurred... return -1 to indicate an error
  }
  // There is no "set" for length

  Clear(ClearParent = true, src = 0, bClearStats = false) {
    this._status = 0;
    this._jsonType = "";
    this._value = null;
    this._value_valid = false;
    this.InvalidateJsonString(src); // *** Resets _jsonString and _jsonString_valid (and notifies Parent of changes)
    this.endpos = 0;
    if (ClearParent) {
      this.Parent = null;
    }
  } // end Clear()

  InvalidateJsonString(src = 0) {
    this._jsonString = "";
    this._jsonString_valid = false;
    // *** if our jsonString is invalid, { the PARENT jsonString would also be invalid
    if (!(this.Parent == null)) {
      this.Parent.InvalidateJsonString(2);
    }
  } // end InvalidateJsonString()

  keepSpacingAndComments(spacing_flag = -1, comments_flag = -1) {
    if (typeof spacing_flag == "boolean") {
      this.keepSpacing = spacing_flag;
    } else {
      if (spacing_flag == 0) {
        this.keepSpacing = false;
      }
      if (spacing_flag == 1) {
        this.keepSpacing = true;
      }
    }
    if (typeof comments_flag == "boolean") {
      this.keepComments = comments_flag;
    } else {
      if (comments_flag == 0) {
        this.keepComments = false;
      }
      if (comments_flag == 1) {
        this.keepComments = true;
      }
    }
  }

  ValidateValue() {
    if (this._status != 0) {
      return false;
    } // *** ERROR - status is invalid
    if (!this._value_valid) {
      if (!this._jsonString_valid) {
        // *** Neither is valid - this JSON object is null - Cannot validate value
        return false;
      } else {
        // *** First we need to Deserialize
        DeserializeMe();
        if (this._status != 0) {
          return false;
        } // *** ERROR - status is invalid - failed to Deserialize
        return true;
      }
    } else {
      return true;
    }
  }

  value(idx, dotNotation = true) {
    return this.v(idx, dotNotation);
  }

  v(idx, dotNotation = true) {
    //if (trackingStats) { IncStats("stat_Value_get"); } // FUTURE-NEW
    if (!idx) {
      // return the value of this item
      if (!this.ValidateValue()) {
        return null;
      } // *** Unable to validate/Deserialize the value
      // If object or array, return null
      if (this._jsonType == "object" || this._jsonType == "array") {
        return null;
      } // FUTURE-NEW: return object/array converted into javascript object/array? (indicate iteration level in method parameters)
      return this._value;
    } else {
      return this.i(idx, dotNotation).v();
    }
  }

  get thisValue() {
    return this.v();
  }
  set thisValue(value) {
    // sets the value of the FlexJson object and the jsonType
    this.InvalidateJsonString(); // indicate that the JsonString has changed
    this._status = 0;
    this._jsonType = this.convertType(value);
    if (this._jsonType == "string") {
      this._value = value + ""; // force conversion to string
      this._value_valid = true;
    } else if (this._jsonType) {
      this._value = value;
      this._value_valid = true;
    } else {
      this._jsonType = "error";
      this._value = null;
      this._value_valid = false;
    }
  }

  toJsonArray(idx, dotNotation = true) {
    //if (trackingStats) { IncStats("stat_Value_get"); } // FUTURE-NEW
    if (!idx) {
      // return the value of this item
      if (!this.ValidateValue()) {
        return null;
      } // *** Unable to validate/Deserialize the value
      // If object or array, return null
      if (this._jsonType == "object" || this._jsonType == "array") {
        return this._value;
      } // FUTURE-NEW: return object/array converted into javascript object/array? (indicate iteration level in method parameters)
      return null;
    } else {
      return this.i(idx, dotNotation).toJsonArray();
    }
    return null;
  }

  ConvertToArray() {
    // convert this FlexJson from an Object to an Array
    // We can do this because the only real different between an array and an object is that the object has key values.
    if (this._jsonType != "object") {
      return;
    }
    this._jsonType = "array";
    this.InvalidateJsonString();
  }

  item(idx, dotNotation = true) {
    return this.i(idx, dotNotation);
  }
  i(idx, dotNotation = true) {
    //if (trackingStats) { IncStats("stat_Item_get"); } // FUTURE-NEW

    if (Number.isInteger(idx)) {
      if (this.jsonType != "array" && this.jsonType != "object") {
        return FlexJson.CreateNull();
      }
      if (idx < 0 || idx > this.length) {
        return null;
      } // error: we are past the end of the array/object
      return this._value[idx];
    }

    var searchList;
    let nextItem = this;
    let k = -99; // tells loop not to perform 'next' function
    if (dotNotation) {
      searchList = idx.split(".");
    } else {
      searchList = [idx];
    }

    for (let sToken of searchList) {
      let sKey = sToken.trim();
      k = -1;
      // Note: missing sKey causes failure to find item FUTURE: should we throw an error?
      if (
        sKey &&
        (nextItem._jsonType == "object" || nextItem._jsonType == "array")
      ) {
        let nKey = null;
        try {
          nCheck = parseInt(sKey);
          if (!isNaN(nCheck)) {
            nKey = nCheck;
          }
        } catch (Exception) {}
        if (nKey) {
          if (nKey < 0 || nKey >= this._value.length) {
            break;
          }
          k = nKey;
        } else {
          if (nextItem._jsonType == "object") {
            k = nextItem.indexOfKey(sKey);
          } else {
            // type array: error because IDX for an array must be an integer
            // FUTURE - throw error here?
            break;
          }
        }
      }
      if (k < 0) {
        break;
      }
      nextItem = nextItem._value[k];
    }
    if (k < 0) {
      return FlexJson.CreateNull();
    } // NOTE! You can check that there is no PARENT on this null object to see that it was NOT-FOUND

    return nextItem;
  }

  forEach(callback) {
    if (this.jsonType == "object" || this.jsonType == "array") {
      for (let i = 0; i < this.length; i++) {
        callback(this.i(i));
      } // end for
    } else {
      callback(this); // if we are not an object/array, then callback one time for this object
      // FUTURE: Should we call back 0 times if we are a NULL or status!=0?
    }
  } // end forEach()

  // This replaces addToObjBase and addToArrayBase (if array, second argument is not needed)
  addToBase(value, idx = "") {
    this.add(value, idx, false);
  }

  add(value, idx = "", dotNotation = true) {
    var newV;
    if (
      value !== null &&
      typeof value === "object" &&
      value.constructor.name === "FlexJson"
    ) {
      newV = value; // FUTURE: clone?
    } else {
      newV = new FlexJson();
      newV.thisValue = value; // This also sets the jsonType
    }
    newV.Parent = this;

    // Can only add to an Object or Array
    if (this._jsonType == "object") {
      let foundItem = this.i(idx, dotNotation);
      if (foundItem.Parent) {
        // Item exists... replace the value
        foundItem.thisValue = value; // this also sets jsonType
        this.InvalidateJsonString(); // indicate that the JsonString has changed.
      } else {
        this.InvalidateJsonString(); // indicate that the JsonString has changed.
        // Item does not exist... we need to add the item (be aware of dotNotation)
        if (dotNotation && idx.indexOf(".") >= 0) {
          // FUTURE: WHAT TO DO HERE!!
        } else {
          newV.key = idx;
          this._value.push(newV);
          //}
        } // else
      } // else
    } else if (this._jsonType == "array") {
      this.InvalidateJsonString(); // indicate that the JsonString has changed.
      // Always push array value onto the end of the array
      newV.key = "";
      this._value.push(newV);
    } else {
      throw "ERROR: add() is only available for FlexJson object or array types.";
    }
  }

  indexOfKey(Search) {
    if (Search == null) {
      return -1;
    }
    let s = Search.toLowerCase();
    if (!this.ValidateValue()) {
      return -1;
    }
    if (this._jsonType != "object") {
      return -1;
    } // Future: do we want to search for values here?  probably not.  Implement IndexOf for search of values?
    let k = 0;
    // NOTE: Here we do a linear search.  FUTURE: if list is sorted, do a binary search.
    for (let o of this._value) {
      try {
        if (o._key.toLowerCase() == s) {
          return k;
        }
      } catch {}
      k++;
    }
    return -1;
  }

  contains(idx, dotNotation = true) {
    let foundItem = this.i(idx, dotNotation);
    if (foundItem.Parent) {
      return true;
    } else {
      return false;
    }
  }

  getStr(idx, defaultValue = "", dotNotation = true) {
    let foundItem = this.i(idx, dotNotation);
    if (foundItem.Parent) {
      return foundItem.toStr(defaultValue);
    } else {
      return defaultValue;
    }
  }

  getNum(idx, defaultValue = 0, dotNotation = true) {
    // FUTURE-NEW: is there a more efficient way?
    let foundItem = this.i(idx, dotNotation);
    if (foundItem.Parent) {
      return foundItem.toNum(defaultValue);
    } else {
      return defaultValue;
    }
  }

  getBool(idx, defaultValue = false, dotNotation = true) {
    // FUTURE-NEW: is there a more efficient way?
    let foundItem = this.i(idx, dotNotation);
    if (foundItem.Parent) {
      return foundItem.toBool(defaultValue);
    } else {
      return defaultValue;
    }
  }

  toStr(defaultValue = "") {
    if (this._status != 0) {
      return defaultValue;
    } // Invalid status
    if (!this._value_valid) {
      return defaultValue;
    }
    if (this._jsonType == FlexJsonConstants.typeString) {
      return this._value;
    }
    if (
      this._jsonType == FlexJsonConstants.typeNull ||
      this._jsonType == FlexJsonConstants.typeObject ||
      this._jsonType == FlexJsonConstants.typeArray
    ) {
      return defaultValue;
    }
    return this._value + "";
  }

  toNum(defaultValue = "") {
    if (this._status != 0) {
      return defaultValue;
    } // Invalid status
    if (!this._value_valid) {
      return defaultValue;
    }
    if (this._jsonType == FlexJsonConstants.typeNumber) {
      return this._value;
    }
    if (
      this._jsonType == FlexJsonConstants.typeNull ||
      this._jsonType == FlexJsonConstants.typeObject ||
      this._jsonType == FlexJsonConstants.typeArray
    ) {
      return defaultValue;
    }
    return Number(this._value);
  }

  toBool(defaultValue = "") {
    if (this._status != 0) {
      return defaultValue;
    } // Invalid status
    if (!this._value_valid) {
      return defaultValue;
    }
    if (this._jsonType == FlexJsonConstants.typeBoolean) {
      return this._value;
    }
    if (
      this._jsonType == FlexJsonConstants.typeNull ||
      this._jsonType == FlexJsonConstants.typeObject ||
      this._jsonType == FlexJsonConstants.typeArray
    ) {
      return defaultValue;
    }
    return this.parseBoolean(this._value);
  }

  parseBoolean(v) {
    return !v || v === "false" || v === "False" || v === "FALSE" ? false : true;
  }

  static CreateNull() {
    let j = new FlexJson();
    j._value = null;
    j._jsonType = "null";
    j._value_valid = true;
    j._jsonString = "null";
    j._jsonString_valid = true;
    j._status = 0;
    return j;
  }

  // SerializeMe() - Use this to Serialize the items that are already in the FlexJson object.
  // Return: 0=OK, -1=Error
  SerializeMe() {
    let s = new StringBuilder();
    let i = 0;
    let k = 0;
    let preKey = "";
    let postKey = "";
    //if (this.trackingStats) { IncStats("stat_SerializeMe"); }
    if (this._status != 0) {
      return -1;
    }
    if (!this.ValidateValue()) {
      return -1;
    }
    try {
      let preSpace = this.preSpace;
      if (preSpace) {
        // Here we ignore keepSpacing/keepComments - these flags are only used during the deserialize process
        s.append(preSpace); // preSpace of overall object/array or item
      }
      switch (this._jsonType) {
        case "object":
          s.append("{");
          i = 0;
          this._value.forEach((o) => {
            if (i > 0) {
              s.append(",");
            }
            let k = o.SerializeMe();

            // Here we ignore keepSpacing/keepComments - these flags are only used during the deserialize process
            // preSpace and postSpace are already added during the SerializeMe() call above.  Here we add preKye and postKey.
            let oPreKey = o.preKey || "";
            let oPostKey = o.postKey || "";

            if (k == 0 && o.Status == 0) {
              s.append(
                oPreKey +
                  '"' +
                  o.key.toString() +
                  '"' +
                  oPostKey +
                  ":" +
                  o.jsonString
              );
            } else {
              this._status = -53;
              this.AddStatusMessage(
                "ERROR: Failed to serialize Object item " +
                  i +
                  " [err-53][" +
                  o.Status +
                  ":" +
                  o.StatusMessage +
                  "]"
              );
              return -1;
            }
            i++;
          }); // end foreach
          s.append("}");
          break;
        case "array":
          s.append("[");
          i = 0;
          this._value.forEach((o) => {
            if (i > 0) {
              s.append(",");
            }
            k = o.SerializeMe();
            if (k == 0 && o.Status == 0) {
              s.append(o.jsonString);
            } else {
              this._status = -52;
              this.AddStatusMessage(
                "ERROR: Failed to serialize Array item " + i + " [err-52]"
              );
              return -1;
            }
            i++;
          });
          s.append("]");
          break;
        case "null":
          s.append("null");
          break;
        case "string":
          s.append('"' + this.EncodeString(this.toStr()) + '"');
          break;
        default:
          s.append(this.toStr()); // FUTURE: better approach? seems prone to problems
          break;
      }
      let postSpace = "" + (this.postSpace || "") + (this.finalSpace || "");
      if (postSpace) {
        s.append(postSpace);
      }
      this._jsonString = s.toString();
      this._jsonString_valid = true;
    } catch (err94) {
      this._jsonString = "";
      this.InvalidateJsonString(1);
      this._status = -94;
      // FUTURE: Remove err94.message below?
      this.AddStatusMessage(
        "ERROR: SerializeMe() failed to serialize the FlexJson object. [err-94] " +
          err94.message
      );
      return -1;
    }
    return 0;
  } // end SerializeMe()

  EncodeString(vString = "") {
    let s;
    // *** NOTE: This is a simple encode.  It needs to be expanded in the future!
    s = vString;
    s = s.replace(/\\/g, "\\\\"); // **** NOTE: THIS MUST BE FIRST (so we do not double-escape the items below!)
    s = s.replace(/\t/g, "\\t");
    s = s.replace(/\n/g, "\\n");
    s = s.replace(/\r/g, "\\r");
    s = s.replace(/"/g, '\\"');
    if (this.ENCODE_SINGLE_QUOTES) {
      s = s.replace(/'/g, "\\'");
    }
    return s;
  } // End Function

  Deserialize(snewString, start = 0, OkToClip = false) {
    if (this.trackingStats) {
      IncStats("stat_Deserialize");
    }
    this.Clear(false, 1);
    this._jsonString = snewString;
    this._jsonString_valid = true;

    let startPos = new FlexJsonPosition(0, start, start);
    // FUTURE: determine start position LINE COUNT???
    // if (start>0) { lineCount = countLines(ref _jsonString, start); }

    this.DeserializeMeI(this._jsonString, startPos, OkToClip);
    return this._status;
  } // End Function

  DeserializeFlex(snewString, start = 0, OkToClip = false) {
    this.UseFlexJson = true;
    this.Deserialize(snewString, start, OkToClip);
    return this._status;
  } // End Function

  DeserializeMeI(
    meJsonString,
    start,
    OkToClip = false,
    MustBeString = false,
    SearchFor1 = "*",
    SearchFor2 = "*",
    SearchFor3 = "*"
  ) {
    var c;
    var c2;
    let getSpace = "";
    let meString = "";
    //if (trackingStats) { IncStats("stat_DeserializeMeI"); } // FUTURE-NEW
    this._status = 0;
    this.StartPosition = start.clone(); // store in meta (if ok to do so)
    let meStatus = FlexJsonConstants.ST_BEFORE_ITEM;
    let quoteChar = "";
    this._key = null; // *** Default
    this._value = null; // *** Default
    this._value_valid = false; // *** In case of error, default is invalid
    this._jsonType = FlexJsonConstants.typeNull; // default
    let jsonEndPoint = meJsonString.length - 1;

    let mePos = start.clone(); // FlexJsonPosition USE THIS TO TRACK POSITION, THEN SET endpos ONCE DONE OR ON ERROR
    let keepSP = this.keepSpacing;
    let keepCM = this.keepComments;

    //FlexJsonPosition startOfMe = null;
    let safety = jsonEndPoint + 999;
    let ok = false;
    let breakBreak = false;
    let storeStatus = FlexJsonConstants.ST_BEFORE_ITEM; // should not matter, but just in case
    while (
      meStatus >= 0 &&
      this._status >= 0 &&
      mePos.absolutePosition <= jsonEndPoint
    ) {
      c = meJsonString.charAt(mePos.absolutePosition);
      if (mePos.absolutePosition < jsonEndPoint) {
        c2 = meJsonString.substr(mePos.absolutePosition, 2);
      } else {
        c2 = "";
      }

      switch (meStatus) {
        case FlexJsonConstants.ST_BEFORE_ITEM:
          if (SearchFor1 != "*" && c == SearchFor1) {
            breakBreak = true;
            break;
          } // Found search character
          if (SearchFor2 != "*" && c == SearchFor2) {
            breakBreak = true;
            break;
          } // Found search character
          if (SearchFor3 != "*" && c == SearchFor3) {
            breakBreak = true;
            break;
          } // Found search character
          if (c == " " || c == "\t" || c == "\n" || c == "\r") {
            // white space before item
            ok = true;
            if (keepSP) {
              getSpace += c;
            }
          } else if (c == "{") {
            if (MustBeString) {
              this._status = -124;
              this.AddStatusMessage(
                "Invalid character '{' found. Expected string. @Line:" +
                  mePos.lineNumber +
                  ", @Position:" +
                  mePos.linePosition +
                  " [err-124]"
              );
              breakBreak = true;
              break;
            }
            ok = true;
            //startOfMe=mePos;
            this._jsonType = FlexJsonConstants.typeObject;
            mePos = this.DeserializeObject(meJsonString, mePos, keepSP, keepCM);
            meStatus = FlexJsonConstants.ST_AFTER_ITEM;
            if (this._status != 0) {
              breakBreak = true;
              break;
            } // ERROR message should have already been generated.
          } else if (c == "[") {
            if (MustBeString) {
              this._status = -125;
              this.AddStatusMessage(
                "Invalid character '[' found. Expected string. @Line:" +
                  mePos.lineNumber +
                  ", @Position:" +
                  mePos.linePosition +
                  " [err-125]"
              );
              breakBreak = true;
              break;
            }
            ok = true;
            //startOfMe=mePos;
            this._jsonType = FlexJsonConstants.typeArray;
            mePos = this.DeserializeArray(meJsonString, mePos, keepSP, keepCM);
            meStatus = FlexJsonConstants.ST_AFTER_ITEM;
            if (this._status != 0) {
              breakBreak = true;
              break;
            } // ERROR message should have already been generated.
          } else if (c == '"') {
            ok = true;
            //startOfMe=mePos;
            this._jsonType = FlexJsonConstants.typeString;
            quoteChar = '"';
            this._stringQuote = '"';
            meStatus = FlexJsonConstants.ST_STRING;
          } else if (this.ALLOW_SINGLE_QUOTE_STRINGS && c == "'") {
            ok = true;
            //startOfMe=mePos;
            this._jsonType = FlexJsonConstants.typeString;
            quoteChar = "'";
            this._stringQuote = "'";
            meStatus = FlexJsonConstants.ST_STRING;
          } else if (this._UseFlexJson) {
            if (c2 == "//") {
              // start of to-end-of-line comment
              ok = true;
              meStatus = FlexJsonConstants.ST_EOL_COMMENT;
              mePos.increment(); // so we skip 2 characters
              if (keepCM) {
                getSpace += c2;
              }
            }
            if (c2 == "/*") {
              // start of asterix comment
              ok = true;
              meStatus = FlexJsonConstants.ST_AST_COMMENT;
              mePos.increment(); // so we skip 2 characters
              if (keepCM) {
                getSpace += c2;
              }
            }
          }
          // With or without FlexJSON, we allow simple strings without quotes - cannot contain commas, spaces, special characters, etc
          // Later we will determine if this is a number, boolean, null, or unquoted-string (string is only allowed with FlexJSON)
          if (
            (c >= "A" && c <= "Z") ||
            (c >= "a" && c <= "z") ||
            (c >= "0" && c <= "9") ||
            c == "-" ||
            c == "_" ||
            c == "."
          ) {
            ok = true;
            //startOfMe=mePos;
            this._jsonType = "nqstring"; // NOTE! THIS IS NOT A REAL TYPE - IT IS A FLAG FOR LATER
            this._stringQuote = " ";
            meStatus = FlexJsonConstants.ST_STRING_NO_QUOTE;
          }
          if (!ok) {
            // generate error condition - invalid character
            this._status = -102;
            this.AddStatusMessage("ERROR: Invalid charater.  [err-102]");
            breakBreak = true;
            break;
          }
          // if we are no longer in pre-space territory, the we need to store the whitespace/comments
          if (meStatus >= FlexJsonConstants.ST_STRING) {
            if (keepCM || keepSP) {
              this.preSpace = getSpace;
              getSpace = ""; // clear
            }
          }
          if (
            meStatus == FlexJsonConstants.ST_STRING ||
            meStatus == FlexJsonConstants.ST_STRING_NO_QUOTE
          ) {
            meString = "";
            if (c != '"' && c != "'") {
              meString += c;
            }
          }
          break;
        case FlexJsonConstants.ST_AFTER_ITEM:
          if (SearchFor1 != "*" && c == SearchFor1) {
            breakBreak = true;
            break;
          } // Found search character
          if (SearchFor2 != "*" && c == SearchFor2) {
            breakBreak = true;
            break;
          } // Found search character
          if (SearchFor3 != "*" && c == SearchFor3) {
            breakBreak = true;
            break;
          } // Found search character
          if (c == " " || c == "\t" || c == "\n" || c == "\r") {
            // white space before item
            ok = true;
            if (keepSP) {
              getSpace += c;
            }
          }
          if (this._UseFlexJson) {
            if (c2 == "//") {
              // start of to-end-of-line comment
              ok = true;
              storeStatus = meStatus;
              meStatus = FlexJsonConstants.ST_EOL_COMMENT_POST;
              mePos.increment(); // so we skip 2 characters
              if (keepCM) {
                getSpace += c2;
              }
            }
            if (c2 == "/*") {
              // start of asterix comment
              ok = true;
              storeStatus = meStatus;
              meStatus = FlexJsonConstants.ST_AST_COMMENT_POST;
              mePos.increment(); // so we skip 2 characters
              if (keepCM) {
                getSpace += c2;
              }
            }
          }
          if (!ok) {
            // generate error condition (unless OKToClip)
            if (OkToClip) {
              // if we are keeping comments+ then we should probably grab this garbage text
              // This will allow us to modify a FlexJSON text file/block and write it back "AS IS"
              if (keepCM) {
                let finalGarbage = meJsonString.substr(
                  mePos.absolutePosition,
                  meJsonString.length - mePos.absolutePosition
                );
                getSpace += finalGarbage;
              }
              breakBreak = true;
              break;
            }
            this._status = -192;
            this.AddStatusMessage(
              "ERROR: Additional text found after end of JSON.  [err-192]"
            );
            breakBreak = true;
            break;
          }
          break;
        case FlexJsonConstants.ST_EOL_COMMENT:
        case FlexJsonConstants.ST_EOL_COMMENT_POST:
          if (c2 == FlexJsonConstants.NEWLINE) {
            ok = true;
            if (keepSP) {
              getSpace += c2;
            }
            meStatus = storeStatus;

            mePos.incrementLine(2);
            continue; // NOTE: Here we must skip the end of the do loop so that we do not increment the counter again
          } else if (c == "\n" || c == "\r") {
            ok = true;
            if (keepSP) {
              getSpace += c;
            }
            meStatus = storeStatus;
          } else {
            // absorb all comment characters
            ok = true;
            if (keepSP) {
              getSpace += c;
            }
          }
          break;
        case FlexJsonConstants.ST_AST_COMMENT:
        case FlexJsonConstants.ST_AST_COMMENT_POST:
          if (c2 == "*/") {
            ok = true;
            if (keepSP) {
              getSpace += c2;
            }
            meStatus = storeStatus;

            mePos.increment(); // increment by 1 here - increments again at bottom of do loop
          } else {
            // absorb all comment characters
            ok = true;
            if (keepSP) {
              getSpace += c;
            }
          }
          break;
        case FlexJsonConstants.ST_STRING:
          if (c == quoteChar) {
            // we reached the end of the string
            ok = true;
            meStatus = FlexJsonConstants.ST_AFTER_ITEM;
          } else if (c == "\\") {
            // escaped character
            mePos.increment();
            c = meJsonString[mePos.absolutePosition];
            switch (c) {
              case "\\":
              case "/":
              case "'":
              case '"':
                meString += c;
                break;
              case "t":
                meString += "\t"; //Tab character
                break;
              case "b":
                meString += Convert.ToChar(8);
                break;
              case "c":
                meString += Convert.ToChar(13);
                break;
              case "n":
                meString += "\n"; //New Line Character
                break;
              case "r":
                meString += "\r"; //LineFeedCarriageReturn
                break;
              case "v":
                meString += "*"; // ***** FUTURE: Need to determine this character!
                break;
              case "u":
                // *** Here we need to get the next 4 digits and turn them into a character
                if (mePos.absolutePosition > jsonEndPoint - 4) {
                  this._status = -157;
                  this.AddStatusMessage(
                    "ERROR: Invalid \\u escape sequence.  [err-157]"
                  );
                  breakBreak = true;
                  break;
                }
                c2 = substr(meJsonString, mePos.absolutePosition + 1, 4);
                if (IsHex4(c2)) {
                  // FUTURE-NEW!!! FIX THIS! TODO - NOW- PROBLEM!!!
                  let asciiValue = "####"; //System.Convert.ToChar(System.Convert.ToUInt32(c, 16)) + "";
                  meString += asciiValue;
                  mePos.increment(4);
                } else {
                  // *** Invalid format
                  this._status = -151;
                  this.AddStatusMessage(
                    "Expected \\u escape sequence to be followed by a valid four-digit hex value @Line:" +
                      mePos.lineNumber +
                      " @Position:" +
                      mePos.linePosition +
                      " (e-151)"
                  );
                  breakBreak = true;
                  break;
                }
                break;
              default:
                // *** Invalid format
                this._status = -152;
                this.AddStatusMessage(
                  "The \\ escape character is not followed by a valid value @Line:" +
                    mePos.lineNumber +
                    " @Position:" +
                    mePos.linePosition +
                    " (e-152)"
                );
                breakBreak = true;
                break;
            } //End switch
          } else {
            meString += c;
          }
          break;
        case FlexJsonConstants.ST_STRING_NO_QUOTE:
          if (SearchFor1 != "*" && c == SearchFor1) {
            breakBreak = true;
            break;
          } // Found search character
          if (SearchFor2 != "*" && c == SearchFor2) {
            breakBreak = true;
            break;
          } // Found search character
          if (SearchFor3 != "*" && c == SearchFor3) {
            breakBreak = true;
            break;
          } // Found search character
          if (
            (c >= "A" && c <= "Z") ||
            (c >= "a" && c <= "z") ||
            (c >= "0" && c <= "9") ||
            c == "-" ||
            c == "_" ||
            c == "."
          ) {
            ok = true;
            meString += c;
          } else if (c2 == FlexJsonConstants.NEWLINE) {
            // consume this as whitespace
            ok = true;
            if (keepSP) {
              getSpace += c2;
            }
            mePos.incrementLine(2);
            meStatus = FlexJsonConstants.ST_AFTER_ITEM;
            continue; // so that we do not increment mePos again
          } else if (c == " " || c == "\t" || c == "\r" || c == "\n") {
            // consume this as whitespace
            ok = true;
            if (keepSP) {
              getSpace += c;
            }
            meStatus = FlexJsonConstants.ST_AFTER_ITEM;
          } else {
            // not a valid character
            this._status = -159;
            this.AddStatusMessage(
              "Invalid character found in non-quoted string: char:[" +
                c +
                "] @Line:" +
                mePos.lineNumber +
                " @Position:" +
                mePos.linePosition +
                " (e-159)"
            );
            breakBreak = true;
            break;
          }
          break;
      }
      if (breakBreak) {
        break;
      }
      // move to next character
      if (c == "\n") {
        mePos.incrementLine(1);
      } else {
        mePos.increment();
      }
      safety--;
      if (safety <= 0) {
        this._status = -169;
        this.AddStatusMessage(
          "Maximum iterations reached: DeserializeMe(): @Line:" +
            mePos.lineNumber +
            " @Position:" +
            mePos.linePosition +
            " (e-169)"
        );
        break;
      }
    }

    if (this._status == 0) {
      switch (this._jsonType) {
        case FlexJsonConstants.typeString:
          this._value = meString;
          break;
        case "nqstring": // NOTE! This is objType must be converted to another type here! nqstring is not a real type.
          let tmpString = meString; // do not need to trim since we should have consumed the whitespace in getSpace
          if (!MustBeString) {
            if (tmpString.length < 7) {
              var tmpStringUpper = tmpString.trim().toUpperCase();
              if (tmpStringUpper == "" || tmpStringUpper == "NULL") {
                this._value = "";
                this._jsonType = FlexJsonConstants.typeNull;
              } else if (tmpStringUpper == "TRUE") {
                this._value = true;
                this._jsonType = FlexJsonConstants.typeBoolean;
              } else if (tmpStringUpper == "FALSE") {
                this._value = false;
                this._jsonType = FlexJsonConstants.typeBoolean;
              }
            }
            // If the above did not match, lets see if this text is numeric...
            if (this._jsonType == "nqstring") {
              try {
                valueCheck = parseFloat(tmpString);
                if (!isNaN(valueCheck)) {
                  this._value = valueCheck;

                  // It worked... keep going...
                  this._jsonType = FlexJsonConstants.typeNumber;
                }
              } catch (Exception) {}
            }
          }
          // If STILL not identified, then it must be a STRING (ONLY valid as an unquoted string if using FlexJson!)
          if (this._jsonType == "nqstring") {
            this._value = tmpString;
            this._jsonType = FlexJsonConstants.typeString;
            if (!this._UseFlexJson) {
              // ERROR: we found an unquoted string and we are not using FlexJson
              // NOTE! Error occurred at the START of this item
              this._status = -199;
              this.AddStatusMessage(
                "Encountered unquoted string: @Line:" +
                  start.lineNumber +
                  " @Position:" +
                  start.linePosition +
                  " (e-199)"
              );
            }
          }
          break;
        // NOTE: other cases fall through: object, array, null(default if nothing found)
      } // end switch
    } // end if (this._status != 0)

    // indicate if the new _value is valid
    if (this._status == 0) {
      this._value_valid = true;
    } else {
      this._value_valid = false;
    }

    // Store original JSON string and mark as "valid"
    if (this._status == 0) {
      this._jsonString = meJsonString.substr(
        start.absolutePosition,
        mePos.absolutePosition - start.absolutePosition
      );
      this._jsonString_valid = true;
    } else {
      this._jsonString = meJsonString;
      this._jsonString_valid = false;
    }
    if (getSpace != null) {
      this.finalSpace = getSpace;
    }
    this.EndPosition = mePos;

    return mePos;
  }

  CreatePartClone(keepSP = false, keepCM = false) {
    let jClone = new FlexJson();
    if(this.UseFlexJson) { jClone.UseFlexJson = true; }
    if (keepSP) { jClone.keepSpacing = true; }
    if (keepCM) { jClone.keepComments = true; }
    jClone.ALLOW_SINGLE_QUOTE_STRINGS = this.ALLOW_SINGLE_QUOTE_STRINGS;
    return jClone;
  }

  DeserializeObject(meJsonString, start, keepSP, keepCM) {
    var j2;
    var jNew;
    let Key = "";
    let preKey = "";
    let postKey = "";
    var c;

    let v = [];
    let mePos = start;
    mePos.increment(); // *** IMPORTANT! Move past { symbol
    let skipToNext = false;

    let safety = 99999;
    while (true) {
      skipToNext = false;
      j2 = this.CreatePartClone(keepSP, keepCM);
      let newPos = j2.DeserializeMeI(
        meJsonString,
        mePos.clone(),
        true,
        true,
        ":",
        ",",
        "}"
      ); // finding a } means there are no more items in the object

      if (j2._status == 0 && j2._jsonType == FlexJsonConstants.typeNull) {
        // special case where item is NULL/BLANK - ok to skip...
        c = meJsonString.charAt(newPos.absolutePosition);
        if (c == "," || c == "}") {
          mePos = newPos;
          skipToNext = true;
        } else {
          this.StatusErr(
            -18,
            "Failed to find key in key:value pair @Line:" +
              mePos.lineNumber +
              " @Position:" +
              mePos.linePosition +
              " (e-18) [" +
              j2.StatusMessage +
              "]"
          );
          break;
        }
      } else if (j2._status != 0) {
        this.StatusErr(
          -19,
          "Failed to find key in key:value pair @Line:" +
            mePos.lineNumber +
            " @Position:" +
            mePos.linePosition +
            " (e-19) [" +
            j2.StatusMessage +
            "]"
        );
        break;
        // }
      } else if (j2._jsonType != "string") {
        this.StatusErr(
          -21,
          "Key name in key:value pair must be a string @Line:" +
            mePos.lineNumber +
            " @Position:" +
            mePos.linePosition +
            " (e-21)"
        );
        break;
      } else {
        // capture the white space/comments here
        if (keepCM || keepSP) {
          preKey = j2.preSpace;
          postKey = j2.finalSpace;
        }
        Key = j2._value; // already verified that this is type "string"
        this._keyQuote = j2._stringQuote;
        mePos = newPos;
      }

      j2 = null;

      if (!skipToNext) {
        let cColon = "\0";
        if (mePos.absolutePosition < meJsonString.length) {
          cColon = meJsonString.charAt(mePos.absolutePosition);
        }
        // *** Consume the :
        if (cColon != ":") {
          this.StatusErr(
            -16,
            "Expected : symbol in key:value pair @Line:" +
              mePos.lineNumber +
              " @Position:" +
              mePos.linePosition +
              " (e-16)"
          );
          break;
        }
        mePos.increment();

        // *** Expecting value after the : symbol in value/pair combo
        // Space/comments here are after the separator
        jNew = this.CreatePartClone(keepSP, keepCM);
        let finalPos = jNew.DeserializeMeI(
          meJsonString,
          mePos.clone(),
          true,
          false,
          ",",
          "}"
        );

        // Check for blank=null (return status -11 and _jsonType=null)
        // DEBUGGER: FUTURE-NOW: Should not be looking for -11???
        if (
          jNew.Status == -11 &&
          jNew.jsonType == "null" &&
          _UseFlexJson == true
        ) {
          // Note: jNew.status=-11 indicates nothing was found where there should have been a value - for FLEX JSON this is legitimate.
          jNew._status = 0; // this is OK
        }
        if (jNew.Status != 0) {
          this.StatusErr(
            -21,
            "Failed to find value in key:value pair. @Line:" +
              mePos.lineNumber +
              " @Position:" +
              mePos.linePosition +
              " (e-21) [" +
              jNew.StatusMessage +
              "]"
          );
          break;
        } else {
          // Note: Above, jNew.status=-11 indicates nothing was found where there should have been a value - for FLEX JSON this is legitimate.
          // *** For all cases: object, array, string, number, boolean, or null
          jNew.Parent = this;
          jNew._key = Key;
          if (preKey) { jNew.preKey = preKey; }
          if (postKey) { jNew.postKey = postKey; }
          v.push(jNew); // FUTURE: IS THIS WRONG? SHOULD WE CHECK TO SEE IF THE KEY ALREADY EXISTS? AS IS, THE FIRST VALUE WILL "overshadow" ANY SUBSEQUENT VALUE. MAYBE THIS IS OK.
          mePos = finalPos;
        }

        jNew = null;

        // *** Check if we are past the end of the string
        if (mePos.absolutePosition >= meJsonString.length) {
          this.StatusErr(
            -15,
            "Past end of string before we found the } symbol as the end of the object @Line:" +
              mePos.lineNumber +
              " @Position:" +
              mePos.linePosition +
              " (e-15)"
          );
          break;
        }
      } // end if (!skipToNext)

      let cNext = meJsonString[mePos.absolutePosition];
      // *** Check if we reached the end of the object
      if (cNext == "}") {
        break;
      } // return. we are done buildng the JSON object
      // *** Comma required between items in object
      if (cNext != ",") {
        this.StatusErr(
          -17,
          "Expected , symbol to separate value pairs @Line:" +
            mePos.lineNumber +
            " @Position:" +
            mePos.linePosition +
            " (e-17)"
        );
        break;
      }
      mePos.increment();

      safety--;
      if (safety <= 0) {
        this.StatusErr(
          -117,
          "Max deserialization iterations reached in DeserializeObject. @Line:" +
            mePos.lineNumber +
            " @Position:" +
            mePos.linePosition +
            " (e-117)"
        );
        break;
      }
    } // end do

    this._value = v;
    jNew = null;
    j2 = null;
    return mePos; // negative value indicated an error
  } // End DeserializeObject2()

  // DeserializeArray()
  // *** Look for comma separated value list as a JSON array
  // NOTE: Parent routine DeserializeMeI() keeps track of the before/after spacing of the array
  DeserializeArray(meJsonString, start, keepSP, keepCM) {
    var jNew;

    let v = [];
    let mePos = start;
    mePos.increment(); // *** IMPORTANT! Move past [ symbol

    let safety = 99999;
    while (true) {
      // *** Expecting value
      jNew = this.CreatePartClone(keepSP, keepCM);
      let finalPos = jNew.DeserializeMeI(
        meJsonString,
        mePos.clone(),
        true,
        false,
        ",",
        "]"
      );

      if (jNew.Status != 0) {
        this.StatusErr(
          -21,
          "Failed to find value in array. @Line:" +
            mePos.lineNumber +
            " @Position:" +
            mePos.linePosition +
            " (e-21) [" +
            jNew.StatusMessage +
            "]"
        );
        break;
      } else {
        // Note: Above, jNew.status=-11 indicates nothing was found where there should have been a value - for FLEX JSON this is legitimate.
        // *** For all cases: object, array, string, number, boolean, or null
        jNew.Parent = this;
        // If jNew is a blank string, then we need to create an empty array rather than an array with a null value.
        if (jNew._jsonString.trim() != "") {
          v.push(jNew);
        }
        mePos = finalPos;
      }

      jNew = null;

      // *** Check if we are past the end of the string
      if (mePos.absolutePosition >= meJsonString.length) {
        this.StatusErr(
          -115,
          "Past end of string before we found the ] symbol as the end of the object @Line:" +
            mePos.lineNumber +
            " @Position:" +
            mePos.linePosition +
            " (e-115)"
        );
        break;
      }

      let cNext = meJsonString[mePos.absolutePosition];
      // *** Check if we reached the end of the object
      if (cNext == "]") {
        break;
      } // return. we are done buildng the JSON object
      // *** Comma required between items in object
      if (cNext != ",") {
        this.StatusErr(
          -37,
          "Expected , symbol to separate values @Line:" +
            mePos.lineNumber +
            " @Position:" +
            mePos.linePosition +
            " (e-37)"
        );
        break;
      }
      mePos.increment();

      safety--;
      if (safety <= 0) {
        this.StatusErr(
          -119,
          "Max deserialization iterations reached in DeserializeObject. @Line:" +
            mePos.lineNumber +
            " @Position:" +
            mePos.linePosition +
            " (e-119)"
        );
        break;
      }
    } // end do

    this._value = v;
    jNew = null;
    return mePos; // negative value indicated an error
  } // End DeserializeArray()
  DeserializeFile(FilePath, OkToClip = false) {
    //if ( !System.IO.File.Exists(FilePath) ) { _status=-31; return _status; }
    try {
      /*
            fs.readFile(FilePath, (err, data) => { 
                if (err) throw err; 
              
                const fsData = data.toString(); 
                this.Deserialize(fsData,0,OkToClip);
            }) 
            */
      const fsData = fs.readFileSync(FilePath, "utf8");
      this.Deserialize(fsData, 0, OkToClip);
    } catch (err) {
      this._status = -32;
      this.statusMsg = err.message;
      return this._status;
    }
  }

  DeserializeFlexFile(
    FilePath,
    OkToClip = false,
    spacing_flag = 1, // default = keep spacing & comments
    comments_flag = 1
  ) {
    this.UseFlexJson = true;
    if (spacing_flag >= 0 || comments_flag >= 0) {
      this.keepSpacingAndComments(spacing_flag, comments_flag);
    }
    return this.DeserializeFile(FilePath, OkToClip);
  }

  // WriteToFile()
  // If object is setup as FlexJSON and with KeepSpacing/KeepComments, then file will be written accordingly
  // Return: 0=ok, -1=error, -2=could not write because of invalid FlexJson object
  WriteToFile(FilePath)
  {
      try
      {
          let outString = this.jsonString;
          if (this._status == 0)
          {
              fs.writeFileSync(FilePath, outString, {encoding: "utf8"});
          }
          else { return -2; }
      }
      catch { return -1; }
      return 0;
  }

  StatusErr(nErr, strErr) {
    this._status = nErr;
    this.AddStatusMessage(strErr);
  } // End

  // FUTURE: Replace this with this.statusMsg=...
  // AddStatusMessage()
  // Set _statusMsg to the new message/error string
  // Also add the message to a log in stats object, if stats are being tracked.
  AddStatusMessage(msg) {
    this.statusMsg = msg;
    if (this.NoStatsOrMsgs) {
      return;
    }
    if (!this.trackingStats) {
      return;
    } // verifies that _meta.stats exists as an object
  }

  // Convert Javascript type to FlexJson type
  convertType(v) {
    if (v === null) {
      return "null";
    }
    const vType = typeof v;
    switch (vType) {
      case "bigint":
      case "number":
        return "number";

      case "boolean":
        return "boolean";

      case "object": // must be FlexJson object or it is not a true "object"
        return ""; // indicates an error/invlid type

      case "FlexJson":
        return FlexJson.jsonType;

      case "function":
        return ""; // indicate error/invalid type

      default:
        return "string";
    }
  }
}

module.exports = FlexJson;
