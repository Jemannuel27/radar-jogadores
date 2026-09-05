import React, { useState, useEffect } from 'react';

export default function CompararAtletasPage() {
    const [jogadores, setJogadores] = useState([]);
    const [jogador1Id, setJogador1Id] = useState('');
    const [jogador2Id, setJogador2Id] = useState('');
    const [comparacao, setComparacao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingJogadores, setLoadingJogadores] = useState(true);
    const [erro, setErro] = useState(null);

    // Carrega atletas do backend ao montar a página
    useEffect(() => {
        const buscarJogadores = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/ia/jogadores');
                if (!response.ok) throw new Error("Falha ao carregar lista de jogadores.");
                const data = await response.json();
                setJogadores(data);
                
                if (data.length >= 2) {
                    setJogador1Id(data[0].id);
                    setJogador2Id(data[1].id);
                } else if (data.length === 1) {
                    setJogador1Id(data[0].id);
                }
            } catch (err) {
                console.error("Erro ao carregar jogadores:", err);
                setErro("Não foi possível carregar a lista de atletas.");
            } finally {
                setLoadingJogadores(false);
            }
        };

        buscarJogadores();
    }, []);

    const compararAtletas = async () => {
        if (!jogador1Id || !jogador2Id) {
            setErro("Selecione dois jogadores para comparar.");
            return;
        }

        if (jogador1Id === jogador2Id) {
            setErro("Selecione dois jogadores diferentes para o confronto.");
            return;
        }

        setLoading(true);
        setErro(null);

        try {
            const response = await fetch(`http://localhost:3000/api/ia/comparar?j1=${jogador1Id}&j2=${jogador2Id}`);
            if (!response.ok) throw new Error("Erro ao gerar comparação via IA.");
            const data = await response.json();
            setComparacao(data);
        } catch (err) {
            console.error("Erro na requisição:", err);
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    const j1Info = jogadores.find(j => String(j.id) === String(jogador1Id));
    const j2Info = jogadores.find(j => String(j.id) === String(jogador2Id));

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
            {/* Título com destaque visual */}
            <h1 style={{
                fontSize: '32px',
                fontWeight: '900',
                letterSpacing: '2.5px',
                color: '#ffffff',
                marginBottom: '10px',
                textTransform: 'uppercase',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
                textAlign: 'center'
            }}>
                ⚔️ COMPARADOR HEAD-TO-HEAD (SCOUT IA)
            </h1>

            <p style={{
                fontSize: '18px',
                color: '#94a3b8',
                marginBottom: '35px',
                fontWeight: '500',
                letterSpacing: '0.5px',
                textAlign: 'center'
            }}>
                Confronto tático e estatístico direto alimentado por inteligência artificial
            </p>

            {/* Painel de Seleção dos Atletas */}
            <div style={{
                backgroundColor: '#111827',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '25px 30px',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                marginBottom: '35px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase' }}>Atleta 1</label>
                    <select
                        value={jogador1Id}
                        onChange={(e) => setJogador1Id(e.target.value)}
                        disabled={loadingJogadores || loading}
                        style={{
                            backgroundColor: '#1e293b',
                            color: '#ffffff',
                            border: '1px solid #334155',
                            padding: '12px 18px',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            outline: 'none',
                            minWidth: '220px'
                        }}
                    >
                        {loadingJogadores ? (
                            <option>Carregando...</option>
                        ) : (
                            jogadores.map((j) => (
                                <option key={`j1-${j.id}`} value={j.id}>
                                    {j.nome} ({j.posicao || 'Atleta'})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    padding: '10px 16px',
                    borderRadius: '50%',
                    fontWeight: '900',
                    fontSize: '16px',
                    marginTop: '18px'
                }}>
                    VS
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f43f5e', textTransform: 'uppercase' }}>Atleta 2</label>
                    <select
                        value={jogador2Id}
                        onChange={(e) => setJogador2Id(e.target.value)}
                        disabled={loadingJogadores || loading}
                        style={{
                            backgroundColor: '#1e293b',
                            color: '#ffffff',
                            border: '1px solid #334155',
                            padding: '12px 18px',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            outline: 'none',
                            minWidth: '220px'
                        }}
                    >
                        {loadingJogadores ? (
                            <option>Carregando...</option>
                        ) : (
                            jogadores.map((j) => (
                                <option key={`j2-${j.id}`} value={j.id}>
                                    {j.nome} ({j.posicao || 'Atleta'})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Botão de Ação */}
                <button 
                    onClick={compararAtletas} 
                    disabled={loading || loadingJogadores || !jogador1Id || !jogador2Id}
                    style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '14px 28px',
                        fontWeight: '800',
                        fontSize: '14px',
                        borderRadius: '8px',
                        cursor: (loading || loadingJogadores) ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                        marginTop: '18px',
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    {loading ? "ANALISANDO..." : "⚡ ANALISAR DUELO"}
                </button>
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

            {/* Card Principal da Comparação */}
            {comparacao && (
                <div style={{
                    width: '100%',
                    maxWidth: '850px',
                    backgroundColor: '#111827',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                    padding: '35px 30px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
                }}>
                    {/* Cabeçalho do Duelo */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '30px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid #1e293b',
                        textAlign: 'center'
                    }}>
                        <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #0284c7' }}>
                            <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>ATLETA A</span>
                            <h2 style={{ fontSize: '18px', margin: '4px 0 0 0', color: '#ffffff' }}>{j1Info?.nome || 'Atleta 1'}</h2>
                        </div>

                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#64748b' }}>X</span>

                        <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #f43f5e' }}>
                            <span style={{ fontSize: '12px', color: '#f43f5e', fontWeight: 'bold' }}>ATLETA B</span>
                            <h2 style={{ fontSize: '18px', margin: '4px 0 0 0', color: '#ffffff' }}>{j2Info?.nome || 'Atleta 2'}</h2>
                        </div>
                    </div>

                    {/* Veredito com o novo cabeçalho 'COMPARAÇÃO' */}
                    <div style={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        padding: '25px',
                        border: '1px solid #1e293b',
                        lineHeight: '1.7',
                        color: '#e2e8f0',
                        fontSize: '15px'
                    }}>
                        <h3 style={{
                            fontSize: '13px',
                            color: '#38bdf8',
                            textTransform: 'uppercase',
                            letterSpacing: '1.2px',
                            marginTop: 0,
                            marginBottom: '15px'
                        }}>
                            COMPARAÇÃO
                        </h3>
                        <p style={{ margin: 0 }}>
                            {comparacao.analiseGeral || comparacao.parecerTecnico || comparacao.resumoConfronto}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}