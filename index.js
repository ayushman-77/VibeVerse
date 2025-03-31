import express from 'express';
import axios from 'axios';
import path from 'path';
import cors from "cors";
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// load environment variables from.env file
dotenv.config();
const tmdbApiKey = process.env.TMDB_API_KEY;
const tmdbBaseUrl = process.env.TMDB_BASE_URL;
const tmdbImageUrl = process.env.TMDB_IMAGE_URL;

const igdbClientId = process.env.IGDB_CLIENT_ID;
const igdbClientSecret = process.env.IGDB_CLIENT_SECRET;
const igdbAccessToken = process.env.IGDB_ACCESS_TOKEN;
const igdbBaseUrl = process.env.IGDB_BASE_URL;

const lastfmApiKey = process.env.LASTFM_API_KEY;

const googleApiKey = process.env.GOOGLE_API_KEY;
const googleCx = process.env.GOOGLE_CX;

const huggingfaceApiUrl = process.env.HUGGINGFACE_API_URL;
const huggingfaceApiToken = process.env.HUGGINGFACE_API_TOKEN;

const firebaseApiKey = process.env.FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.FIREBASE_APP_ID;
const firebaseMeasurementId = process.env.FIREBASE_MEASUREMENT_ID;


const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
    measurementId: firebaseMeasurementId
};


const GENRE = {};

const MOOD_TO_GENRE = {
    "happy": [35, 16, 10751],      // Comedy, Animation, Family
    "sad": [18, 10749, 10402],     // Drama, Romance, Music
    "excited": [28, 12, 878],       // Action, Adventure, Science Fiction
    "scared": [27, 9648, 53],      // Horror, Mystery, Thriller
    "chill": [10749, 14, 10752]    // Romance, Fantasy, War
};

const MOOD_TO_GENRE_GAMES = {
    "happy": [8, 33, 30],
    "sad": [31, 32, 34],
    "excited": [5, 4, 10],
    "scared": [11, 24, 16],
    "chill": [9, 35, 26]
};

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/logo.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "logo.ico"));
});

app.post('/api/recommendations', async (req, res) => {
    const moodScores = req.body;
    const dominantMood = Object.keys(moodScores).reduce((a, b) => moodScores[a] > moodScores[b] ? a : b);
    const genreId = GENRE[dominantMood.toLowerCase()];
    if (!genreId) {
        return res.status(400).json({ error: "Invalid mood!" });
    }

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${genreId}`;
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            const movies = response.data.results.map(movie => ({
                title: movie.title,
                posterUrl: `${tmdbImageUrl}${movie.poster_path}`
            }));
            console.log('Movies:', movies); // Log the movies to verify the response
            res.json(movies);
        } else {
            res.status(response.status).json({ error: response.statusText });
        }
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({ error: error.response.statusText });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

app.get('/api/trending', async (req, res) => {
    const movies = await getMovies(35); // Fetch 35 trending movies
    res.json(movies);
});

app.post('/api/quiz_recommendations', async (req, res) => {
    const moodScores = req.body; // Get moodScores from the request body
    try {
        const recommendations = await get_recommendations(moodScores); // Call the updated function
        res.json(recommendations); // Send the recommendations as a response
    } catch (error) {
        console.error('Error generating recommendations:', error.message);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

app.post('/api/quiz_recommendations_games', async (req, res) => {
    const moodScores = req.body;
    try {
        console.log('Received moodScores:', moodScores); // Log the received moodScores
        const recommendations = await getGameRecommendations(moodScores);
        console.log('Game recommendations:', recommendations); // Log the recommendations
        res.json(recommendations);
    } catch (error) {
        console.error('Error generating game recommendations:', error.message);
        res.status(500).json({ error: 'Failed to generate game recommendations' });
    }
});

app.get('/api/questions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'question_list.json'));
});

app.get('/api/trending_games', async (req, res) => {
    const games = await getGames(35); // Fetch 35 trending games
    res.json(games);
});

app.post('/api/game_recommendations', async (req, res) => {
    const moodScores = req.body;
    try {
        const recommendations = await getGameRecommendations(moodScores);
        res.json(recommendations);
    } catch (error) {
        console.error('Error generating recommendations:', error.message);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

async function getMovies(n, genreId = null) {
    let movies = [];
    let page = 1;

    while (movies.length < n) {
        const url = genreId
            ? `${tmdbBaseUrl}/discover/movie?api_key=${tmdbApiKey}&with_genres=${genreId}&page=${page}`
            : `${tmdbBaseUrl}/trending/movie/day?api_key=${tmdbApiKey}&page=${page}`;
        
        try {
            const response = await axios.get(url);

            const results = response.data.results.map(movie => ({
                title: movie.title,
                posterUrl: `${tmdbImageUrl}${movie.poster_path}`
            }));

            movies.push(...results);
            page++;

            if (results.length < 20) break; // Stop if the API has no more results
        } catch (error) {
            console.error("Error fetching movies:", error.message);
            break;
        }
    }
    return movies.slice(0, n); // Return only `n` movies
}

async function getGames(n, genreId = null) {
    console.log(`Starting getGames with n=${n}, genreId=${genreId}`);
    let games = [];
    let offset = 0;

    while (games.length < n) {
        const url = `${igdbBaseUrl}/games`;
        try {
            const query = genreId
                ? `fields name,cover.url; where genres = ${genreId} & rating > 70; limit 10; offset ${offset};`
                : `fields name,cover.url; where rating > 70; limit 10; offset ${offset};`;

            console.log('Query:', query);

            const response = await axios.post(url, query, {
                headers: {
                    "Client-ID": igdbClientId,
                    "Authorization": `Bearer ${igdbAccessToken}`
                }
            });

            const results = response.data.map(game => ({
                title: game.name,
                coverUrl: game.cover ? game.cover.url.replace("t_thumb", "t_cover_big") : null
            }));

            console.log(`Fetched ${results.length} games from IGDB API`);
            games.push(...results);
            offset += 10;

            if (results.length < 10) break; // Stop if fewer than 10 games are returned
        } catch (error) {
            console.error("Error fetching games:", error.message);
            break;
        }
    }

    console.log(`Returning ${games.length} games`);
    return games.slice(0, n);
}

async function get_recommendations(moodScores) {
    console.log('Received moodScores:', moodScores);

    const normalizedMoodScores = {};
    for (const [key, value] of Object.entries(moodScores)) {
        normalizedMoodScores[key.toLowerCase()] = value;
    }

    const uniqueMovies = new Set();
    const movies = [];
    for (const [mood, genreIds] of Object.entries(MOOD_TO_GENRE)) {
        const moodScore = normalizedMoodScores[mood] || 0;
        const len = moodScore * 7;

        const partition = [Math.floor(len / 3), Math.floor(len / 3), len - 2 * Math.floor(len / 3)];
        for (let i = 0; i < partition.length; i++) {
            if (partition[i] > 0) {
                const result = await getMovies(partition[i], genreIds[i]);
                for (const movie of result) {
                    // Use movie title as a unique identifier
                    if (!uniqueMovies.has(movie.title)) {
                        uniqueMovies.add(movie.title);
                        movies.push(movie);
                    }
                }
            }
        }
    }

    shuffle(movies);
    return movies;
}

async function getGameRecommendations(moodScores) {
    console.log('Starting getGameRecommendations with moodScores:', moodScores);

    const normalizedMoodScores = {};
    for (const [key, value] of Object.entries(moodScores)) {
        normalizedMoodScores[key.toLowerCase()] = value;
    }
    console.log('Normalized moodScores:', normalizedMoodScores);

    const uniqueGames = new Set();
    const games = [];
    for (const [mood, genreIds] of Object.entries(MOOD_TO_GENRE_GAMES)) {
        const moodScore = normalizedMoodScores[mood] || 0;
        const len = moodScore * 7;
        console.log(`Fetching ${len} games for mood: ${mood}, genres: ${genreIds}`);

        const partition = [Math.floor(len / 3), Math.floor(len / 3), len - 2 * Math.floor(len / 3)];
        for (let i = 0; i < partition.length; i++) {
            if (partition[i] > 0) {
                console.log(`Fetching ${partition[i]} games for genreId: ${genreIds[i]}`);
                try {
                    const result = await getGames(partition[i], genreIds[i]);
                    for (const game of result) {
                        // Use game title as a unique identifier
                        if (!uniqueGames.has(game.title)) {
                            uniqueGames.add(game.title);
                            games.push(game);
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching games for genreId ${genreIds[i]}:`, error.message);
                }
            }
        }
    }
    shuffle(games);
    console.log('Final game recommendations:', games);
    return games;
}

function shuffle(array) {
    let currentIndex = array.length;
  
    while (currentIndex != 0) {
  
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}



const customsearch = google.customsearch('v1');

const MOOD_TO_LASTFM_TAG = {
    "happy": ["pop", "dance", "upbeat"],
    "sad": ["ballad", "acoustic", "melancholy"],
    "excited": ["rock", "electronic", "energetic"],
    "scared": ["dark", "industrial", "gothic"],
    "chill": ["indie", "ambient", "relaxed"]
};

async function getAlbumArt(track) {
    // Always do a Google image search, ignoring Last.fm image
    const searchQuery = `${track.name} ${track.artist.name} album cover`;
    return await searchGoogleImage(searchQuery);
}

const IMAGE_CACHE = new Map();

async function searchGoogleImage(query) {
    // Check if the image is already in cache
    if (IMAGE_CACHE.has(query)) {
        return IMAGE_CACHE.get(query);
    }

    try {
        const response = await customsearch.cse.list({
            auth: googleApiKey,
            cx: googleCx,
            q: query,
            searchType: 'image',
            num: 1
        });

        // Get the image URL or default
        const imageUrl = response.data.items?.[0]?.link || 'default_album_art_url';
        
        // Cache the result
        IMAGE_CACHE.set(query, imageUrl);

        return imageUrl;
    } catch (error) {
        console.error('Google Image search error:', error.message);
        
        // Cache the error result too
        IMAGE_CACHE.set(query, 'default_album_art_url');
        
        return 'default_album_art_url';
    }
}

// Optional: Add a cache cleanup mechanism to prevent memory growth
function cleanImageCache() {
    const MAX_CACHE_SIZE = 1000; // Adjust as needed
    if (IMAGE_CACHE.size > MAX_CACHE_SIZE) {
        // Remove the oldest entries
        const keysToRemove = Array.from(IMAGE_CACHE.keys()).slice(0, IMAGE_CACHE.size - MAX_CACHE_SIZE);
        keysToRemove.forEach(key => IMAGE_CACHE.delete(key));
    }
}

// Call this periodically or after a certain number of searches
setInterval(cleanImageCache, 1000 * 60 * 60); // Clean cache every hour

async function getTracks(n, tags) {
    console.log(`Starting getTracks with n=${n}, tags:`, tags);
    
    try {
        const tracksPromises = tags.map(async (tag) => {
            try {
                const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                    params: {
                        method: 'tag.gettoptracks',
                        tag: tag,
                        api_key: lastfmApiKey,
                        format: 'json',
                        limit: Math.ceil(n / tags.length)
                    }
                });

                const trackPromises = response.data.tracks.track.map(async track => ({
                    title: track.name,
                    artist: track.artist.name,
                    albumArtUrl: await getAlbumArt(track),
                    lastfmUrl: track.url
                }));

                return Promise.all(trackPromises);
            } catch (error) {
                console.error(`Error fetching tracks for tag ${tag}:`, error.message);
                return [];
            }
        });

        const tracksArrays = await Promise.all(tracksPromises);
        const tracks = tracksArrays.flat();
        return tracks.slice(0, n);
    } catch (error) {
        console.error("Error fetching tracks:", error.message);
        throw error;
    }
}

async function getMusicRecommendations(moodScores) {
    console.log('Starting getMusicRecommendations with moodScores:', moodScores);

    const normalizedMoodScores = {};
    for (const [key, value] of Object.entries(moodScores)) {
        normalizedMoodScores[key.toLowerCase()] = value;
    }
    console.log('Normalized moodScores:', normalizedMoodScores);

    const uniqueTracks = new Set();
    const tracks = [];

    let totalTracksNeeded = 35;
    let tempTracks = [];

    for (const [mood, tags] of Object.entries(MOOD_TO_LASTFM_TAG)) {
        const moodScore = normalizedMoodScores[mood] || 0;
        const len = Math.ceil((moodScore / Object.keys(MOOD_TO_LASTFM_TAG).length) * totalTracksNeeded);
        console.log(`Fetching ~${len} tracks for mood: ${mood}`);

        if (len > 0) {
            try {
                const result = await getTracks(len, tags);
                for (const track of result) {
                    const trackKey = `${track.title}__${track.artist}`;
                    if (!uniqueTracks.has(trackKey)) {
                        uniqueTracks.add(trackKey);
                        tempTracks.push(track);
                    }
                }
            } catch (error) {
                console.error(`Error fetching tracks for mood ${mood}:`, error.message);
            }
        }
    }

    shuffle(tempTracks);
    tracks.push(...tempTracks.slice(0, totalTracksNeeded));

    console.log('Final music recommendations:', tracks);
    return tracks;
}


app.get('/api/trending_music', async (req, res) => {
    try {
        const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
            params: {
                method: 'chart.gettoptracks',
                api_key: lastfmApiKey,
                format: 'json',
                limit: 35
            }
        });

        const trackPromises = response.data.tracks.track.map(async track => ({
            title: track.name,
            artist: track.artist.name,
            albumArtUrl: await getAlbumArt(track),
            lastfmUrl: track.url
        }));

        const tracks = await Promise.all(trackPromises);
        res.json(tracks);
    } catch (error) {
        console.error('Error fetching trending music:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending music' });
    }
});

app.get('/api/questions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'question_list.json'));
});

app.post('/api/music_recommendations', async (req, res) => {
    const moodScores = req.body;
    try {
        const recommendations = await getMusicRecommendations(moodScores);
        res.json(recommendations);
    } catch (error) {
        console.error('Error generating music recommendations:', error.message);
        res.status(500).json({ error: 'Failed to generate music recommendations' });
    }
});




// Make sure to parse JSON body
//prompt section
/**
 * Classify input text into predefined genres using zero-shot classification
 * and provide suggestions based on the classification result.
 * @param {string} text - The input text from the user.
 * @returns {Promise<object>} - Suggestions based on the classification result.
 */

async function classifyAndSuggest(text) {
  const candidateLabels = Object.keys(MOOD_TO_GENRE);

  const payload = {
    inputs: text,
    parameters: {
      candidate_labels: candidateLabels,
    },
  };

  try {
    const response = await fetch(huggingfaceApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${huggingfaceApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    const mood = result.labels[0];

    // Fetch real recommendations using the existing functions
    const movies = await getMovies(35, MOOD_TO_GENRE[mood][0]); // Fetch 10 movies for the first genre ID
    const games = await getGameRecommendations({ [mood]: 5 }); // Pass mood score as 1 for simplicity
    const music = await getMusicRecommendations({ [mood]: 5 }); // Pass mood score as 1 for simplicity

    return {
      mood,
      suggestions: {
        movies,
        games,
        music,
      },
    };
  } catch (error) {
    console.error("Error classifying text:", error);
    throw error;
  }
}

function printsuggestions(userInput) {
    classifyAndSuggest(userInput)
      .then((result) => {
        console.log("Mood detected:", result.mood);
        console.log("Suggestions:");
        console.log("Movies (Genres):", result.suggestions.movies);
        console.log("Games (Genres):", result.suggestions.games);
        console.log("Music (Tags):", result.suggestions.music);
      })
      .catch((err) => console.error(err))
};

app.post('/api/store_prompt', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Invalid prompt' });
    }

    try {
        const result = await classifyAndSuggest(prompt);
        res.json(result); // Return the suggestions to the client
    } catch (error) {
        console.error('Error generating suggestions:', error.message);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

app.get('/api/search', async (req, res) => {
    const query = req.query.q; // Get the search query from the request
    if (!query) {
        return res.status(400).json({ 
            error: 'Search query is required',
            movies: [],
            games: [],
            music: []
        });
    }

    try {
        // Search for movies
        const movieUrl = `${tmdbBaseUrl}/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}`;
        const movieResponse = await axios.get(movieUrl);
        const movies = movieResponse.data.results.map(movie => ({
            title: movie.title,
            posterUrl: movie.poster_path ? `${tmdbImageUrl}${movie.poster_path}` : null
        })).slice(0, 10);

        // Search for games using IGDB
        const gameQuery = `search "${query}"; fields name,cover.url; limit 10;`;
        const gameResponse = await axios.post(`${igdbBaseUrl}/games`, gameQuery, {
            headers: {
                "Client-ID": igdbClientId,
                "Authorization": `Bearer ${igdbAccessToken}`
            }
        });
        const games = gameResponse.data.map(game => ({
            title: game.name,
            coverUrl: game.cover ? game.cover.url.replace("t_thumb", "t_cover_big") : null
        }));

        // Search for music using Last.fm
        const musicResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
            params: {
                method: 'track.search',
                track: query,
                api_key: lastfmApiKey,
                format: 'json',
                limit: 10
            }
        });
        const musicPromises = musicResponse.data.results.trackmatches.track.map(async track => ({
            title: track.name,
            artist: track.artist,
            albumArtUrl: await getAlbumArt(track),
            lastfmUrl: track.url
        }));
        const music = await Promise.all(musicPromises);

        res.json({
            movies,
            games,
            music
        });
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ 
            error: 'Failed to perform search',
            movies: [],
            games: [],
            music: []
        });
    }
});

// app.get('/api/movies', (req, res) => {
//     res.json(movies);
// });

// // Music endpoint
// app.get('/api/music', (req, res) => {
//     res.json(music);
// });

// // Games endpoint
// app.get('/api/games', (req, res) => {
//     res.json(games);
// });

app.post('/api/login', (req, res) => {
    console.log('Login request received:', req.body);
    res.status(200).json({ message: 'Login request logged successfully' });
});

app.post('/api/signup', async (req, res) => {
    console.log('Signup endpoint hit');
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        console.log('Invalid email or password');
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Call the registerUser function with the provided email and password
        const user = await registerUser(email, password);
        console.log('User registered successfully:', user.email);
        res.status(200).json({ message: 'User registered successfully', user: user.email });
    } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
});

app.post('/api/logout', (req, res) => {
    console.log('Logout request received:', req.body);
    res.status(200).json({ message: 'Logout request logged successfully' });
});

// Initialize Firebase
const app1 = initializeApp(firebaseConfig);
const auth = getAuth(app1);

// User Registration Function
async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Registered user:", user.email);
    return user;
  } catch (error) {
    console.error("Registration Error:", error.message);
    throw error;
  }
}

// User Login Function
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Logged in user:", user.email);
    return user;
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
}

// Logout Function
async function logoutUser() {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
}

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Endpoint to handle signup requests
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Call the registerUser function with the provided email and password
        const user = await registerUser(email, password);
        res.status(200).json({ message: 'User registered successfully', user: user.email });
    } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(500).json({ error: 'Failed to register user' });
    }
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


app.get('/health', (req, res) => {
    res.status(200).send('OK');
});