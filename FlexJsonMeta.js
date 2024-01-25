class FlexJsonMeta
    {
        statusMsg = null;
        tmpStatusMsg = null;
        msgLog = null;
        msgLogOn = false;
        errorPosition = null;  // indicator of error position during deserialization process
        startPosition = null;  // indicator of start position during deserialization process
        endPosition = null;  // indicator of final position during deserialization process

        // When/if this object exists, it will include flags to indicate if the object is intended to keep spacing and/or comments
        //   keepSpacing - false=DO NOT preserve spacing, true=Preserve spacing including carriage returns
        //   keepComments - false=DO NOT preseerve comments, true=Preserve comments in Flex JSON
        // NOTE: These flags only have an affect during the deserialize process.
        // FUTURE: How to clear spacing/comments after the load?  (set _keep to null? or just keep/pre/post attributes) Make this recursive to sub-objects?
        // FUTURE: Flag to keep double/single quotes or no-quotes for Flex JSON (and write back to file using same quotes or no-quote per item)
        keepSpacing = false;
        keepComments = false;
        preSpace = null;
        finalSpace = null;
        preKey = null;
        postKey = null;
        stats = null;  // null indicates we are not tracking stats.  stats object will also be created if an error occurs - to hold the error message.
    }
	
module.exports = FlexJsonMeta;