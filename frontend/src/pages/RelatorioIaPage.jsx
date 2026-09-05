import React, { useState, useEffect } from 'react';

export default function RelatorioIaPage() {
    const [jogadores, setJogadores] = useState([]);
    const [jogadorSelecionadoId, setJogadorSelecionadoId] = useState('');
    const [relatorio, setRelatorio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingJogadores, setLoadingJogadores] = useState(true);
    const [erro, setErro] = useState(null);

    // Carrega a lista de jogadores cadastrados no banco de dados ao abrir a página
    useEffect(() => {
        const buscarJogadores = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/ia/jogadores');
                if (!response.ok) throw new Error("Falha ao carregar lista de jogadores.");
                const data = await response.json();
                setJogadores(data);
                if (data.length > 0) {
                    setJogadorSelecionadoId(data[0].id); // Seleciona o primeiro por padrão
                }
            } catch (err) {
                console.error("Erro ao buscar jogadores:", err);
                setErro("Não foi possível carregar a lista de atletas.");
            } finally {
                setLoadingJogadores(false);
            }
        };

        buscarJogadores();
    }, []);

    const gerarRelatorio = async () => {
        if (!jogadorSelecionadoId) {
            setErro("Selecione um jogador primeiro.");
            return;
        }

        setLoading(true);
        setErro(null);

        try {
            const response = await fetch(`http://localhost:3000/api/ia/parecer/${jogadorSelecionadoId}`);
            
            if (!response.ok) {
                throw new Error("Erro ao buscar parecer da IA.");
            }

            const data = await response.json();
            setRelatorio(data);

        } catch (err) {
            console.error("Erro na requisição:", err);
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    const baixarRelatorio = () => {
        if (!relatorio) return;

        const jogadorAtual = jogadores.find(j => String(j.id) === String(jogadorSelecionadoId));
        const nomeAtleta = jogadorAtual ? jogadorAtual.nome : 'Atleta';

        const conteudoTxt = `
================================================================
                    RELATÓRIO DE SCOUT - IA
================================================================
ATLETA: ${nomeAtleta.toUpperCase()}
================================================================

PERFIL TÁTICO:
${relatorio.classificacaoPerfil?.toUpperCase() || 'N/A'}

TENDÊNCIA DE DESEMPENHO:
${relatorio.tendencia || 'N/A'}

----------------------------------------------------------------
PARECER TÉCNICO:
----------------------------------------------------------------
${relatorio.parecerTecnico}

----------------------------------------------------------------
PONTOS FORTES:
----------------------------------------------------------------
${relatorio.pontosFortes?.map(p => `• ${p}`).join('\n') || 'Nenhum informado'}

----------------------------------------------------------------
PONTOS DE MELHORIA:
----------------------------------------------------------------
${relatorio.pontosMelhoria?.map(p => `• ${p}`).join('\n') || 'Nenhum informado'}

================================================================
Relatório gerado automaticamente via Radar Jogadores AI
================================================================
`;

        const blob = new Blob([conteudoTxt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Relatorio_Scout_${nomeAtleta.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0b0f19',
            color: '#f8fafc',
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {/* Título Principal */}
            <h1 style={{
                fontSize: '28px',
                fontWeight: '800',
                letterSpacing: '2px',
                color: '#38bdf8',
                marginBottom: '8px',
                textTransform: 'uppercase',
                textShadow: '0 0 14px rgba(56, 189, 248, 0.4)'
            }}>
                Relatório de Scout com IA
            </h1>

            {/* Subtítulo ajustado para cor branca */}
            <p style={{
                fontSize: '18px',
                color: '#ffffff',
                marginBottom: '30px',
                fontWeight: '600',
                letterSpacing: '0.5px'
            }}>
                Escolha o jogador
            </p>

            {/* Painel de Seleção e Ações */}
            <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '35px', 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                alignItems: 'center' 
            }}>
                <select
                    value={jogadorSelecionadoId}
                    onChange={(e) => setJogadorSelecionadoId(e.target.value)}
                    disabled={loadingJogadores || loading}
                    style={{
                        backgroundColor: '#1e293b',
                        color: '#ffffff',
                        border: '1px solid #334155',
                        padding: '12px 18px',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '240px'
                    }}
                >
                    {loadingJogadores ? (
                        <option>Carregando atletas...</option>
                    ) : (
                        jogadores.map((j) => (
                            <option key={j.id} value={j.id}>
                                {j.nome} ({j.posicao || 'Jogador'})
                            </option>
                        ))
                    )}
                </select>

                {/* Botão com texto 'GERAR' */}
                <button 
                    onClick={gerarRelatorio} 
                    disabled={loading || loadingJogadores || !jogadorSelecionadoId}
                    style={{
                        backgroundColor: loading ? '#0284c7' : '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 24px',
                        fontWeight: '700',
                        fontSize: '13px',
                        borderRadius: '8px',
                        cursor: (loading || loadingJogadores) ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    {loading ? "GERANDO..." : "⚡ GERAR"}
                </button>

                {relatorio && (
                    <button 
                        onClick={baixarRelatorio}
                        style={{
                            backgroundColor: '#1e293b',
                            color: '#38bdf8',
                            border: '1px solid #0284c7',
                            padding: '12px 20px',
                            fontWeight: '700',
                            fontSize: '13px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        📥 BAIXAR RELATÓRIO (.TXT)
                    </button>
                )}
            </div>

            {erro && (
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    color: '#f87171',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    {erro}
                </div>
            )}

            {/* Card com o Relatório */}
            {relatorio && (
                <div style={{
                    width: '100%',
                    maxWidth: '800px',
                    backgroundColor: '#111827',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                    padding: '40px 30px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        marginBottom: '20px',
                        textTransform: 'uppercase'
                    }}>
                        {relatorio.classificacaoPerfil}
                    </div>

                    <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '20px' }}>
                        Tendência: <strong style={{ color: '#38bdf8' }}>{relatorio.tendencia}</strong>
                    </p>

                    <div style={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #1e293b',
                        marginBottom: '30px',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>
                            Parecer Técnico
                        </h3>
                        <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.7', margin: 0 }}>
                            {relatorio.parecerTecnico}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                        <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                            <h4 style={{ fontSize: '13px', color: '#4ade80', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                                Pontos Fortes
                            </h4>
                            <ul style={{ paddingLeft: '18px', margin: 0, color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                                {relatorio.pontosFortes?.map((ponto, idx) => (
                                    <li key={idx} style={{ marginBottom: '6px' }}>{ponto}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                            <h4 style={{ fontSize: '13px', color: '#f87171', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                                Pontos de Melhoria
                            </h4>
                            <ul style={{ paddingLeft: '18px', margin: 0, color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                                {relatorio.pontosMelhoria?.map((ponto, idx) => (
                                    <li key={idx} style={{ marginBottom: '6px' }}>{ponto}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}