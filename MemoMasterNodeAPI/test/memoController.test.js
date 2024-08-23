import assert from 'assert';
import request from 'supertest';
import app from '../app.js'; 

describe('MemoMasterNodeAPI', () => {
    let memoId; 

    describe('GET /memos', () => {
        it('should get all memos', async () => {
            const res = await request(app).get('/memos');

            assert.strictEqual(res.status, 200);
            assert.strictEqual(Array.isArray(res.body), true);
            assert.ok(res.body.length > 0, 'Expected non-empty array of memos');

            if (res.body.length > 0) {
                assert.ok(res.body[0].hasOwnProperty('idx'), 'Expected idx property');
                assert.ok(res.body[0].hasOwnProperty('title'), 'Expected title property');
                assert.ok(res.body[0].hasOwnProperty('body'), 'Expected body property');
            }
        });
    });

    describe('GET /memoTitles', () => {
        it('should get all memo titles', async () => {
            const res = await request(app).get('/memoTitles');

            assert.strictEqual(res.status, 200);
            assert.strictEqual(Array.isArray(res.body), true);
            assert.ok(res.body.length > 0, 'Expected non-empty array of memo titles');

            if (res.body.length > 0) {
                assert.ok(res.body[0].hasOwnProperty('idx'), 'Expected idx property');
                assert.ok(res.body[0].hasOwnProperty('title'), 'Expected title property');
            }
        });
    });

    describe('GET /memo/:id', () => {
        it('should get memo details by id', async () => {
            const testId = 2; // Use ID that exists
            const res = await request(app).get(`/memo/${testId}`);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(typeof res.body, 'object');
            assert.ok(res.body.hasOwnProperty('idx'), 'Expected idx property');
            assert.ok(res.body.hasOwnProperty('title'), 'Expected title property');
            assert.ok(res.body.hasOwnProperty('body'), 'Expected body property');
        });

        it('should return 404 for a non-existing memo', async () => {
            const nonExistentId = 99999; // Use ID that does not exist
            const res = await request(app).get(`/memo/${nonExistentId}`);

            assert.strictEqual(res.status, 404);
        });
    });

    describe('POST, PUT, DELETE Memo', () => {

        it('should create a new memo', async () => {
            const newMemo = {
                title: 'Test Memo',
                body: 'This is a test memo.',
                keywords: 'test, memo'
            };

            const res = await request(app).post('/memo').send(newMemo);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(typeof res.body, 'object');
            assert.ok(res.body.hasOwnProperty('idx'), 'Expected idx property');
            assert.strictEqual(res.body.title, newMemo.title);
            assert.strictEqual(res.body.body, newMemo.body);

            // Store the created memo ID for use in update and delete tests following
            memoId = res.body.idx;
        });

        it('should update the created memo', async () => {
            const updatedMemo = {
                title: 'Updated Test Memo',
                body: 'This is an updated test memo.',
                keywords: 'updated, test, memo'
            };

            const res = await request(app).put(`/memo/${memoId}`).send(updatedMemo);

            assert.strictEqual(res.status, 200);

            // Verify the update by fetching the memo again
            const fetchRes = await request(app).get(`/memo/${memoId}`);
            assert.strictEqual(fetchRes.status, 200);
            assert.strictEqual(fetchRes.body.title, updatedMemo.title);
            assert.strictEqual(fetchRes.body.body, updatedMemo.body);
        });

        it('should delete the updated memo', async () => {
            const res = await request(app).delete(`/memo/${memoId}`);

            assert.strictEqual(res.status, 200);
        });

    });

});
