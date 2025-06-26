# 💻 Vibeverse

Vibeverse is a mood-based entertainment guide that recommends 🎬 movies, 🎵 music, and 🎮 games tailored to your current mood. It features a web interface, interactive quizzes, and prompt-based suggestions, integrating with various APIs and Firebase for authentication and data management.

## ✨ Features

- **Mood-Based Recommendations:** Get personalized suggestions for movies, music, and games based on your mood.
- **🧠 Interactive Quiz:** Take a quiz to determine your mood and receive tailored recommendations.
- **🔍 Prompt Search:** Enter how you feel or what you want, and get instant entertainment suggestions.
- **📈 Trending Content:** View trending movies, music, and games.
- **🔐 User Authentication:** Sign up, log in, and manage sessions with Firebase Auth.
- **⭐ Movie Review System:** (via GraphQL) Users can review and rate movies (see `dataconnect/`).

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (see `public/`)
- **Backend:** Node.js, Express (`index.js`)
- **APIs:** TMDB, IGDB, Last.fm, Google Custom Search, HuggingFace
- **Authentication & Database:** Firebase, Firestore
- **GraphQL:** Custom schema and queries for movies and reviews (see `dataconnect/`)

## 📁 Project Structure

```
├── index.js                # Main Express server
├── firebase.js             # Firebase integration
├── public/                 # Static frontend files (HTML, CSS, JS, images)
│   ├── index.html          # Main landing page
│   ├── quiz.html           # Mood quiz interface
│   ├── prompt.html         # Prompt-based search
│   ├── about.html          # About/credits page
│   └── ...
├── dataconnect/            # GraphQL schema, queries, and connector config
│   ├── schema/             # GraphQL schema for movies, users, reviews
│   ├── connector/          # Example queries/mutations
│   └── dataconnect.yaml    # DataConnect config
├── dataconnect-generated/  # Generated connector code (ignored in repo)
├── package.json            # Node.js dependencies and scripts
└── ...
```

## 🚀 Getting Started

### 🧩 Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayushman-77/vibeverse.git
   cd vibeverse
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root directory with the following keys:
   ```env
   TMDB_API_KEY=your_tmdb_key
   TMDB_BASE_URL=https://api.themoviedb.org/3
   TMDB_IMAGE_URL=https://image.tmdb.org/t/p/w500
   IGDB_CLIENT_ID=your_igdb_client_id
   IGDB_CLIENT_SECRET=your_igdb_client_secret
   IGDB_ACCESS_TOKEN=your_igdb_access_token
   IGDB_BASE_URL=https://api.igdb.com/v4
   LASTFM_API_KEY=your_lastfm_key
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_CX=your_google_cx
   HUGGINGFACE_API_URL=your_huggingface_api_url
   HUGGINGFACE_API_TOKEN=your_huggingface_api_token
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```
4. **Start the server:**
   ```bash
   npm start
   ```
5. **Open in browser:**
   Navigate to `http://localhost:3000` (or the port specified in your code).

## 💡 Usage
- Visit the main page to get trending recommendations.
- Take the quiz (`quiz.html`) for mood-based suggestions.
- Use the prompt page (`prompt.html`) to get recommendations based on your input.
- Log in or sign up to save your preferences and reviews.

## 🔗 DataConnect & GraphQL
- The `dataconnect/` directory contains GraphQL schema, queries, and mutations for managing movies, users, and reviews.
- See `dataconnect/schema/schema.gql` for schema details.
- Example queries and mutations are in `dataconnect/connector/`.

## 🙌 Credits

**Creators:**
- [Ayushman](mailto:ayushmandevnath2006@gmail.com) ([LinkedIn](https://www.linkedin.com/in/ayushman-devnath-984742292/), [Instagram](https://www.instagram.com/ayush.man457/))
- [Niladri](mailto:kniladrisekhar3@gmail.com) ([LinkedIn](https://www.linkedin.com/in/niladri-sekhar-karmakar-38b1342b8/), [Instagram](https://www.instagram.com/kniladrisekhar3/))
- [Soham](mailto:sohammandal8122005@gmail.com) ([LinkedIn](https://www.linkedin.com/in/soham-mandal-23b66128a/), [Instagram](https://www.instagram.com/wanglingindia/))
