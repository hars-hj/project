// Spotify API Configuration
const SPOTIFY_CLIENT_ID = '946cefb417b749af9a58fdac7c140fde';
const SPOTIFY_REDIRECT_URI = window.location.href.includes('127.0.0.1') 
    ? 'http://127.0.0.1:5500/temp2.html'
    : 'http://localhost:5500/temp2.html';
const SPOTIFY_SCOPES = [
    'user-read-recently-played',
    'user-top-read',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-read-private',
    'user-read-email'
];

// Debug logging
console.log('Current URL:', window.location.href);
console.log('Selected Redirect URI:', SPOTIFY_REDIRECT_URI);

class SpotifyIntegration {
    constructor() {
        this.accessToken = null;
        this.userProfile = null;
        this.musicProgress = 0;
        this.knownTracks = new Set();
        
        // Only load saved progress if it exists
        const savedProgress = localStorage.getItem('musicProgress');
        const savedTracks = localStorage.getItem('knownTracks');
        
        if (savedProgress !== null) {
            this.musicProgress = parseInt(savedProgress);
        }
        if (savedTracks !== null) {
            this.knownTracks = new Set(JSON.parse(savedTracks));
        }
        
        console.log('SpotifyIntegration initialized with progress:', this.musicProgress);
        this.init();
    }

    init() {
        // Check for access token in URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        this.accessToken = params.get('access_token');

        if (this.accessToken) {
            localStorage.setItem('spotify_access_token', this.accessToken);
            window.location.hash = '';
            this.onAuthenticated();
        } else {
            this.accessToken = localStorage.getItem('spotify_access_token');
            if (this.accessToken) {
                this.onAuthenticated();
            }
        }

        // Update the music branch with current progress
        this.initializeMusicBranch();
        
        // Initialize the progress card
        const musicBranch = branches.find(b => b.name === 'Music');
        if (musicBranch) {
            musicBranch.progress = this.musicProgress;
            musicBranch.level = Math.floor(this.musicProgress / 20);
            updateProgress(musicBranch);
        }

        // Set up Spotify login button
        const spotifyLoginBtn = document.getElementById('spotify-login');
        if (spotifyLoginBtn) {
            // Remove any existing listeners
            spotifyLoginBtn.replaceWith(spotifyLoginBtn.cloneNode(true));
            const newSpotifyLoginBtn = document.getElementById('spotify-login');
            
            // Add new click listener
            newSpotifyLoginBtn.addEventListener('click', () => {
                if (this.accessToken) {
                    this.showProfileMenu();
                } else {
                    this.login();
                }
            });

            // Update button state if already connected
            if (this.accessToken) {
                this.fetchUserProfile().then(profile => {
                    if (profile) {
                        this.updateLoginButton(true, profile);
                    }
                });
            }
        }
    }

    initializeMusicBranch() {
        console.log('Initializing music branch with progress:', this.musicProgress);
        const svg = document.getElementById('tree');
        let musicBranch = svg.querySelector('.branch[data-type="music"]');
        
        if (!musicBranch) {
            console.log('Creating new music branch');
            musicBranch = document.createElementNS("http://www.w3.org/2000/svg", "path");
            musicBranch.setAttribute('class', 'branch');
            musicBranch.setAttribute('data-type', 'music');
            
            // Create a more natural S-curved path for the branch
            // Starting from bottom right of the trunk, curving upward and to the right
            const path = [
                'M', 460, 480,  // Start at bottom right of trunk
                'C',            // First Cubic Bezier curve
                470, 460,      // Control point 1
                465, 440,      // Control point 2
                475, 420,      // End point of first curve
                'S',           // Smooth continuation
                485, 380,      // Control point (mirror calculated automatically)
                470, 360,      // End point of second curve
                'S',           // Another smooth continuation
                450, 340,      // Control point
                465, 320       // Final end point
            ].join(' ');
            
            musicBranch.setAttribute('d', path);
            musicBranch.style.stroke = '#1DB954';
            musicBranch.style.fill = 'none';
            musicBranch.style.strokeWidth = `${Math.max((this.musicProgress / 100) * 6 + 2, 2)}px`;
            musicBranch.style.strokeLinecap = 'round';
            musicBranch.style.strokeLinejoin = 'round';
            svg.appendChild(musicBranch);
        } else {
            console.log('Updating existing music branch');
            musicBranch.style.strokeWidth = `${Math.max((this.musicProgress / 100) * 6 + 2, 2)}px`;
        }
    }

    login() {
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('spotify_auth_state', state);

        const params = new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            response_type: 'token',
            redirect_uri: SPOTIFY_REDIRECT_URI,
            state: state,
            scope: SPOTIFY_SCOPES.join(' '),
            show_dialog: true
        });

        const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
        window.location.href = authUrl;
    }

    async onAuthenticated() {
        try {
            const profile = await this.fetchUserProfile();
            if (profile) {
                this.updateLoginButton(true, profile);
                this.initializeMusicActivity();
                this.startTracking();
            } else {
                this.clearTokens();
            }
        } catch (error) {
            console.error('Error after authentication:', error);
            this.clearTokens();
        }
    }

    async fetchUserProfile() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });

            if (response.status === 401) {
                this.clearTokens();
                return null;
            }

            this.userProfile = await response.json();
            return this.userProfile;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    updateLoginButton(isConnected, profile = null) {
        const button = document.getElementById('spotify-login');
        if (isConnected && profile) {
            button.innerHTML = `
                <img src="${profile.images[0]?.url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png'}" 
                     alt="Profile" 
                     class="spotify-profile-pic">
                <span>${profile.display_name}</span>
            `;
            button.classList.add('spotify-connected');
        } else {
            button.innerHTML = `
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png" 
                     alt="Spotify" 
                     class="spotify-icon">
                Connect Spotify
            `;
            button.classList.remove('spotify-connected');
        }
    }

    showProfileMenu() {
        // Create profile menu if it doesn't exist
        let menu = document.getElementById('spotify-profile-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'spotify-profile-menu';
            menu.className = 'spotify-profile-menu';
            menu.innerHTML = `
                <div class="menu-item profile-info">
                    <img src="${this.userProfile?.images[0]?.url || ''}" alt="Profile" class="profile-pic">
                    <div class="profile-details">
                        <div class="profile-name">${this.userProfile?.display_name}</div>
                        <div class="profile-email">${this.userProfile?.email}</div>
                    </div>
                </div>
                <div class="menu-item" onclick="spotifyIntegration.openSpotifyProfile()">
                    Open Spotify Profile
                </div>
                <div class="menu-item" onclick="spotifyIntegration.disconnect()">
                    Disconnect
                </div>
            `;
            document.body.appendChild(menu);

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !e.target.closest('#spotify-login')) {
                    menu.style.display = 'none';
                }
            });
        }

        // Toggle menu visibility
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }

    openSpotifyProfile() {
        if (this.userProfile?.external_urls?.spotify) {
            window.open(this.userProfile.external_urls.spotify, '_blank');
        }
    }

    disconnect() {
        this.clearTokens();
        this.userProfile = null;
        this.updateLoginButton(false);
        const menu = document.getElementById('spotify-profile-menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    clearTokens() {
        this.accessToken = null;
        localStorage.removeItem('spotify_access_token');
    }

    startTracking() {
        this.updateMusicProgress();
        setInterval(() => this.updateMusicProgress(), 10000);
    }

    async updateMusicProgress() {
        if (!this.accessToken) {
            console.log('No access token available');
            return;
        }

        try {
            console.log('Fetching recent tracks...');
            const recentTracks = await this.fetchRecentTracks();
            const topArtists = await this.fetchTopArtists();
            
            let newTracksFound = false;
            let newTrackCount = 0;
            
            if (recentTracks && recentTracks.length > 0) {
                console.log('Processing', recentTracks.length, 'recent tracks');
                for (const item of recentTracks) {
                    const trackId = item.track.id;
                    if (!this.knownTracks.has(trackId)) {
                        console.log('New track found:', item.track.name);
                        this.knownTracks.add(trackId);
                        newTracksFound = true;
                        newTrackCount++;
                        // Grow branch for each new track individually
                        await this.growMusicBranch(1);
                    }
                }

                if (newTracksFound) {
                    console.log(`Found ${newTrackCount} new tracks`);
                    localStorage.setItem('knownTracks', JSON.stringify(Array.from(this.knownTracks)));
                }

                // Update activity log without changing progress
                this.updateMusicActivity(recentTracks, topArtists);
            }
        } catch (error) {
            console.error('Error updating music progress:', error);
            if (error.status === 401) {
                this.clearTokens();
                this.updateLoginButton(false);
            }
        }
    }

    growMusicBranch(newTrackCount = 1) {
        return new Promise(resolve => {
            console.log('Growing music branch, current progress:', this.musicProgress);
            const oldProgress = this.musicProgress;
            
            // Only grow if not at max progress
            if (this.musicProgress < 100) {
                // Calculate new progress
                const progressIncrement = 10; // 10% per track
                this.musicProgress = Math.min(this.musicProgress + progressIncrement, 100);
                
                console.log('New progress:', this.musicProgress);

                // Update branch in the branches array
                const musicBranch = branches.find(b => b.name === 'Music');
                if (musicBranch) {
                    musicBranch.progress = this.musicProgress;
                    musicBranch.level = Math.floor(this.musicProgress / 20);
                    updateProgress(musicBranch);
                }

                // Update the branch visualization
                const musicBranchSVG = document.querySelector('.branch[data-type="music"]');
                if (musicBranchSVG) {
                    const newWidth = Math.max((this.musicProgress / 100) * 6 + 2, 2);
                    console.log('Setting new branch width:', newWidth);
                    
                    // Show growth notification only if progress actually increased
                    if (this.musicProgress > oldProgress) {
                        this.showGrowthNotification(oldProgress, this.musicProgress);
                    }
                    
                    musicBranchSVG.style.transition = 'stroke-width 0.5s ease-in-out';
                    musicBranchSVG.style.strokeWidth = `${newWidth}px`;
                    
                    musicBranchSVG.classList.add('growing');
                    setTimeout(() => {
                        musicBranchSVG.classList.remove('growing');
                        console.log('Growth animation completed');
                    }, 1000);

                    // Save progress to localStorage
                    localStorage.setItem('musicProgress', this.musicProgress.toString());

                    // Add leaf at specific progress points
                    if (this.musicProgress % 20 === 0 && this.musicProgress > 0) {
                        console.log('Adding music leaf at progress:', this.musicProgress);
                        this.addMusicLeaf(musicBranchSVG);
                    }
                } else {
                    console.error('Music branch not found in DOM');
                }

                // Save state
                saveState();
            } else {
                console.log('Already at max progress (100%)');
            }
            
            setTimeout(resolve, 1000); // Wait for animation to complete
        });
    }

    updateProgressBar() {
        // Find the music progress card
        const musicCards = document.querySelectorAll('.progress-card');
        let musicCard = null;
        musicCards.forEach(card => {
            if (card.querySelector('.card-title').textContent.includes('Music')) {
                musicCard = card;
            }
        });

        if (musicCard) {
            // Update percentage text
            const percentageElement = musicCard.querySelector('.progress-percentage');
            if (percentageElement) {
                percentageElement.textContent = `${this.musicProgress}%`;
            }

            // Update progress bar fill
            const progressFill = musicCard.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${this.musicProgress}%`;
            }

            // Update level indicator
            const levelIndicator = musicCard.querySelector('.level-indicator');
            if (levelIndicator) {
                const level = Math.floor(this.musicProgress / 20); // 20% per level, 5 levels total
                levelIndicator.textContent = `Level ${level}/5`;
            }
        }
    }

    showGrowthNotification(oldProgress, newProgress) {
        // Create or get notification container
        let notifContainer = document.getElementById('growth-notification');
        if (!notifContainer) {
            notifContainer = document.createElement('div');
            notifContainer.id = 'growth-notification';
            document.body.appendChild(notifContainer);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'growth-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🎵</span>
                <div class="notification-text">
                    <div>Music Branch Growing!</div>
                    <div class="progress-text">Progress: ${oldProgress}% → ${newProgress}%</div>
                </div>
            </div>
        `;

        // Add to container
        notifContainer.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    addMusicLeaf(branch) {
        const svg = document.getElementById('tree');
        
        // Calculate position along the branch path based on progress
        const progress = this.musicProgress / 100;
        
        // Create leaf group
        const leafGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        leafGroup.setAttribute('class', 'music-leaf');
        
        // Calculate position along the S-curve
        // Adjust these calculations to match the new branch curve
        const baseX = 460; // Starting X
        const baseY = 480; // Starting Y
        
        // Calculate position along the S-curve
        const x = baseX + (15 * progress) - (Math.sin(progress * Math.PI) * 20);
        const y = baseY - (160 * progress) + (Math.sin(progress * Math.PI * 2) * 10);
        
        // Create main leaf circle
        const mainLeaf = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        mainLeaf.setAttribute('cx', x);
        mainLeaf.setAttribute('cy', y);
        mainLeaf.setAttribute('r', '4');
        mainLeaf.style.fill = '#1DB954';
        
        // Create smaller decorative circles in a more natural arrangement
        const decorations = [
            { dx: -3, dy: -3, size: 2, color: '#2EE66B' },
            { dx: 3, dy: -3, size: 2, color: '#2EE66B' },
            { dx: 0, dy: -4, size: 2, color: '#2EE66B' },
            { dx: 0, dy: 0, size: 1, color: '#4AFF83' }  // Center highlight
        ];
        
        decorations.forEach(({ dx, dy, size, color }) => {
            const decor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            decor.setAttribute('cx', (x + dx).toString());
            decor.setAttribute('cy', (y + dy).toString());
            decor.setAttribute('r', size.toString());
            decor.style.fill = color;
            leafGroup.appendChild(decor);
        });
        
        // Add main leaf last so it appears on top
        leafGroup.appendChild(mainLeaf);
        svg.appendChild(leafGroup);
        
        // Add growth animation
        leafGroup.style.animation = 'growLeaf 0.5s ease-out forwards';
    }

    async fetchRecentTracks() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            
            if (!response.ok) {
                throw { status: response.status, message: 'Failed to fetch recent tracks' };
            }
            
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching recent tracks:', error);
            throw error;
        }
    }

    async fetchTopArtists() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=5', {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            
            if (!response.ok) {
                throw { status: response.status, message: 'Failed to fetch top artists' };
            }
            
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching top artists:', error);
            return [];
        }
    }

    updateMusicActivity(recentTracks, topArtists) {
        // Track unique artists and genres
        const uniqueArtists = new Set();
        const uniqueGenres = new Set();

        // Process recent tracks
        const recentTracksList = document.getElementById('recent-tracks-list');
        if (recentTracksList && recentTracks) {
            recentTracksList.innerHTML = recentTracks.slice(0, 5).map(item => {
                uniqueArtists.add(item.track.artists[0].id);
                return `
                    <div class="activity-item">
                        <img src="${item.track.album.images[2]?.url || ''}" alt="${item.track.name}" class="activity-image">
                        <div class="activity-details">
                            <span class="activity-title">${item.track.name}</span>
                            <span class="activity-subtitle">${item.track.artists[0].name}</span>
                            <span class="activity-time">${new Date(item.played_at).toLocaleTimeString()}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Process top artists
        const topArtistsList = document.getElementById('top-artists-list');
        if (topArtistsList && topArtists) {
            topArtistsList.innerHTML = topArtists.slice(0, 5).map(artist => {
                artist.genres.forEach(genre => uniqueGenres.add(genre));
                return `
                    <div class="activity-item">
                        <img src="${artist.images[2]?.url || ''}" alt="${artist.name}" class="activity-image">
                        <div class="activity-details">
                            <span class="activity-title">${artist.name}</span>
                            <span class="activity-subtitle">${artist.genres[0] || 'No genre'}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Update genre list
        const genresList = document.getElementById('genres-list');
        if (genresList) {
            genresList.innerHTML = Array.from(uniqueGenres).slice(0, 5).map(genre => `
                <div class="activity-item">
                    <div class="activity-details">
                        <span class="activity-title">${genre}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    initializeMusicActivity() {
        // Get the reading log view
        const readingLogView = document.getElementById('reading-log-view');
        if (!readingLogView) return;

        // Find or create music activity section
        let musicActivity = readingLogView.querySelector('.music-activity');
        if (!musicActivity) {
            musicActivity = document.createElement('div');
            musicActivity.className = 'music-activity';
            musicActivity.innerHTML = `
                <h3>Music Activity Log 🎵</h3>
                <div class="music-details">
                    <div class="detail-section">
                        <h4>Recent Tracks</h4>
                        <div id="recent-tracks-list" class="detail-list"></div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Top Artists</h4>
                        <div id="top-artists-list" class="detail-list"></div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Favorite Genres</h4>
                        <div id="genres-list" class="detail-list"></div>
                    </div>
                </div>
            `;
            readingLogView.appendChild(musicActivity);
        }

        // Show the activity log
        const readingLogToggle = document.getElementById('reading-log-toggle');
        if (readingLogToggle) {
            readingLogToggle.click();
        }
    }
}

// Initialize Spotify integration
const spotifyIntegration = new SpotifyIntegration();