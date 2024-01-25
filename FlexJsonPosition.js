class FlexJsonPosition
    {
        lineNumber;
        linePosition;
        absolutePosition;

        constructor(initLineNumber, initLinePosition, initAbsolutePosition) {
            this.lineNumber = initLineNumber;
            this.linePosition = initLinePosition;
            this.absolutePosition = initAbsolutePosition;
        }
            
        increment(positionIncrement = 1) {
            this.linePosition += positionIncrement;
            this.absolutePosition += positionIncrement;
        }

        // IncrementLine() - tracks the occurrance of a line break.
        // AbsoluteIncrement must be provided because on some systems line breaks are 2 characters
        incrementLine(absoluteIncrement, lineIncrement = 1) {
            this.lineNumber += lineIncrement;
            this.linePosition = 0;
            this.absolutePosition += absoluteIncrement;
        }

        clone() {
            let newClone = new FlexJsonPosition(this.lineNumber,this.linePosition,this.absolutePosition);
            return newClone;
        }
    }
	
module.exports = FlexJsonPosition;