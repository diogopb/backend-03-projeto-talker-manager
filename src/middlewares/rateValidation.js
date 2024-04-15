const rateValidation = (req, res, next) => {
  const { talk } = req.body;
  const { rate } = talk;
  const parsedRate = parseFloat(rate);
  if (Number.isNaN(parsedRate) || parsedRate < 1 || parsedRate > 5 || parsedRate % 1 !== 0) {
    return res.status(400)
      .json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
  }
  next();
};

module.exports = rateValidation;