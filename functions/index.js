/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import cors from "cors";

const corsHandler = cors({ origin: true });

// Define API keys and URLs using Firebase params
const tmdbApiKey = defineString("tmdb.api_key");
const tmdbBaseUrl = defineString("tmdb.base_url");
const tmdbImageUrl = defineString("tmdb.image_url");

const igdbClientId = defineString("igdb.client_id");
const igdbClientSecret = defineString("igdb.client_secret");
const igdbAccessToken = defineString("igdb.access_token");
const igdbBaseUrl = defineString("igdb.base_url");

const lastfmApiKey = defineString("lastfm.api_key");

const googleApiKey = defineString("google.api_key");
const googleCx = defineString("google.cx");

const huggingfaceApiUrl = defineString("huggingface.api_url");
const huggingfaceApiToken = defineString("huggingface.api_token");

const firebaseApiKey = defineString("basefire.api_key");
const firebaseAuthDomain = defineString("basefire.auth_domain");
const firebaseProjectId = defineString("basefire.project_id");
const firebaseStorageBucket = defineString("basefire.storage_bucket");
const firebaseMessagingSenderId = defineString("basefire.messaging_sender_id");
const firebaseAppId = defineString("basefire.app_id");
const firebaseMeasurementId = defineString("basefire.measurement_id");

// Cloud Function to return API configuration
export const getApiConfig = onRequest((req, res) => {
    corsHandler(req, res, () => {
        res.json({
            tmdb: {
                apiKey: tmdbApiKey.value(),
                baseUrl: tmdbBaseUrl.value(),
                imageUrl: tmdbImageUrl.value(),
            },
            igdb: {
                clientId: igdbClientId.value(),
                clientSecret: igdbClientSecret.value(),
                accessToken: igdbAccessToken.value(),
                baseUrl: igdbBaseUrl.value(),
            },
            lastfm: {
                apiKey: lastfmApiKey.value(),
            },
            google: {
                apiKey: googleApiKey.value(),
                cx: googleCx.value(),
            },
            huggingface: {
                apiUrl: huggingfaceApiUrl.value(),
                apiToken: huggingfaceApiToken.value(),
            },
            firebase: {
                apiKey: firebaseApiKey.value(),
                authDomain: firebaseAuthDomain.value(),
                projectId: firebaseProjectId.value(),
                storageBucket: firebaseStorageBucket.value(),
                messagingSenderId: firebaseMessagingSenderId.value(),
                appId: firebaseAppId.value(),
                measurementId: firebaseMeasurementId.value(),
            }
        });
    });
});
