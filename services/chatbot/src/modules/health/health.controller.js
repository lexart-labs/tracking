const checkHealth = (req, res) => {
  res.status(200).json({ status: 'ok' });
};

module.exports = {
  checkHealth,
};
