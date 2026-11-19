import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './PlantelPage.css';

const POSICOES = [
  'GOLEIRO', 'ZAGUEIRO', 'LATERAL-DIREITO', 'LATERAL-ESQUERDO',
  'ALA-DIREITO', 'ALA-ESQUERDO', 'VOLANTE', 'MEIO-CAMPISTA',
  'MEIA-ATACANTE', 'PONTA-DIREITA', 'PONTA-ESQUERDA',
  'SEGUNDO ATACANTE', 'CENTROAVANTE',
];

const FORM_ATLETA_VAZIO = {
  nome: '', posicao: '', idade: '', equipe_id: '', nome_esportivo: '',
  data_nascimento: '', nacionalidade: '', altura_m: '', peso_kg: '',
  pe_dominante: '', posicao_secundaria: '', numero_camisa: '', observacoes: '',
};

const FORM_CLUBE_VAZIO = {
  nome: '', cidade: '', nome_abreviado: '', sigla: '', estado: '',
  pais: '', ano_fundacao: '', estadio: '', cores: '', email: '',
  telefone: '', site: '', observacoes: '',
};

const CAMPOS_CLUBE = [
  { nome: 'nome', titulo: 'Nome do clube *', limite: 150, exemplo: 'EX.: REAL MADRID' },
  { nome: 'nome_abreviado', titulo: 'Nome abreviado', limite: 100, exemplo: 'EX.: REAL MADRID' },
  { nome: 'sigla', titulo: 'Sigla', limite: 10, exemplo: 'EX.: RMA' },
  { nome: 'cidade', titulo: 'Cidade / sede', limite: 150, exemplo: 'EX.: TERESINA' },
  { nome: 'estado', titulo: 'Estado / região', limite: 100, exemplo: 'EX.: PIAUÍ' },
  { nome: 'pais', titulo: 'País', limite: 100, exemplo: 'EX.: BRASIL' },
  { nome: 'ano_fundacao', titulo: 'Ano de fundação', tipo: 'number', exemplo: 'EX.: 2020' },
  { nome: 'estadio', titulo: 'Estádio / local de treinamento (opcional)', limite: 150 },
  { nome: 'cores', titulo: 'Cores do clube (opcional)', limite: 100, exemplo: 'EX.: AZUL E BRANCO' },
  { nome: 'email', titulo: 'E-mail de contato (opcional)', tipo: 'email', limite: 254, exemplo: 'contato@clube.com.br' },
  { nome: 'telefone', titulo: 'Telefone (opcional)', tipo: 'tel', limite: 30, exemplo: '(86) 99999-9999' },
  { nome: 'site', titulo: 'Site oficial (opcional)', tipo: 'url', limite: 255, exemplo: 'https://meuclube.com.br' },
];

const CLUBE_MAIUSCULOS = new Set([
  'nome', 'nome_abreviado', 'sigla', 'cidade', 'estado', 'pais', 'estadio', 'cores',
]);

export function PlantelPage() {
  const [jogadores, setJogadores] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [formJogador, setFormJogador] = useState(FORM_ATLETA_VAZIO);

  const [formClube, setFormClube] = useState(FORM_CLUBE_VAZIO);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    setErro('');

    try {
      const [resJogadores, resEquipes] = await Promise.all([
        api.get('/jogadores'),
        api.get('/equipes'),
      ]);

      setJogadores(
        Array.isArray(resJogadores.data) ? resJogadores.data : []
      );

      setEquipes(
        Array.isArray(resEquipes.data) ? resEquipes.data : []
      );
    } catch (err) {
      console.error(
        'Erro ao carregar dados:',
        err.response?.status,
        err.response?.data || err.message
      );

      if ([401, 403].includes(err.response?.status)) {
        setErro(
          'Sua sessão expirou ou é inválida. Entre novamente na sua conta.'
        );
      } else {
        setErro(
          'Não foi possível carregar os dados. Verifique o servidor e tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClube(e) {
    e.preventDefault();
    setErro('');
    setMensagem('');

    const nome = formClube.nome.trim().toLocaleUpperCase('pt-BR');

    if (!nome) {
      setErro('Informe o nome da equipe.');
      return;
    }

    const anoTexto = formClube.ano_fundacao.trim();
    const ano = anoTexto ? Number(anoTexto) : null;
    if (anoTexto && (!Number.isInteger(ano) || ano < 1 || ano > new Date().getFullYear())) {
      setErro('Informe um ano de fundação válido, até o ano atual.');
      return;
    }

    const dadosClube = Object.fromEntries(
      Object.entries(formClube).map(([campo, valor]) => {
        const texto = valor.trim();
        return [campo, texto
          ? (CLUBE_MAIUSCULOS.has(campo) ? texto.toLocaleUpperCase('pt-BR') : texto)
          : null];
      })
    );
    dadosClube.ano_fundacao = ano;

    setSalvando(true);

    try {
      await api.post('/equipes', dadosClube);

      setFormClube(FORM_CLUBE_VAZIO);
      setMensagem('Equipe cadastrada com sucesso!');

      await carregarDados();
    } catch (err) {
      console.error(
        'Erro ao criar equipe:',
        err.response?.data || err.message
      );

      setErro(
        err.response?.data?.erro ||
        'Não foi possível cadastrar a equipe.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleCreateJogador(e) {
    e.preventDefault();
    setErro('');
    setMensagem('');

    const nome = formJogador.nome.trim().toLocaleUpperCase('pt-BR');
    const posicao = formJogador.posicao.trim();

    if (!nome || !posicao) {
      setErro('Informe o nome e a posição do jogador.');
      return;
    }

    if (!POSICOES.includes(posicao)) {
      setErro('Escolha uma posição da lista.');
      return;
    }

    const idade = formJogador.idade.trim();

    if (
      !idade ||
      !Number.isSafeInteger(Number(idade)) || Number(idade) < 1
    ) {
      setErro('Informe uma idade inteira a partir de 1.');
      return;
    }

    const formatoDecimal = /^\d+(?:[,.]\d{1,2})?$/;
    const alturaTexto = formJogador.altura_m.trim();
    const pesoTexto = formJogador.peso_kg.trim();
    const alturaMetros = alturaTexto ? Number(alturaTexto.replace(',', '.')) : null;
    const pesoKg = pesoTexto ? Number(pesoTexto.replace(',', '.')) : null;

    if (alturaTexto && (!formatoDecimal.test(alturaTexto) || alturaMetros <= 0 || alturaMetros > 3)) {
      setErro('Informe a altura em metros, como 1,80, até duas casas decimais.');
      return;
    }
    if (pesoTexto && (!formatoDecimal.test(pesoTexto) || pesoKg <= 0 || pesoKg > 999.99)) {
      setErro('Informe o peso em quilos, como 75,5, até duas casas decimais.');
      return;
    }
    const dadosAtleta = { ...formJogador };
    delete dadosAtleta.altura_m;

    setSalvando(true);

    try {
      await api.post('/jogadores', {
        ...dadosAtleta,
        altura_cm: alturaMetros === null ? null : Math.round(alturaMetros * 100),
        peso_kg: pesoKg,
        nome,
        posicao,
        idade: idade ? Number(idade) : null,
        equipe_id: formJogador.equipe_id
          ? Number(formJogador.equipe_id)
          : null,
      });

      setFormJogador(FORM_ATLETA_VAZIO);

      setMensagem('Jogador cadastrado com sucesso!');

      await carregarDados();
    } catch (err) {
      console.error(
        'Erro ao criar jogador:',
        err.response?.data || err.message
      );

      setErro(
        err.response?.data?.erro ||
        'Não foi possível cadastrar o jogador.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="plantel-pagina">
      <header className="plantel-topo">
        <div><h1>Gestão de Plantel</h1><p>Cadastre clubes e atletas e acompanhe a composição do plantel.</p></div>
        <dl className="plantel-totais">
          <div><dt>Atletas</dt><dd>{jogadores.length}</dd></div>
          <div><dt>Clubes</dt><dd>{equipes.length}</dd></div>
        </dl>
      </header>
      {erro && <p role="alert" className="plantel-aviso plantel-erro">{erro}</p>}
      {mensagem && <p role="status" className="plantel-aviso">{mensagem}</p>}

      <div className="plantel-formularios" style={{ alignItems: 'stretch' }}>
        <section className="plantel-painel" aria-labelledby="clube-titulo" style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <header className="plantel-secao-topo"><span className="plantel-simbolo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 3 7v6c0 4 9 8 9 8s9-4 9-8V7Z" /></svg></span><h2 id="clube-titulo">Cadastro de clube</h2></header>
          <form onSubmit={handleCreateClube} style={{ display: 'flex', flex: 1, minWidth: 0 }}>
            <fieldset disabled={salvando} style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, width: '100%' }}>
              <div className="plantel-campos-duplos">
                {CAMPOS_CLUBE.map(({ nome, titulo, tipo = 'text', limite, exemplo }) => (
                  <label key={nome}>
                    {titulo}
                    <input
                      name={nome}
                      type={tipo}
                      required={nome === 'nome'}
                      maxLength={limite}
                      placeholder={exemplo}
                      min={tipo === 'number' ? 1 : undefined}
                      max={tipo === 'number' ? new Date().getFullYear() : undefined}
                      step={tipo === 'number' ? 1 : undefined}
                      value={formClube[nome]}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormClube((anterior) => ({
                          ...anterior,
                          [nome]: CLUBE_MAIUSCULOS.has(nome)
                            ? valor.toLocaleUpperCase('pt-BR') : valor,
                        }));
                      }}
                    />
                  </label>
                ))}
              </div>
              <label>
                Observações
                <textarea rows={3} maxLength={3000}
                  placeholder="Informações adicionais sobre o clube"
                  value={formClube.observacoes}
                  onChange={(e) => setFormClube((anterior) => ({ ...anterior, observacoes: e.target.value }))}
                />
              </label>
              <button className="plantel-secundario" type="submit" style={{ marginTop: 'auto' }}>{salvando ? 'Salvando…' : 'Cadastrar clube'}</button>
            </fieldset>
          </form>
        </section>

        <section className="plantel-painel" aria-labelledby="atleta-titulo" style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <header className="plantel-secao-topo"><span className="plantel-simbolo" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M4 21v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3"/></svg></span><h2 id="atleta-titulo">Cadastro de atleta</h2></header>
          <form onSubmit={handleCreateJogador} style={{ display: 'flex', flex: 1, minWidth: 0 }}>
            <fieldset disabled={salvando} style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, width: '100%' }}>
              <label>Nome do atleta<input required maxLength={100} placeholder="NOME COMPLETO" value={formJogador.nome} onChange={(e) => setFormJogador({ ...formJogador, nome: e.target.value.toLocaleUpperCase('pt-BR') })} /></label>
              <div className="plantel-campos-linha">
                <label>Posição<select required value={formJogador.posicao} onChange={(e) => setFormJogador({ ...formJogador, posicao: e.target.value })}><option value="">Selecione a posição</option>{POSICOES.map((p) => <option key={p}>{p}</option>)}</select></label>
                <label>Idade *<input required type="number" min="1" step="1" placeholder="Ex.: 22" readOnly={Boolean(formJogador.data_nascimento)} value={formJogador.idade} onChange={(e) => setFormJogador({ ...formJogador, idade: e.target.value })} /></label>
              </div>
              <label>Clube<select value={formJogador.equipe_id} onChange={(e) => setFormJogador({ ...formJogador, equipe_id: e.target.value })}><option value="">Sem clube (opcional)</option>{equipes.map((eq) => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}</select></label>
              <label>Nome esportivo<input maxLength={100} value={formJogador.nome_esportivo} onChange={(e) => setFormJogador({ ...formJogador, nome_esportivo: e.target.value.toLocaleUpperCase('pt-BR') })} /></label>
              <div className="plantel-campos-duplos">
                <label>Data de nascimento<input type="date" value={formJogador.data_nascimento} onChange={(e) => {
                  const data = e.target.value;
                  let idadeCalculada = '';
                  if (data) {
                    const [ano, mes, dia] = data.split('-').map(Number);
                    const hoje = new Date();
                    let anos = hoje.getFullYear() - ano;
                    if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) anos--;
                    idadeCalculada = String(anos);
                  }
                  setFormJogador((anterior) => ({ ...anterior, data_nascimento: data, idade: idadeCalculada }));
                }} /></label>
                <label>Nacionalidade<input maxLength={100} value={formJogador.nacionalidade} onChange={(e) => setFormJogador({ ...formJogador, nacionalidade: e.target.value.toLocaleUpperCase('pt-BR') })} /></label>
              </div>
              <div className="plantel-campos-duplos">
                <label>
                  Altura (m)
                  <input type="text" inputMode="decimal" maxLength={6}
                    placeholder="Ex.: 1,80" pattern="[0-9]+([,.][0-9]{1,2})?"
                    title="Altura em metros, como 1,80"
                    value={formJogador.altura_m}
                    onChange={(e) => setFormJogador({ ...formJogador, altura_m: e.target.value })}
                  />
                </label>
                <label>
                  Peso (kg)
                  <input type="text" inputMode="decimal" maxLength={6}
                    placeholder="Ex.: 75,5" pattern="[0-9]+([,.][0-9]{1,2})?"
                    title="Peso em quilos, como 75,5"
                    value={formJogador.peso_kg}
                    onChange={(e) => setFormJogador({ ...formJogador, peso_kg: e.target.value })}
                  />
                </label>
              </div>
              <div className="plantel-campos-duplos">
                <label>Pé dominante<select value={formJogador.pe_dominante} onChange={(e) => setFormJogador({ ...formJogador, pe_dominante: e.target.value })}><option value="">Não informado</option><option value="DIREITO">Direito</option><option value="ESQUERDO">Esquerdo</option><option value="AMBOS">Ambos</option></select></label>
                <label>Posição secundária<select value={formJogador.posicao_secundaria} onChange={(e) => setFormJogador({ ...formJogador, posicao_secundaria: e.target.value })}><option value="">Não informada</option>{POSICOES.map((p) => <option key={p}>{p}</option>)}</select></label>
              </div>
              <label>Número da camisa<input type="number" min="1" max="99" step="1" value={formJogador.numero_camisa} onChange={(e) => setFormJogador({ ...formJogador, numero_camisa: e.target.value })} /></label>
              <label>Observações<textarea rows={3} maxLength={3000} value={formJogador.observacoes} onChange={(e) => setFormJogador({ ...formJogador, observacoes: e.target.value })} /></label>
              <button className="plantel-principal" type="submit" style={{ marginTop: 'auto' }}>{salvando ? 'Salvando…' : 'Cadastrar atleta'}</button>
            </fieldset>
          </form>
        </section>
      </div>

      <section className="plantel-painel" aria-labelledby="plantel-lista">
        <div className="plantel-acoes"><h2 id="plantel-lista">Atletas cadastrados</h2><button type="button" onClick={carregarDados} disabled={loading || salvando}>{loading ? 'Carregando…' : 'Atualizar lista'}</button></div>
        {loading ? <p role="status">Carregando plantel…</p> : jogadores.length === 0 ? <p className="plantel-vazio">Cadastre o primeiro atleta para começar.</p> : (
          <div className="plantel-atletas">
            {jogadores.map((j) => (
              <article key={j.id} className="plantel-atleta">
                <div className="plantel-atleta-topo"><span className="plantel-avatar" aria-hidden="true">{j.nome?.trim().charAt(0).toUpperCase() || '?'}</span><span className="plantel-posicao">{j.posicao || 'Não informada'}</span></div>
                <h3>{j.nome_esportivo || j.nome}</h3>
                <details className="plantel-ficha"><summary>Ver ficha do atleta</summary><dl>
                  <div><dt>Nome</dt><dd>{j.nome}</dd></div>
                  <div><dt>Nacionalidade</dt><dd>{j.nacionalidade || 'Não informada'}</dd></div>
                  <div><dt>Altura</dt><dd>{j.altura_cm ? `${(Number(j.altura_cm) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} m` : 'Não informada'}</dd></div>
                  <div><dt>Peso</dt><dd>{j.peso_kg ? `${Number(j.peso_kg).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg` : 'Não informado'}</dd></div>
                  <div><dt>Pé dominante</dt><dd>{j.pe_dominante || 'Não informado'}</dd></div>
                  <div><dt>Posição secundária</dt><dd>{j.posicao_secundaria || 'Não informada'}</dd></div>
                  <div><dt>Camisa</dt><dd>{j.numero_camisa ?? 'Não informada'}</dd></div>
                </dl>{j.observacoes && <p>{j.observacoes}</p>}</details>
                <dl><div><dt>Idade</dt><dd>{j.idade == null ? 'Não informada' : `${j.idade} anos`}</dd></div><div><dt>Clube</dt><dd>{j.equipe_nome || equipes.find((eq) => String(eq.id) === String(j.equipe_id))?.nome || 'Sem clube'}</dd></div></dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PlantelPage;