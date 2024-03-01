module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs");
  },
  getDataAggregator: (req, res) => {
    const parsedTextSession = req.session.parsedTextOutput ? req.session.parsedTextOutput : '';
    req.session.parsedTextOutput = ''
    req.files = []
    res.render("dataaggregator.ejs", { parsedTextOutput: parsedTextSession })
  },
};
