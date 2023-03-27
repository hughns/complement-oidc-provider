/*
Copyright 2023 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import express from "express";
import morgan from "morgan";
import http from "node:http";
import https from "node:https";
import {
    readFileSync
} from "node:fs";

import {
    port,
    clientId,
    clientSecret,
    issuer,
} from "./config";
import bodyParser from "body-parser";

const app = express();
app.use(morgan("common"));
app.set("env", "production");

app.get("/health", (req, res) => res.status(200).send("OK"));

app.get("/.well-known/openid-configuration", (req, res) => {
    res.json({
        issuer,
        introspection_endpoint: `${issuer}/introspect`,
    });
});

// only supports client_secret_post
app.post("/introspect", bodyParser.urlencoded(), (req, res) => {
    console.log(JSON.stringify(req.body));
    const { client_id, client_secret, token } = req.body;
    if (client_id !== clientId || client_secret !== clientSecret) {
        return res.status(401).json({
            "error": "invalid_request",
            "error_description": "Authentication failed.",
        });
    }

    // token is base64 encoded JSON
    const tokenJson = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    console.log(JSON.stringify(tokenJson));
    res.json(tokenJson);
});

if (process.env.DEV_SSL === "yes") {
    const httpsServer = https.createServer({
        key: readFileSync("./devssl/key.pem"),
        cert: readFileSync("./devssl/cert.pem"),
    }, app);
    httpsServer.listen(port, () => {
        console.log(`Starting server at https://0.0.0.0:${port} with self-signed certificate`);
    });
} else {
    const httpServer = http.createServer(app);
    httpServer.listen(port, () => {
        console.log(`Starting server at http://0.0.0.0:${port}`);
    });
}