const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
    // Exemplo de chamadas genéricas
    async get(endpoint) {
        const res = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return res.json();
    },

    async post(endpoint, body) {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return res.json();
    }
};