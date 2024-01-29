function trackingStats(meta) {
  if (meta == null || meta.status == null) {
    return false;
  }
  return true;
}

// exports
module.exports = {
  trackingStats: trackingStats
};