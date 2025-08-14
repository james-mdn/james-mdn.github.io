let gameOfLifeInitialized = false;
let animationFrameId; // To store the ID of the animation frame or timeout

// Debounce function to limit how often a function is called
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

function initGameOfLife() {
    if (gameOfLifeInitialized) return;

    const canvas = document.getElementById('gameOfLifeCanvas');
    if (!canvas) {
        console.warn('Game of Life canvas not found. Skipping initialization.');
        return;
    }
    const ctx = canvas.getContext('2d');

    // Set canvas size to fill the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resolution = 20; // Size of each cell
    let cols = Math.floor(canvas.width / resolution);
    let rows = Math.floor(canvas.height / resolution);

    let grid;

    function createGrid() {
        const grid = new Array(cols).fill(null)
            .map(() => new Array(rows).fill(0)); // Initialize with all dead cells

        // Function to place a glider at a specific (x, y) coordinate with rotation
        function placeGlider(startX, startY, rotation = 0) {
            // Base Glider pattern relative to startX, startY
            const baseGlider = [
                [0, 1],
                [1, 2],
                [2, 0],
                [2, 1],
                [2, 2]
            ];

            let rotatedGlider = baseGlider.map(([dx, dy]) => {
                // Apply rotation: 0=0deg, 1=90deg, 2=180deg, 3=270deg
                switch (rotation % 4) {
                    case 0: return [dx, dy]; // 0 degrees
                    case 1: return [-dy, dx]; // 90 degrees clockwise
                    case 2: return [-dx, -dy]; // 180 degrees clockwise
                    case 3: return [dy, -dx]; // 270 degrees clockwise
                }
            });



            rotatedGlider.forEach(([dx, dy]) => {
                const x = startX + dx;
                const y = startY + dy;
                // Apply toroidal boundaries for initial glider placement
                const wrappedX = (x % cols + cols) % cols;
                const wrappedY = (y % rows + rows) % rows;
                grid[wrappedX][wrappedY] = 1;
            });
        }

        // Place a random number of gliders (e.g., between 6 and 13)
        const numberOfGliders = Math.floor(Math.random() * 7) + 6; // 6 to 13 gliders

        for (let k = 0; k < numberOfGliders; k++) {
            // Allow gliders to be placed anywhere, relying on toroidal boundaries for wrapping
            // Place gliders closer to edges for easier observation of wrapping
            const randomCol = Math.floor(Math.random() * (cols * 0.8)) + Math.floor(cols * 0.1);
            const randomRow = Math.floor(Math.random() * (rows * 0.8)) + Math.floor(rows * 0.1);
            const randomRotation = Math.floor(Math.random() * 4); // 0, 1, 2, or 3 for 0, 90, 180, 270 degrees
            placeGlider(randomCol, randomRow, randomRotation);
        }

        return grid;
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * resolution;
                const y = j * resolution;
                ctx.beginPath();
                ctx.rect(x, y, resolution, resolution);
                ctx.fillStyle = grid[i][j] === 1 ? 'black' : 'white';
                ctx.fill();
                ctx.strokeStyle = '#ccc'; // Light gray for grid lines
                ctx.stroke();
            }
        }
    }

    function getNextGeneration() {
        const nextGrid = grid.map(arr => [...arr]); // Create a deep copy

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const cell = grid[i][j];
                let liveNeighbors = 0;

                for (let xOffset = -1; xOffset <= 1; xOffset++) {
                    for (let yOffset = -1; yOffset <= 1; yOffset++) {
                        if (xOffset === 0 && yOffset === 0) continue;

                        // Implement toroidal boundaries using modulo operator
                        const neighborCol = (i + xOffset + cols) % cols;
                        const neighborRow = (j + yOffset + rows) % rows;

                        liveNeighbors += grid[neighborCol][neighborRow];
                    }
                }

                // Game of Life rules
                if (cell === 1 && (liveNeighbors < 2 || liveNeighbors > 3)) {
                    nextGrid[i][j] = 0; // Dies
                } else if (cell === 0 && liveNeighbors === 3) {
                    nextGrid[i][j] = 1; // Becomes alive
                }
                // Otherwise, cell state remains the same
            }
        }
        return nextGrid;
    }

    const gameSpeed = 200; // Milliseconds between generations

    function animate() {
        grid = getNextGeneration();
        drawGrid();
        animationFrameId = setTimeout(animate, gameSpeed);
    }

    // Initialize and start the game
    grid = createGrid();
    drawGrid();
    animate();

    // Handle window resizing with debounce for performance
    const handleResize = debounce(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.floor(canvas.width / resolution);
        rows = Math.floor(canvas.height / resolution);
        grid = createGrid(); // Re-initialize grid on resize
        drawGrid();
    }, 250); // Debounce by 250ms

    window.addEventListener('resize', handleResize);

    gameOfLifeInitialized = true;
}

document.addEventListener('DOMContentLoaded', () => {
    initGameOfLife(); // Initialize Game of Life on first load

    const mainContent = document.querySelector('main');
    const navLinks = document.querySelectorAll('.nav-link');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');

    // Function to show loading indicator
    function showLoading() {
        if (loadingIndicator) {
            loadingIndicator.classList.add('show');
        }
    }

    // Function to hide loading indicator
    function hideLoading() {
        if (loadingIndicator) {
            loadingIndicator.classList.remove('show');
        }
    }

    // Toggle mobile menu visibility and push down content
    if (menuToggle && navUl) {
        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('show');
            document.body.classList.toggle('nav-open');

            if (navUl.classList.contains('show')) {
                // Set CSS variable for navigation height
                document.body.style.setProperty('--nav-height', `${navUl.offsetHeight}px`);
            } else {
                // Reset CSS variable when menu is closed
                document.body.style.setProperty('--nav-height', '0px');
            }
        });
    }

    // Add event listeners to all navigation links for client-side routing
    navLinks.forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent default link behavior (full page reload)

            // Hide mobile menu and reset body class if open
            if (navUl && navUl.classList.contains('show')) {
                navUl.classList.remove('show');
                document.body.classList.remove('nav-open');
                document.body.style.setProperty('--nav-height', '0px');
            }

            showLoading(); // Show loading indicator

            const targetPage = link.dataset.href; // Get the target page from data-href attribute
            if (!targetPage) {
                hideLoading();
                return;
            }

            try {
                // Fetch the content of the target page
                const response = await fetch(targetPage);
                const html = await response.text();

                // Parse the fetched HTML to extract the main content
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newMainContent = doc.querySelector('main').innerHTML;
                const newTitle = doc.querySelector('title') ? doc.querySelector('title').textContent : document.title;

                // Update only the main content area of the current page
                mainContent.innerHTML = newMainContent;
                document.title = newTitle; // Update the page title

                // Update browser history to reflect the new URL without a full reload
                history.pushState({ path: targetPage }, '', targetPage);

            } catch (error) {
                console.error('Error loading page:', error);
                // Optionally, display a user-friendly error message on the page
            } finally {
                hideLoading(); // Hide loading indicator regardless of success or failure
            }
        });
    });

    // Handle browser back/forward button navigation
    window.addEventListener('popstate', async (event) => {
        // Check if there's a state object with a path (for pages loaded via pushState)
        if (event.state && event.state.path) {
            showLoading(); // Show loading indicator
            try {
                const response = await fetch(event.state.path);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newMainContent = doc.querySelector('main').innerHTML;
                const newTitle = doc.querySelector('title') ? doc.querySelector('title').textContent : document.title;

                mainContent.innerHTML = newMainContent;
                document.title = newTitle; // Update the page title
            } catch (error) {
                console.error('Error loading page on popstate:', error);
            } finally {
                hideLoading(); // Hide loading indicator
            }
        }
    });
});