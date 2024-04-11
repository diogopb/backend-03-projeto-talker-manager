const express = require('express');
const fs = require('fs').promises;

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

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
