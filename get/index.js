function trackingStats(meta) {
  if (meta == null || meta.status == null) {
    return false;
  }
  return true;
}

function statusMsg(meta){
 if(meta != null && meta.statusMsg != null){
   return meta.statusMsg;
 }
  return '';
}

function tmpStatusMsg(meta){
  if(meta != null && meta.tmpStatusMsg != null){
    return meta.tmpStatusMsg;
  }
  return '';
}

// exports
module.exports = {
  trackingStats: trackingStats,
  statusMsg: statusMsg,
  tmpStatusMsg: tmpStatusMsg
};