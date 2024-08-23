import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { sql, poolPromise } from './dbconfig.js';

// Load the appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const app = express();
app.use(bodyParser.json());

// Get all memos
app.get('/memos', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('Memo_SelectAll');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get all memo titles
app.get('/memoTitles', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('Memo_SelectTitles');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get memo detail by ID
app.get('/memo/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('idx', sql.Int, req.params.id)
            .execute('Memo_Select_ByIdx');

        if (result.recordset.length === 0) {
            return res.status(404).send('Memo not found');
        }

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// Search memos with pagination, sorting, and filtering
app.get('/memos/search', async (req, res) => {
    const { SearchPhrase, PageNo, PageSize, SortColumn, SortOrder } = req.query;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('SearchPhrase', sql.NVarChar(400), SearchPhrase || '')
            .input('PageNo', sql.Int, PageNo || 1)
            .input('PageSize', sql.Int, PageSize || 15)
            .input('SortColumn', sql.VarChar(20), SortColumn || 'title')
            .input('SortOrder', sql.VarChar(4), SortOrder || 'ASC')
            .execute('Memo_Search_ByPageFilterSort_Titles');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update a memo
app.put('/memo/:id', async (req, res) => {
    const { title, body, keywords } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('idx', sql.Int, req.params.id)
            .input('title', sql.NVarChar(1000), title)
            .input('body', sql.NVarChar(sql.MAX), body)
            .input('keywords', sql.NVarChar(400), keywords)
            .execute('Memo_Update');
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Insert a new memo
app.post('/memo', async (req, res) => {
    const { title, body, keywords } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('title', sql.NVarChar(1000), title)
            .input('body', sql.NVarChar(sql.MAX), body)
            .input('keywords', sql.NVarChar(400), keywords)
            .execute('Memo_Insert');
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete a memo by ID
app.delete('/memo/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('idx', sql.Int, req.params.id)
            .execute('Memo_Delete_ByIdx');
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default app; 