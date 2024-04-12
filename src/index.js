const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

app.get('/talker', async (req, res) => {
  const speakers = JSON.parse(await fs.readFile('src/talker.json', 'utf-8'));

  if (speakers.length === 0) {
    return res.status(200).json([]);
  }
  return res.status(200).json(speakers);
});

app.get('/talker/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const speakers = JSON.parse(await fs.readFile('src/talker.json', 'utf-8'));
    const searchSpeaker = speakers.find((speaker) => speaker.id === id);
    if (!searchSpeaker) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    return res.status(200).json(searchSpeaker);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar palestrante' });
  }
});

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  const emailRegex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$/i;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  next();
};

app.post('/login', validateLogin, async (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');

  return res.status(200).json({ token });
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
