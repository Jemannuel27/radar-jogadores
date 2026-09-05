import React from 'react';

export default function Navbar({ abaAtiva, setAbaAtiva }) {
    const botoes = [
        { id: 'plantel', label: '🛡️ GESTÃO DE PLANTEL' },
        { id: 'partidas', label: '⚽ GESTÃO DE PARTIDAS' },
        { id: 'dashboard', label: '📊 DASHBOARD' },
        { id: 'comparar', label: '⚔️ COMPARAR ATLETAS' },
        { id: 'ia', label: '🤖 IA & RELATÓRIOS' },
    ];

    return (
        <nav style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: '#0b0f19',
            padding: '15px 20px',
            justifyContent: 'center',
            borderBottom: '1px solid #1e293b'
        }}>
            {botoes.map(btn => (
                <button
                    key={btn.id}
                    onClick={() => setAbaAtiva(btn.id)}
                    style={{
                        backgroundColor: abaAtiva === btn.id ? '#0284c7' : '#1e293b',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    {btn.label}
                </button>
            ))}
        </nav>
    );
}