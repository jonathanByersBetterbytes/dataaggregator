module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs");
  },
  getDataAggregator: (req, res) => {
    res.render("dataaggregator.ejs", { parsedTextOutput: '' })
  },
};
