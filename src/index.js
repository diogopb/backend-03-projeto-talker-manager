const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(express.json());

const validateLogin = require('./middlewares/validateLogin');
const validateToken = require('./middlewares/validateToken');
const validateName = require('./middlewares/validateName');
const validateAge = require('./middlewares/validateAge');
const validateTalk = require('./middlewares/validateTalk');
const validateWatchedAt = require('./middlewares/validateWatchedAt');
const validateRate = require('./middlewares/validateRate');
const rateValidation = require('./middlewares/rateValidation');

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';
const FILE_PATH = 'src/talker.json';

const readJsonData = async (_path) => {
  const content = await fs.readFile(_path, 'utf8');
  return JSON.parse(content);
};

const writeJsonData = async (_path, data) => {
  await fs.writeFile(_path, JSON.stringify(data, null, 2));
};

app.get('/talker', async (req, res) => {
  const speakers = await readJsonData(FILE_PATH);

  if (speakers.length === 0) {
    return res.status(HTTP_OK_STATUS).json([]);
  }
  return res.status(HTTP_OK_STATUS).json(speakers);
});

app.get('/talker/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const speakers = await readJsonData(FILE_PATH);
    const searchSpeaker = speakers.find((speaker) => speaker.id === id);
    if (!searchSpeaker) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    return res.status(HTTP_OK_STATUS).json(searchSpeaker);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar palestrante' });
  }
});

app.post('/login', validateLogin, async (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  return res.status(HTTP_OK_STATUS).json({ token });
});

app.post('/talker',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  rateValidation,
  async (req, res) => {
    const newTalker = { ...req.body };
    try {
      const data = JSON.parse(await fs.readFile(FILE_PATH, 'utf-8'));
      const nextId = (data.length > 0 ? data[data.length - 1].id + 1 : 1);
      newTalker.id = nextId;
      data.push({ id: nextId, ...newTalker });
      await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
      res.status(201).json({ ...newTalker });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao adicionar palestrante' });
    }
  });

app.put('/talker/:id',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  rateValidation,
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      const talkers = await readJsonData(FILE_PATH);
      const index = talkers.findIndex((talker) => talker.id === id);

      if (index === -1) {
        return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
      }

      const updatedTalker = { id, ...req.body };
      talkers[index] = updatedTalker;

      await writeJsonData(FILE_PATH, talkers);
      return res.status(HTTP_OK_STATUS).json(updatedTalker);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar palestrante' });
    }
  });

app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
