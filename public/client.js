document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/trending');
        if (response.ok) {
            const movies = await response.json();
            addMoviesToGrid(movies, 'movieGrid');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

document.getElementById('searchButton').addEventListener('click', async () => {
    const mood = document.getElementById('moodInput').value;
    if (!mood) {
        alert('Please enter a mood');
        return;
    }

    try {
        const response = await fetch(`/api/recommendations?mood=${mood}`);
        if (response.ok) {
            const data = await response.json();
            addMoviesToGrid([data], 'movieGrid');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

function addMoviesToGrid(movies, gridId) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = ''; // Clear existing content
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${movie.posterUrl}" alt="${movie.title}">
            <h4 class="movie-title">${movie.title}</h4>
        `;
        grid.appendChild(movieCard);
    });
}

// Fetch trending movies and populate the grid
fetch('/api/trending')
    .then(response => response.json())
    .then(movies => {
        addMoviesToGrid(movies, 'movieGrid');
    })
    .catch(error => console.error('Error fetching movies:', error));
