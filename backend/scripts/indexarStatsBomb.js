const fs = require('node:fs');
const path = require('node:path');

const pastaBackend = path.resolve(__dirname, '..');
const pastaDados = path.resolve(
  pastaBackend, '..', '..', 'statsbomb-open-data', 'data'
);
const pastaEscalacoes = path.join(pastaDados, 'lineups');

if (!fs.existsSync(pastaEscalacoes)) {
  console.error('Catálogo do StatsBomb não encontrado. Execute o git clone primeiro.');
  process.exit(1);
}

const partidasPorId = new Map();
const catalogo = JSON.parse(
  fs.readFileSync(path.join(pastaDados, 'competitions.json'), 'utf8')
);

for (const item of catalogo) {
  const arquivo = path.join(
    pastaDados,
    'matches',
    String(item.competition_id),
    `${item.season_id}.json`
  );

  if (!fs.existsSync(arquivo)) continue;

  const partidas = JSON.parse(fs.readFileSync(arquivo, 'utf8'));

  for (const partida of partidas) {
    partidasPorId.set(partida.match_id, {
      data: partida.match_date,
      mandante: partida.home_team.home_team_name,
      visitante: partida.away_team.away_team_name,
      competicao: item.competition_name,
      temporada: item.season_name,
    });
  }
}

const atletasPorId = new Map();

for (const arquivo of fs.readdirSync(pastaEscalacoes)) {
  if (!/^\d+\.json$/.test(arquivo)) continue;

  const partidaId = Number(path.basename(arquivo, '.json'));
  const equipes = JSON.parse(
    fs.readFileSync(path.join(pastaEscalacoes, arquivo), 'utf8')
  );

  for (const equipe of equipes) {
    for (const atleta of equipe.lineup) {
      const id = atleta.player_id;
      let registro = atletasPorId.get(id);

      if (!registro) {
        registro = {
          id,
          nome: atleta.player_nickname || atleta.player_name,
          nomes: new Set(),
          partidas: [],
        };
        atletasPorId.set(id, registro);
      }

      if (atleta.player_name) registro.nomes.add(atleta.player_name);
      if (atleta.player_nickname) registro.nomes.add(atleta.player_nickname);

      registro.partidas.push({
  partidaId,
  equipe: equipe.team_name,
  ...partidasPorId.get(partidaId),
});
    }
  }
}

const atletas = Array.from(atletasPorId.values(), (atleta) => ({
  ...atleta,
  nomes: [...atleta.nomes],
}));

const saida = path.join(pastaBackend, 'statsbomb-indice.json');
fs.writeFileSync(saida, JSON.stringify(atletas), 'utf8');

console.log(`Índice gerado com ${atletas.length} atletas.`);
for (const id of [5503, 3009]) {
  const atleta = atletasPorId.get(id);
  if (atleta) {
    console.log(`${atleta.nome} (${id}): ${atleta.partidas.length} escalações.`);
  }
}