const formattedShare = (unformattedShare) => {
  if (unformattedShare === 0) {
    return "0";
  }
  if (unformattedShare < 0.01) {
    return "<0.01";
  }
  console.log("unformattedShare", unformattedShare);
  try {
    return unformattedShare.toFixed(2);
  } catch (e) {
    console.log("error", e);
    return unformattedShare;
  }
};

export default formattedShare;
