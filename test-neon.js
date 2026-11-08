const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { app, pool, sessionStore } = require("./index");

function callStore(method, ...args) {
    return new Promise((resolve, reject) => {
        sessionStore[method](...args, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(result);
        });
    });
}

async function main() {
    const server = app.listen(0);
    const address = await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.once("listening", () => resolve(server.address()));
    });

    try {
        const sessionId = `neon-smoke-${crypto.randomUUID()}`;
        const marker = crypto.randomUUID();
        await callStore("set", sessionId, {
            cookie: {
                originalMaxAge: 60_000,
                expires: new Date(Date.now() + 60_000),
            },
            neonSmokeMarker: marker,
        });

        const storedSession = await callStore("get", sessionId);
        assert.equal(storedSession.neonSmokeMarker, marker);
        await callStore("destroy", sessionId);

        const response = await fetch(`http://127.0.0.1:${address.port}/health`);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            status: "ok",
            database: "connected",
        });

        console.log("Neon smoke test passed: session persisted and /health returned 200.");
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
        await pool.end();
    }
}

main().catch((error) => {
    console.error("Neon smoke test failed:", error);
    process.exitCode = 1;
});
