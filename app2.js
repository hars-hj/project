function getCubicBezierPoint(t, p0, p1, p2, p3) {
  const x = Math.pow(1 - t, 3) * p0.x +
            3 * Math.pow(1 - t, 2) * t * p1.x +
            3 * (1 - t) * Math.pow(t, 2) * p2.x +
            Math.pow(t, 3) * p3.x;

  const y = Math.pow(1 - t, 3) * p0.y +
            3 * Math.pow(1 - t, 2) * t * p1.y +
            3 * (1 - t) * Math.pow(t, 2) * p2.y +
            Math.pow(t, 3) * p3.y;

  return { x, y };
}

// Spotify Integration
let spotifyConnected = false;
let spotifyExploredItems = {
  songs: [],
  artists: [],
  genres: []
};

// Demo data for simulation
const demoSongs = [
  "Bohemian Rhapsody", "Imagine", "Billie Jean", "Smells Like Teen Spirit",
  "Sweet Child O' Mine", "Like a Rolling Stone", "Stairway to Heaven",
  "Yesterday", "Hey Jude", "Viva la Vida", "Uptown Funk", "Shape of You",
  "Hotel California", "Thriller", "Watermelon Sugar"
];

const demoArtists = [
  "Queen", "The Beatles", "Michael Jackson", "Led Zeppelin", "Nirvana",
  "Bob Dylan", "Beyoncé", "Coldplay", "Taylor Swift", "Ed Sheeran",
  "Guns N' Roses", "Adele", "The Rolling Stones", "Bruno Mars", "Lady Gaga"
];

const demoGenres = [
  "Rock", "Pop", "Hip Hop", "Jazz", "Classical", "Electronic", "R&B",
  "Country", "Folk", "Metal", "Reggae", "Soul", "Blues", "Indie", "Latin"
];

// Create Spotify UI elements
function createSpotifyUI() {
  // Find music branch
  const musicBranch = branches.find(b => b.name === "Music");
  if (!musicBranch) return;

  // Create notification container
  const notificationContainer = document.createElement('div');
  notificationContainer.id = 'spotify-notification';
  notificationContainer.style.position = 'fixed';
  notificationContainer.style.bottom = '20px';
  notificationContainer.style.right = '20px';
  notificationContainer.style.backgroundColor = '#1DB954';
  notificationContainer.style.color = 'white';
  notificationContainer.style.padding = '12px 20px';
  notificationContainer.style.borderRadius = '8px';
  notificationContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notificationContainer.style.zIndex = '1000';
  notificationContainer.style.display = 'none';
  notificationContainer.style.transition = 'all 0.3s ease';
  notificationContainer.style.transform = 'translateY(20px)';
  notificationContainer.style.opacity = '0';
  
  document.body.appendChild(notificationContainer);
  
  // Update reading log toggle button text to be more inclusive
  const readingLogToggle = document.getElementById('reading-log-toggle');
  if (readingLogToggle) {
    readingLogToggle.textContent = '📚 Show Activity Log';
  }
}

// Connect to Spotify function
function connectToSpotify() {
  if (spotifyConnected) return;
  
  const spotifyBtn = document.getElementById('spotify-connect-btn');
  
  if (spotifyBtn) {
    // Update button appearance
    spotifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    spotifyBtn.disabled = true;
    
    // Simulate connection delay
    setTimeout(() => {
      spotifyConnected = true;
      spotifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Connected to Spotify';
      spotifyBtn.style.backgroundColor = '#1AA34A';
      
      // Show success notification
      showNotification('Successfully connected to Spotify! Explore music to grow your Music branch.');
      
      // Add initial discoveries to show immediate activity
      setTimeout(() => {
        addMusicItem('songs', demoSongs[0]);
        addMusicItem('artists', demoArtists[0]);
        addMusicItem('genres', demoGenres[0]);
        
        // Show notification to check activity log
        setTimeout(() => {
          showNotification('Check your Activity Log to see your music discoveries!');
        }, 4000);
        
        // Start music discovery simulation
        startDiscoverySimulation();
      }, 2000);
    }, 1500);
  }
}

// Add a music item (song, artist, or genre)
function addMusicItem(type, name) {
  // Check if already exists
  if (spotifyExploredItems[type].includes(name)) return false;
  
  // Add to list
  spotifyExploredItems[type].push(name);
  
  // Update UI counters
  const songsCount = document.getElementById('songs-count');
  const artistsCount = document.getElementById('artists-count');
  const genresCount = document.getElementById('genres-count');
  
  if (songsCount) songsCount.textContent = spotifyExploredItems.songs.length;
  if (artistsCount) artistsCount.textContent = spotifyExploredItems.artists.length;
  if (genresCount) genresCount.textContent = spotifyExploredItems.genres.length;
  
  // Add item to UI
  const musicItemsContainer = document.getElementById('music-items-container');
  if (musicItemsContainer) {
    const itemElement = document.createElement('div');
    itemElement.style.display = 'flex';
    itemElement.style.alignItems = 'center';
    itemElement.style.background = '#f9f9f9';
    itemElement.style.padding = '8px 12px';
    itemElement.style.borderRadius = '5px';
    itemElement.style.marginBottom = '8px';
    
    // Choose icon based on type
    let icon = 'music';
    if (type === 'artists') icon = 'user';
    if (type === 'genres') icon = 'guitar';
    
    // Format type for display
    const formattedType = type.substring(0, type.length - 1);
    
    // Add content
    itemElement.innerHTML = `
      <div style="width: 30px; height: 30px; background: #1DB954; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
        <i class="fas fa-${icon}" style="color: white;"></i>
      </div>
      <div style="flex-grow: 1;">
        <div style="font-weight: bold;">${name}</div>
        <div style="font-size: 0.8em; color: #666;">${formattedType}</div>
      </div>
      <div style="color: #999; font-size: 0.8em;">${new Date().toLocaleTimeString()}</div>
    `;
    
    // Add to container
    musicItemsContainer.prepend(itemElement);
  }
  
  // Update Music branch
  const musicBranch = branches.find(b => b.name === "Music");
  if (musicBranch) {
    // Calculate total explored items
    const totalItems = spotifyExploredItems.songs.length + 
                      spotifyExploredItems.artists.length + 
                      spotifyExploredItems.genres.length;
    
    // Update progress (5% per item, max 100%)
    const oldLevel = musicBranch.level;
    musicBranch.progress = Math.min(100, totalItems * 5);
    musicBranch.level = Math.min(5, Math.floor(musicBranch.progress / 20));
    
    // Save state
    saveState();
    
    // Update UI
    updateProgress(musicBranch);
    
    // Celebrate if level increased
    if (musicBranch.level > oldLevel) {
      celebrateMilestone(musicBranch);
      showNotification(`Music branch leveled up to ${musicBranch.level}!`);
    }
    
    // Re-render tree
    renderTree();
  }
  
  // Show notification
  showNotification(`New ${formattedType} discovered: ${name}`);
  
  return true;
}

// Show notification
function showNotification(message) {
  const notification = document.getElementById('spotify-notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.style.display = 'block';
  notification.style.transform = 'translateY(0)';
  notification.style.opacity = '1';
  
  setTimeout(() => {
    notification.style.transform = 'translateY(20px)';
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 300);
  }, 3000);
}

// Start music discovery simulation
function startDiscoverySimulation() {
  // Function to get random undiscovered item
  function getRandomNewItem(array, discovered) {
    const undiscovered = array.filter(item => !discovered.includes(item));
    if (undiscovered.length === 0) return null;
    return undiscovered[Math.floor(Math.random() * undiscovered.length)];
  }
  
  // Discover new items periodically
  const discoveryInterval = setInterval(() => {
    if (!spotifyConnected) {
      clearInterval(discoveryInterval);
      return;
    }
    
    // Choose item type randomly
    const types = ['songs', 'artists', 'genres'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Get random item
    let newItem;
    switch (type) {
      case 'songs':
        newItem = getRandomNewItem(demoSongs, spotifyExploredItems.songs);
        break;
      case 'artists':
        newItem = getRandomNewItem(demoArtists, spotifyExploredItems.artists);
        break;
      case 'genres':
        newItem = getRandomNewItem(demoGenres, spotifyExploredItems.genres);
        break;
    }
    
    // Add item if found
    if (newItem) {
      addMusicItem(type, newItem);
    } else {
      // All items discovered, stop interval
      clearInterval(discoveryInterval);
    }
  }, 7000); // Discover every 7 seconds
}

// Initialize Spotify integration
function initSpotify() {
  createSpotifyUI();
}

const branchSelector = document.createElement("select");
branchSelector.id = "branch-select";
["Literature", "Academics", "Wellness", "Skills"].forEach(branchName => {
  const option = document.createElement("option");
  option.value = branchName;
  option.textContent = branchName;
  branchSelector.appendChild(option);
});
document.getElementById("input-group").prepend(branchSelector);



 // Constants and setup
 const svgNS = "http://www.w3.org/2000/svg";
 const svg = document.getElementById('tree');
 const tooltip = document.getElementById('tooltip');
 const centerX = 450, centerY = 500;
 
 // Branch definitions with descriptions and levels
 const branches = [
   { 
     name: "Literature", 
     color: "#8e44ad", 
     angle: -60, 
     progress: 0,
     level: 0,
     description: "Explore the world of books and writing",
     skills: ["Reading", "Writing", "Literary Analysis", "Creative Writing", "Poetry"]
   },
   { 
     name: "Academics", 
     color: "#3498db", 
     angle: -30, 
     progress: 0,
     level: 0,
     description: "Knowledge across various educational subjects",
     skills: ["Mathematics", "Science", "History", "Languages", "Research"]
   },
   { 
     name: "Music", 
     color: "#e67e22", 
     angle: 0, 
     progress: 0,
     level: 0,
     description: "Skills in musical performance and theory",
     skills: ["Instruments", "Singing", "Composition", "Music Theory", "Performance"]
   },
   { 
     name: "Wellness", 
     color: "#27ae60", 
     angle: 30, 
     progress: 0,
     level: 0,
     description: "Health for body and mind",
     skills: ["Exercise", "Nutrition", "Meditation", "Sleep", "Mental Health"]
   },
   { 
     name: "Skills", 
     color: "#f39c12", 
     angle: 60, 
     progress: 0,
     level: 0,
     description: "Practical abilities for everyday life",
     skills: ["Cooking", "Finance", "DIY", "Technology", "Communication"]
   }
 ];
 // new code here
 const literatureBranch = branches.find(b => b.name === "Literature");
let loggedBooks = JSON.parse(localStorage.getItem('loggedBooks')) || [];


 // Initialize state from localStorage if available
 function loadState() {
   const savedState = localStorage.getItem('skillTreeState');
   if (savedState) {
     const parsedState = JSON.parse(savedState);
     branches.forEach((branch, index) => {
       if (parsedState[index]) {
         branch.progress = parsedState[index].progress;
         branch.level = parsedState[index].level || Math.floor(branch.progress / 20);
       }
     });
   }
   
   // Load theme preference
   const darkMode = localStorage.getItem('darkMode') === 'true';
   if (darkMode) {
     document.body.classList.add('dark-mode');
     document.getElementById('theme-toggle').textContent = '☀️ Light Mode';
   }
 }
 
 function saveState() {
   const state = branches.map(branch => ({
     progress: branch.progress,
     level: branch.level
   }));
   localStorage.setItem('skillTreeState', JSON.stringify(state));
 }
 
 // SVG helper function
 function createSVG(type, attrs) {
   const el = document.createElementNS(svgNS, type);
   Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
   return el;
 }
 
 // Drawing functions
 function drawTrunk() {
  // Create main trunk gradient with vertical orientation
  const mainGradient = createSVG("linearGradient", {
    id: "mainTrunkGradient",
    x1: "0%", y1: "0%", x2: "0%", y2: "100%" // Vertical gradient
  });

  mainGradient.innerHTML = `
    <stop offset="0%" stop-color="#8B5A2B"/>
    <stop offset="25%" stop-color="#7D4E24"/>
    <stop offset="50%" stop-color="#6B4226"/>
    <stop offset="75%" stop-color="#7D4E24"/>
    <stop offset="100%" stop-color="#8B5A2B"/>
  `;
  svg.appendChild(mainGradient);

  // Create main trunk shape - wider at bottom, narrow in middle, expanding at top for branches
  const mainTrunk = createSVG("path", {
    d: `
      M${centerX - 60},${centerY} 
      C${centerX - 60},${centerY - 60} ${centerX - 50},${centerY - 120} ${centerX - 40},${centerY - 180}
      C${centerX - 35},${centerY - 220} ${centerX - 30},${centerY - 250} ${centerX},${centerY - 260}
      C${centerX + 30},${centerY - 250} ${centerX + 35},${centerY - 220} ${centerX + 40},${centerY - 180}
      C${centerX + 50},${centerY - 120} ${centerX + 60},${centerY - 60} ${centerX + 60},${centerY}
      Q${centerX + 30},${centerY + 20} ${centerX},${centerY + 25}
      Q${centerX - 30},${centerY + 20} ${centerX - 60},${centerY}
    `,
    fill: "url(#mainTrunkGradient)",
    stroke: "#6B4226",
    "stroke-width": 1.5,
    "stroke-linejoin": "round"
  });
  svg.appendChild(mainTrunk);

  // Add dark center line to give impression of trunk splitting
  const centerLine = createSVG("path", {
    d: `
      M${centerX},${centerY + 10}
      C${centerX},${centerY - 60} ${centerX},${centerY - 120} ${centerX},${centerY - 260}
    `,
    stroke: "#5D4037",
    "stroke-width": 1,
    opacity: 0.3,
    fill: "none"
  });
  svg.appendChild(centerLine);

  // Add bark texture - vertical grooves
  const barkPatterns = [
    // Left side grooves
    ...Array(6).fill().map((_, i) => ({
      x: centerX - 50 + i * 8,
      length: 180 + Math.random() * 40,
      curve: 3 + Math.random() * 5,
      side: "left"
    })),
    // Right side grooves
    ...Array(6).fill().map((_, i) => ({
      x: centerX + 10 + i * 8,
      length: 180 + Math.random() * 40,
      curve: 3 + Math.random() * 5,
      side: "right"
    })),
    // Horizontal cracks
    ...Array(6).fill().map((_, i) => ({
      y: centerY - 220 + i * 30,
      width: 20 + Math.random() * 30,
      curve: 2 + Math.random() * 3
    }))
  ];

  // Create bark texture group
  const barkGroup = createSVG("g", {
    class: "bark-texture",
    style: "opacity: 0.7;"
  });

  // Add vertical grooves and horizontal cracks
  barkPatterns.forEach(pattern => {
    if ('x' in pattern) {
      // Vertical groove
      const curveDirection = pattern.side === "left" ? -1 : 1;
      const groove = createSVG("path", {
        d: `
          M${pattern.x},${centerY - pattern.length + 60}
          q${pattern.curve * curveDirection},${pattern.length/3} ${pattern.curve * 2 * curveDirection},${pattern.length - 60}
        `,
        stroke: "#5D4037",
        "stroke-width": 1,
        fill: "none",
        "stroke-linecap": "round",
        opacity: 0.6
      });
      barkGroup.appendChild(groove);
    } else {
      // Horizontal crack
      const crack = createSVG("path", {
        d: `
          M${centerX - pattern.width},${pattern.y}
          q${pattern.width},${pattern.curve} ${pattern.width * 2},0
        `,
        stroke: "#5D4037",
        "stroke-width": 0.7,
        fill: "none",
        opacity: 0.5
      });
      barkGroup.appendChild(crack);
    }
  });
  svg.appendChild(barkGroup);

  // Add root system at base
  const roots = [
    { angle: -60, length: 40 },
    { angle: -30, length: 50 },
    { angle: 0, length: 30 },
    { angle: 30, length: 50 },
    { angle: 60, length: 40 }
  ];

  const rootGroup = createSVG("g", {
    class: "roots"
  });

  roots.forEach(root => {
    const rad = root.angle * Math.PI / 180;
    const rootPath = createSVG("path", {
      d: `
        M${centerX + 20 * Math.sin(rad)},${centerY}
        Q${centerX + (root.length/2) * Math.sin(rad)},${centerY + 15}
         ${centerX + root.length * Math.sin(rad)},${centerY + 10}
      `,
      stroke: "#6B4226",
      "stroke-width": 8,
      "stroke-linecap": "round",
      fill: "none"
    });
    rootGroup.appendChild(rootPath);
  });
  svg.appendChild(rootGroup);

  // Enhanced ground shadow
  const shadowGradient = createSVG("radialGradient", {
    id: "shadowGradient",
    cx: "50%", cy: "50%", r: "50%", fx: "50%", fy: "50%"
  });

  shadowGradient.innerHTML = `
    <stop offset="0%" stop-color="rgba(0,0,0,0.3)"/>
    <stop offset="70%" stop-color="rgba(0,0,0,0.1)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  `;
  svg.appendChild(shadowGradient);

  const shadow = createSVG("ellipse", {
    cx: centerX,
    cy: centerY + 15,
    rx: 90,
    ry: 20,
    fill: "url(#shadowGradient)",
    filter: "blur(5px)"
  });
  svg.appendChild(shadow);
}


 
 function drawGround() {
   // Draw a simple ground/soil under the tree
   const groundGradient = createSVG("radialGradient", {
     id: "groundGradient",
     cx: "50%", cy: "50%", r: "50%", fx: "50%", fy: "50%"
   });
   
   const groundStop1 = createSVG("stop", {
     offset: "0%",
     "stop-color": "#8B5A2B"
   });
   
   const groundStop2 = createSVG("stop", {
     offset: "100%",
     "stop-color": "#654321"
   });
   
   groundGradient.appendChild(groundStop1);
   groundGradient.appendChild(groundStop2);
   svg.appendChild(groundGradient);
   
   const ground = createSVG("ellipse", {
     cx: centerX, cy: centerY + 5,
     rx: 80, ry: 20,
     fill: "url(#groundGradient)"
   });
   
   svg.appendChild(ground);
 }
 
 function drawBranch(branch) {
  const rad = branch.angle * Math.PI / 180;
  const branchLength = 60 + branch.progress * 2.2;
  const curveAmount = 40 + (branch.progress / 2);

  // Move base to side of trunk based on angle - make connection points wider apart
  const baseX = centerX + (branch.angle > 0 ? 35 : (branch.angle < 0 ? -35 : 0));
  const baseY = centerY - 200 - (Math.abs(branch.angle) * 0.3);

  const endX = baseX + branchLength * Math.sin(rad);
  const endY = baseY - branchLength * Math.cos(rad);

  // Create more natural curve for main branch with smoother bends
  const controlX1 = baseX + (branchLength * 0.3) * Math.sin(rad) + (curveAmount * 0.8 * Math.cos(rad));
  const controlY1 = baseY - (branchLength * 0.3) * Math.cos(rad) + (curveAmount * 0.8 * Math.sin(rad));
  const controlX2 = baseX + (branchLength * 0.7) * Math.sin(rad) - (curveAmount * 0.7 * Math.cos(rad));
  const controlY2 = baseY - (branchLength * 0.7) * Math.cos(rad) - (curveAmount * 0.7 * Math.sin(rad));

  // Create smoother branch gradient with more color transitions
  const branchGradient = createSVG("linearGradient", {
    id: `branchGradient${branch.name}`,
    x1: "0%", y1: "0%",
    x2: "100%", y2: "100%"
  });

  branchGradient.innerHTML = `
    <stop offset="0%" stop-color="#6B4226"/>
    <stop offset="30%" stop-color="#7D4E24"/>
    <stop offset="60%" stop-color="#8B5A2B"/>
    <stop offset="100%" stop-color="#9C6B3B"/>
  `;
  svg.appendChild(branchGradient);

  // Create tapering branch width using more segments for smoother transition
  const segments = 12; // More segments for smoother tapering
  const mainBranchGroup = createSVG("g", {
    class: "main-branch",
    "data-name": branch.name,
    style: "cursor: pointer;"
  });

  // Create segments that gradually decrease in width - broader at base
  for (let i = 0; i < segments; i++) {
    const t1 = i / segments;
    const t2 = (i + 1) / segments;
    
    const startPoint = getCubicBezierPoint(t1,
      { x: baseX, y: baseY },
      { x: controlX1, y: controlY1 },
      { x: controlX2, y: controlY2 },
      { x: endX, y: endY }
    );
    
    const endPoint = getCubicBezierPoint(t2,
      { x: baseX, y: baseY },
      { x: controlX1, y: controlY1 },
      { x: controlX2, y: controlY2 },
      { x: endX, y: endY }
    );
    
    // Calculate control points for this segment - make smoother
    const segmentT1 = t1 + 0.33 * (t2 - t1);
    const segmentT2 = t1 + 0.66 * (t2 - t1);
    
    const segControlPoint1 = getCubicBezierPoint(segmentT1,
      { x: baseX, y: baseY },
      { x: controlX1, y: controlY1 },
      { x: controlX2, y: controlY2 },
      { x: endX, y: endY }
    );
    
    const segControlPoint2 = getCubicBezierPoint(segmentT2,
      { x: baseX, y: baseY },
      { x: controlX1, y: controlY1 },
      { x: controlX2, y: controlY2 },
      { x: endX, y: endY }
    );
    
    // Make branches broader, especially at the base - nonlinear tapering for more natural look
    // Use exponential decrease instead of linear for more natural tapering
    const startWidth = 25 - (branch.level * 1.2); // Increased from 20 to 25
    const endWidth = 3;
    
    // Exponential tapering function - thicker near trunk, thinner at tips
    const progress = i / segments;
    const segmentWidth = startWidth * Math.pow(1 - progress, 1.5) + endWidth * progress;
    
    // Create the segment
    const segment = createSVG("path", {
      d: `M${startPoint.x},${startPoint.y} C${segControlPoint1.x},${segControlPoint1.y} ${segControlPoint2.x},${segControlPoint2.y} ${endPoint.x},${endPoint.y}`,
      stroke: `url(#branchGradient${branch.name})`,
      "stroke-width": segmentWidth,
      "stroke-linecap": i === 0 || i === segments - 1 ? "round" : "butt",
      fill: "none",
      class: "branch-segment",
      style: i === 0 ? "filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));" : ""
    });
    
    mainBranchGroup.appendChild(segment);
  }
  
  svg.appendChild(mainBranchGroup);

  // Add more subtle branch texture for a smoother look
  const branchTexture = createSVG("path", {
    d: `M${baseX},${baseY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`,
    stroke: "#5D4037",
    "stroke-width": 0.8,
    "stroke-dasharray": "12 15",
    opacity: 0.2,
    fill: "none"
  });
  svg.appendChild(branchTexture);

  // Add sub-branches with improved tapering effect
  const numSubBranches = Math.min(3, Math.floor(branch.level * 1.5));
  for (let i = 0; i < numSubBranches; i++) {
    const t = 0.3 + (i * 0.25); // Position along main branch
    const point = getCubicBezierPoint(t,
      { x: baseX, y: baseY },
      { x: controlX1, y: controlY1 },
      { x: controlX2, y: controlY2 },
      { x: endX, y: endY }
    );

    const subLength = branchLength * 0.4;
    const subAngle = rad + (Math.PI / 4) * (i % 2 === 0 ? 1 : -1);
    
    const subEndX = point.x + subLength * Math.sin(subAngle);
    const subEndY = point.y - subLength * Math.cos(subAngle);
    
    // Create sub branch with improved control points for smoother curves
    const subControlX = point.x + subLength * 0.5 * Math.sin(subAngle) + (subLength * 0.25 * Math.cos(subAngle));
    const subControlY = point.y - subLength * 0.5 * Math.cos(subAngle) + (subLength * 0.25 * Math.sin(subAngle));
    
    // Create tapering sub-branch with more segments
    const subBranchSegments = 6; // Increased from 5 to 6
    const subBranchGroup = createSVG("g", { class: "sub-branch" });
    
    for (let j = 0; j < subBranchSegments; j++) {
      const st1 = j / subBranchSegments;
      const st2 = (j + 1) / subBranchSegments;
      
      const subStart = getCubicBezierPoint(st1,
        { x: point.x, y: point.y },
        { x: subControlX, y: subControlY },
        { x: subControlX, y: subControlY },
        { x: subEndX, y: subEndY }
      );
      
      const subEnd = getCubicBezierPoint(st2,
        { x: point.x, y: point.y },
        { x: subControlX, y: subControlY },
        { x: subControlX, y: subControlY },
        { x: subEndX, y: subEndY }
      );
      
      // Make sub-branches broader and use exponential tapering
      const subProgress = j / subBranchSegments;
      const subStartWidth = 14 - (branch.level * 0.8); // Increased from 10 to 14
      const subEndWidth = 2;
      
      // Exponential tapering for smoother transition
      const subSegmentWidth = subStartWidth * Math.pow(1 - subProgress, 1.4) + subEndWidth * subProgress;
      
      const subSegment = createSVG("path", {
        d: `M${subStart.x},${subStart.y} Q${subControlX},${subControlY} ${subEnd.x},${subEnd.y}`,
        stroke: `url(#branchGradient${branch.name})`,
        "stroke-width": subSegmentWidth,
        "stroke-linecap": j === 0 || j === subBranchSegments - 1 ? "round" : "butt",
        fill: "none"
      });
      
      subBranchGroup.appendChild(subSegment);
    }
    
    svg.appendChild(subBranchGroup);

    // Add leaves to sub-branches
    drawLeaves(branch, point.x, point.y, subEndX, subEndY, true);
  }

  // Add leaves to main branch
  drawLeaves(branch, baseX, baseY, endX, endY, false);
  
  // Always draw fruits based on branch level (1-5)
  drawFruits(branch, baseX, baseY, endX, endY);

  // Add branch label
  const labelX = endX + (branch.angle > 0 ? 20 : -20);
  const label = createSVG("text", {
    x: labelX,
    y: endY - 10,
    fill: branch.color,
    "font-size": 14,
    "font-weight": "bold",
    "text-anchor": branch.angle > 0 ? "start" : "end"
  });
  label.textContent = branch.name;
  svg.appendChild(label);

  // Add click and hover events
  mainBranchGroup.addEventListener("click", () => grow(branch));
  mainBranchGroup.addEventListener("mouseenter", (e) => showTooltip(e, branch));
  mainBranchGroup.addEventListener("mousemove", moveTooltip);
  mainBranchGroup.addEventListener("mouseleave", hideTooltip);
}

function drawLeaves(branch, startX, startY, endX, endY, isSubBranch) {
  // Increase leaf density significantly
  const numLeaves = isSubBranch ? 
    Math.min(8, branch.level * 3) : // Doubled from 4 to 8
    Math.min(12, branch.level * 4); // Doubled from 6 to 12

  // More varied leaf colors for visual richness
  const leafColors = [
    "#2ecc71", "#27ae60", "#229954", "#1D8348", 
    "#196F3D", "#145A32", "#1abc9c", "#16a085"
  ];

  // Create leaf cluster effect
  for (let i = 0; i < numLeaves; i++) {
    // Distribute leaves more evenly along the branch
    const t = 0.2 + (i / (numLeaves + 1)) * 0.7;
    const point = getCubicBezierPoint(t,
      { x: startX, y: startY },
      { x: startX, y: startY },
      { x: endX, y: endY },
      { x: endX, y: endY }
    );

    // Add some random offset to each leaf position for more natural clustering
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    
    const side = i % 2 === 0 ? 1 : -1;
    const leafSize = isSubBranch ? 
      7 + branch.level * 1.5 : 
      9 + branch.level * 1.5;
    
    const leafAngle = Math.atan2(endY - startY, endX - startX) + 
      (side * Math.PI / 4) +
      (Math.random() - 0.5) * 0.7; // More random rotation

    // Create natural leaf shape
    const leafPath = createSVG("path", {
      d: `
        M${point.x + offsetX},${point.y + offsetY}
        c${leafSize * Math.cos(leafAngle)},-${leafSize} 
         ${leafSize * 2 * Math.cos(leafAngle)},-${leafSize} 
         ${leafSize * 2 * Math.cos(leafAngle)},0
        c-${leafSize * Math.cos(leafAngle)},${leafSize} 
         -${leafSize * 2 * Math.cos(leafAngle)},${leafSize} 
         -${leafSize * 2 * Math.cos(leafAngle)},0
        Z
      `,
      fill: leafColors[Math.floor(Math.random() * leafColors.length)],
      stroke: "#196F3D",
      "stroke-width": 0.5,
      opacity: 0.9,
      "class": "leaf",
      style: `
        animation: leafSway ${2 + Math.random()}s ease-in-out infinite;
        transform-origin: ${point.x + offsetX}px ${point.y + offsetY}px;
      `
    });
    svg.appendChild(leafPath);

    // Add leaf vein for detail
    const vein = createSVG("path", {
      d: `
        M${point.x + offsetX},${point.y + offsetY}
        l${leafSize * Math.cos(leafAngle)},${-leafSize/2}
      `,
      stroke: "#196F3D",
      "stroke-width": 0.5,
      opacity: 0.5
    });
    svg.appendChild(vein);
    
    // Add additional small leaves for clusters on higher level branches
    if (branch.level >= 3 && Math.random() > 0.5) {
      const smallLeafSize = leafSize * 0.6;
      const smallLeafAngle = leafAngle + (Math.random() - 0.5) * 0.5;
      
      const smallLeaf = createSVG("path", {
        d: `
          M${point.x + offsetX + 5},${point.y + offsetY + 5}
          c${smallLeafSize * Math.cos(smallLeafAngle)},-${smallLeafSize} 
           ${smallLeafSize * 2 * Math.cos(smallLeafAngle)},-${smallLeafSize} 
           ${smallLeafSize * 2 * Math.cos(smallLeafAngle)},0
          c-${smallLeafSize * Math.cos(smallLeafAngle)},${smallLeafSize} 
           -${smallLeafSize * 2 * Math.cos(smallLeafAngle)},${smallLeafSize} 
           -${smallLeafSize * 2 * Math.cos(smallLeafAngle)},0
          Z
        `,
        fill: leafColors[Math.floor(Math.random() * leafColors.length)],
        stroke: "#196F3D",
        "stroke-width": 0.3,
        opacity: 0.9,
        "class": "leaf",
        style: `
          animation: leafSway ${2.5 + Math.random()}s ease-in-out infinite;
          transform-origin: ${point.x + offsetX + 5}px ${point.y + offsetY + 5}px;
        `
      });
      svg.appendChild(smallLeaf);
    }
  }
  
  // Add extra leaf clusters near the branch tips
  if (branch.level >= 2) {
    const tipClusterSize = isSubBranch ? 3 + branch.level : 4 + branch.level;
    // Create leaf cluster at the branch end
    for (let i = 0; i < tipClusterSize; i++) {
      const angle = (i / tipClusterSize) * Math.PI * 2;
      const distance = 8 + Math.random() * 5;
      
      const leafX = endX + Math.cos(angle) * distance;
      const leafY = endY + Math.sin(angle) * distance;
      
      const leafSize = 6 + branch.level + Math.random() * 3;
      const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
      
      const tipLeaf = createSVG("path", {
        d: `
          M${leafX},${leafY}
          c${leafSize * Math.cos(angle)},-${leafSize} 
           ${leafSize * 1.8 * Math.cos(angle)},-${leafSize} 
           ${leafSize * 1.8 * Math.cos(angle)},0
          c-${leafSize * Math.cos(angle)},${leafSize} 
           -${leafSize * 1.8 * Math.cos(angle)},${leafSize} 
           -${leafSize * 1.8 * Math.cos(angle)},0
          Z
        `,
        fill: leafColor,
        stroke: "#196F3D",
        "stroke-width": 0.4,
        opacity: 0.95,
        "class": "leaf",
        style: `
          animation: leafSway ${2 + Math.random()}s ease-in-out infinite;
          transform-origin: ${leafX}px ${leafY}px;
        `
      });
      svg.appendChild(tipLeaf);
    }
  }
}

// Updated drawFruits function to match exact branch levels
function drawFruits(branch, baseX, baseY, endX, endY) {
  // Draw exactly branch.level number of fruits (1-5)
  const numFruits = branch.level;
  if (numFruits <= 0) return;

  const rad = branch.angle * Math.PI / 180;
  const branchLength = 60 + branch.progress * 2.2;
  const curveAmount = 40 + (branch.progress / 2);

  const controlX1 = baseX + (branchLength * 0.3) * Math.sin(rad) + (curveAmount * 0.8 * Math.cos(rad));
  const controlY1 = baseY - (branchLength * 0.3) * Math.cos(rad) + (curveAmount * 0.8 * Math.sin(rad));
  const controlX2 = baseX + (branchLength * 0.7) * Math.sin(rad) - (curveAmount * 0.7 * Math.cos(rad));
  const controlY2 = baseY - (branchLength * 0.7) * Math.cos(rad) - (curveAmount * 0.7 * Math.sin(rad));

  // Create fruit gradient
  const fruitGradient = createSVG("radialGradient", {
    id: `fruitGradient${branch.name}`,
    cx: "40%",
    cy: "40%",
    r: "60%",
    fx: "40%",
    fy: "40%"
  });

  fruitGradient.innerHTML = `
    <stop offset="0%" stop-color="#ffd970"/>
    <stop offset="45%" stop-color="#f39c12"/>
    <stop offset="100%" stop-color="#e67e22"/>
  `;
  svg.appendChild(fruitGradient);

  // Calculate positions for fruits spread along branch
  for (let i = 0; i < numFruits; i++) {
    // Space fruits evenly along the latter half of the branch
    const t = 0.5 + (i / numFruits) * 0.4;
    
    const point = getCubicBezierPoint(t,
      { x: baseX, y: baseY },
      { x: controlX1, y: controlY1 },
      { x: controlX2, y: controlY2 },
      { x: endX, y: endY }
    );
    
    // Add slight random offset for natural look
    const offsetX = (Math.random() - 0.5) * 5;
    const offsetY = (Math.random() - 0.5) * 5;
    
    const fruitX = point.x + offsetX;
    const fruitY = point.y + offsetY;

    // Create fruit group
    const fruit = createSVG("g", {
      transform: `translate(${fruitX}, ${fruitY})`,
      class: "fruit-group",
      style: `animation: fruitSway ${2 + Math.random()}s ease-in-out infinite; cursor: pointer;`
    });

    // Add shadow
    const shadow = createSVG("ellipse", {
      cx: 2,
      cy: 2,
      rx: 6,
      ry: 4,
      fill: "rgba(0,0,0,0.2)",
      filter: "blur(2px)"
    });
    fruit.appendChild(shadow);

    // Add main fruit - size varies slightly by level
    const fruitSize = 5 + (branch.level * 0.4);
    const mainFruit = createSVG("circle", {
      cx: 0,
      cy: 0,
      r: fruitSize,
      fill: `url(#fruitGradient${branch.name})`,
      stroke: "#e67e22",
      "stroke-width": 1
    });

    // Add highlight/shine
    const shine = createSVG("circle", {
      cx: -2,
      cy: -2,
      r: fruitSize * 0.4,
      fill: "rgba(255,255,255,0.6)"
    });

    fruit.appendChild(mainFruit);
    fruit.appendChild(shine);
    
    // Add fruit stem
    const stem = createSVG("path", {
      d: "M0,-" + fruitSize + " Q2,-" + (fruitSize + 4) + " 0,-" + (fruitSize + 8),
      stroke: "#7D4E24",
      "stroke-width": 1.2,
      fill: "none"
    });
    fruit.appendChild(stem);
    
    svg.appendChild(fruit);
    
    // Add click interaction to fruits
    fruit.addEventListener("click", () => {
      // Create small animation when clicking fruit
      const clickAnimation = createSVG("circle", {
        cx: fruitX,
        cy: fruitY,
        r: fruitSize * 2,
        fill: "rgba(255,193,7,0.3)",
        style: "animation: fruitPulse 0.5s ease-out forwards;"
      });
      svg.appendChild(clickAnimation);
      
      setTimeout(() => {
        svg.removeChild(clickAnimation);
      }, 500);
      
      // Grow the branch when clicking a fruit
      grow(branch);
    });
  }
}

// Add a new fruit pulse animation to the CSS using a style element
const fruitAnimation = document.createElement('style');
fruitAnimation.textContent = `
  @keyframes fruitPulse {
    0% { transform: scale(0.5); opacity: 0.8; }
    100% { transform: scale(2); opacity: 0; }
  }
`;
document.head.appendChild(fruitAnimation);

function grow(branch) {
  if (branch.level < 5) {
    const previousLevel = branch.level;

    // Grow progress
    const increment = Math.max(5, 10 - branch.level);
    branch.progress = Math.min(100, branch.progress + increment);
    branch.level = Math.floor(branch.progress / 20);

    // If level has increased and reached 5 → add fruit and reset
    if (branch.level > previousLevel && branch.level === 5) {
      celebrateMilestone(branch); // optional
      branch.progress = 0;
      branch.level = 0;
    }

    // Re-render with new fruit
    renderTree();
    updateProgress(branch);
    saveState();
    createGrowthParticles(branch);
  }
}

 
 function createGrowthParticles(branch) {
   const rad = branch.angle * Math.PI / 180;
   const length = 60 + branch.progress * 2.2;
   const endX = centerX + length * Math.sin(rad);
   const endY = centerY - 150 - length * Math.cos(rad);
   
   // Create particle container
   const particleGroup = document.createElementNS(svgNS, "g");
   particleGroup.setAttribute("class", "particles");
   svg.appendChild(particleGroup);
   
   // Create particles
   for (let i = 0; i < 10; i++) {
     const particle = createSVG("circle", {
       cx: endX,
       cy: endY,
       r: Math.random() * 3 + 1,
       fill: branch.color,
       opacity: Math.random() * 0.5 + 0.5
     });
     
     particleGroup.appendChild(particle);
     
     // Animate particle
     const angle = Math.random() * Math.PI * 2;
     const distance = Math.random() * 30 + 10;
     const duration = Math.random() * 1000 + 500;
     
     const startTime = Date.now();
     
     function animateParticle() {
       const elapsed = Date.now() - startTime;
       const progress = elapsed / duration;
       
       if (progress < 1) {
         const x = endX + distance * Math.cos(angle) * progress;
         const y = endY + distance * Math.sin(angle) * progress;
         
         particle.setAttribute("cx", x);
         particle.setAttribute("cy", y);
         particle.setAttribute("opacity", (1 - progress) * 0.8);
         
         requestAnimationFrame(animateParticle);
       } else {
         particleGroup.removeChild(particle);
         if (particleGroup.childNodes.length === 0) {
           svg.removeChild(particleGroup);
         }
       }
     }
     
     requestAnimationFrame(animateParticle);
   }
 }
 
 function showTooltip(e, branch) {
   const skills = branch.skills.slice(0, Math.max(1, branch.level + 1)).join(", ");
   
   tooltip.innerHTML = `
     <h3 style="margin: 0 0 5px 0; color: ${branch.color}">${branch.name}</h3>
     <p style="margin: 0 0 8px 0">${branch.description}</p>
     <p style="margin: 0"><strong>Level:</strong> ${branch.level}/5</p>
     <p style="margin: 5px 0 0 0"><strong>Skills:</strong> ${skills}</p>
   `;
   
   moveTooltip(e);
   tooltip.style.opacity = 1;
 }
 
 function moveTooltip(e) {
   const rect = svg.getBoundingClientRect();
   const x = e.clientX - rect.left;
   const y = e.clientY - rect.top;
   
   // Position tooltip, making sure it stays within the SVG boundaries
   tooltip.style.left = `${Math.min(rect.width - tooltip.offsetWidth - 10, x + 15)}px`;
   tooltip.style.top = `${Math.min(rect.height - tooltip.offsetHeight - 10, y + 15)}px`;
 }
 
 function hideTooltip() {
   tooltip.style.opacity = 0;
 }
 
 function updateProgress(branch) {
   const card = document.querySelector(`.progress-card[data-branch="${branch.name.toLowerCase()}"]`);
   if (!card) return;

   const percentageElement = card.querySelector('.progress-percentage');
   const progressFill = card.querySelector('.progress-fill');
   const levelIndicator = card.querySelector('.level-indicator');

   if (percentageElement) {
     percentageElement.textContent = `${branch.progress}%`;
   }

   if (progressFill) {
     progressFill.style.transition = 'width 0.5s ease-in-out';
     progressFill.style.width = `${branch.progress}%`;
   }

   if (levelIndicator) {
     levelIndicator.textContent = `Level ${branch.level}/5`;
   }

   // If it's the music branch, ensure we're not exceeding 100%
   if (branch.name === 'Music') {
     if (branch.progress > 100) {
       branch.progress = 100;
       branch.level = 5;
       if (percentageElement) percentageElement.textContent = '100%';
       if (progressFill) progressFill.style.width = '100%';
       if (levelIndicator) levelIndicator.textContent = 'Level 5/5';
     }
   }
 }
 
 function renderTree() {
   svg.innerHTML = '';
   drawGround();
   drawTrunk();
   branches.forEach(drawBranch);
 }
 
 function initProgressCards() {
   const progressContainer = document.getElementById('progress');
   if (!progressContainer) return;
   
   progressContainer.innerHTML = '';
   
   branches.forEach(branch => {
     const card = document.createElement('div');
     card.className = 'progress-card';
     card.dataset.branch = branch.name.toLowerCase();
     card.innerHTML = `
       <div class="card-header">
         <h3 class="card-title">${branch.name}</h3>
         <span class="progress-percentage">${branch.progress}%</span>
       </div>
       <div class="progress-bar">
         <div class="progress-fill" style="width: ${branch.progress}%; background-color: ${branch.name === 'Music' ? '#1DB954' : '#3498db'}"></div>
       </div>
       <div class="level-indicator">Level ${branch.level}/5</div>
     `;
     progressContainer.appendChild(card);
   });
 }
 
 updateBookList();

document.getElementById('log-book-btn').addEventListener('click', logBook);

 // Theme toggle functionality
 document.getElementById('theme-toggle').addEventListener('click', () => {
   const isDarkMode = document.body.classList.toggle('dark-mode');
   document.getElementById('theme-toggle').textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
   localStorage.setItem('darkMode', isDarkMode);
   
   // Update Spotify UI for dark mode
   const musicLogContainer = document.getElementById('music-log-container');
   if (musicLogContainer) {
     if (isDarkMode) {
       musicLogContainer.style.backgroundColor = '#333';
       musicLogContainer.style.color = '#eee';
       
       // Update item styling
       const musicItems = document.querySelectorAll('#music-items-container > div');
       musicItems.forEach(item => {
         item.style.background = '#444';
       });
       
       // Update text colors
       const typeTexts = document.querySelectorAll('#music-items-container .music-item-type');
       typeTexts.forEach(text => {
         text.style.color = '#bbb';
       });
       
       const timeTexts = document.querySelectorAll('#music-items-container .music-item-time');
       timeTexts.forEach(text => {
         text.style.color = '#aaa';
       });
     } else {
       musicLogContainer.style.backgroundColor = 'white';
       musicLogContainer.style.color = 'inherit';
       
       // Reset item styling
       const musicItems = document.querySelectorAll('#music-items-container > div');
       musicItems.forEach(item => {
         item.style.background = '#f9f9f9';
       });
       
       // Reset text colors
       const typeTexts = document.querySelectorAll('#music-items-container .music-item-type');
       typeTexts.forEach(text => {
         text.style.color = '#666';
       });
       
       const timeTexts = document.querySelectorAll('#music-items-container .music-item-time');
       timeTexts.forEach(text => {
         text.style.color = '#999';
       });
     }
   }
 });
 
 // Reset button functionality
 document.getElementById('reset-btn').addEventListener('click', () => {
   if (confirm('Are you sure you want to reset all progress?')) {
     branches.forEach(branch => {
       branch.progress = 0;
       branch.level = 0;
     });
     
     // Reset Spotify data if it exists
     if (typeof spotifyExploredItems !== 'undefined') {
       spotifyConnected = false;
       spotifyExploredItems = {
         songs: [],
         artists: [],
         genres: []
       };
       
       // Reset UI elements
       const spotifyBtn = document.getElementById('spotify-connect-btn');
       const musicItemsContainer = document.getElementById('music-items-container');
       
       if (spotifyBtn) {
         spotifyBtn.innerHTML = '<i class="fab fa-spotify"></i> Connect to Spotify';
         spotifyBtn.style.backgroundColor = '#1DB954';
         spotifyBtn.disabled = false;
       }
       
       // Reset counters
       const songsCount = document.getElementById('songs-count');
       const artistsCount = document.getElementById('artists-count');
       const genresCount = document.getElementById('genres-count');
       
       if (songsCount) songsCount.textContent = '0';
       if (artistsCount) artistsCount.textContent = '0';
       if (genresCount) genresCount.textContent = '0';
       
       if (musicItemsContainer) {
         musicItemsContainer.innerHTML = '';
       }
     }
     
     renderTree();
     initProgressCards();
     saveState();
   }
 });
 
 // Initialize the application
 document.addEventListener('DOMContentLoaded', () => {
   loadState();
   initProgressCards();
   renderTree();
   
   // Initialize Spotify integration
   setTimeout(initSpotify, 500);
 });
 
 // Load state immediately in case DOMContentLoaded already fired
 loadState();
 initProgressCards();
 renderTree();

 

 function logBook() {
  const bookInput = document.getElementById('book-input');
  const timeInput = document.getElementById('reading-time');
  const branchName = document.getElementById('branch-select').value;
  const bookTitle = bookInput.value.trim();
  const minutes = parseInt(timeInput.value);

  const branch = branches.find(b => b.name === branchName);

  if (bookTitle && !isNaN(minutes) && minutes > 0 && branch) {
    // Load existing logs
    let allLogs = JSON.parse(localStorage.getItem('loggedBooks')) || [];

    // Add new log
    allLogs.push({ title: bookTitle, minutes, branch: branchName });
    localStorage.setItem('loggedBooks', JSON.stringify(allLogs));

    // Update progress
    const totalTime = allLogs
      .filter(b => b.branch === branchName)
      .reduce((sum, b) => sum + b.minutes, 0);

    const progress = Math.floor((totalTime / 60) * 10); // 10% per hour
    branch.progress = Math.min(100, progress);
    branch.level = Math.min(5, Math.floor(progress / 20));

    renderTree();
    updateProgress(branch);
    saveState();
    updateBookList();

    bookInput.value = '';
    timeInput.value = '';
  }
}
function updateBookList() {
  const bookList = document.getElementById('book-list');
  const container = document.getElementById('reading-log-tab');
  const logs = JSON.parse(localStorage.getItem('loggedBooks')) || [];

  if (logs.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  bookList.innerHTML = '';

  logs.forEach((book, index) => {
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    bookItem.innerHTML = `
      <span><strong>${book.branch}:</strong> ${book.title} (${book.minutes} min)</span>
      <button class="book-remove" data-index="${index}">×</button>
    `;
    bookList.appendChild(bookItem);
  });

  document.querySelectorAll('.book-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = parseInt(e.target.getAttribute('data-index'));
      removeBook(index);
    });
  });
}



function removeBook(index) {
  let allLogs = JSON.parse(localStorage.getItem('loggedBooks')) || [];

  if (index >= 0 && index < allLogs.length) {
    const removed = allLogs.splice(index, 1)[0];
    localStorage.setItem('loggedBooks', JSON.stringify(allLogs));

    // Update progress for affected branch
    const branch = branches.find(b => b.name === removed.branch);
    const totalTime = allLogs
      .filter(b => b.branch === removed.branch)
      .reduce((sum, b) => sum + b.minutes, 0);

    const progress = Math.floor((totalTime / 60) * 10);
    branch.progress = Math.min(100, progress);
    branch.level = Math.min(5, Math.floor(progress / 20));

    renderTree();
    updateProgress(branch);
    saveState();
    updateBookList();
  }
}


function celebrateMilestone(branch) {
const rad = branch.angle * Math.PI / 180;
const length = 60 + branch.progress * 2.2;
const endX = centerX + length * Math.sin(rad);
const endY = centerY - 150 - length * Math.cos(rad);

// Create celebration particles
for (let i = 0; i < 20; i++) {
 const particle = createSVG("circle", {
   cx: endX,
   cy: endY,
   r: Math.random() * 4 + 2,
   fill: branch.color,
   opacity: 1
 });
 
 svg.appendChild(particle);
 
 // Animate particle
 const angle = Math.random() * Math.PI * 2;
 const distance = Math.random() * 50 + 30;
 const duration = Math.random() * 1000 + 500;
 
 const startTime = Date.now();
 
 function animate() {
   const elapsed = Date.now() - startTime;
   const progress = elapsed / duration;
   
   if (progress < 1) {
     const x = endX + distance * Math.cos(angle) * progress;
     const y = endY + distance * Math.sin(angle) * progress;
     
     particle.setAttribute("cx", x);
     particle.setAttribute("cy", y);
     particle.setAttribute("opacity", 1 - progress);
     
     requestAnimationFrame(animate);
   } else {
     svg.removeChild(particle);
   }
 }
 
 requestAnimationFrame(animate);
}
}
function logBook() {
  const bookInput = document.getElementById('book-input');
  const timeInput = document.getElementById('reading-time');
  const branchName = document.getElementById('branch-select').value;
  const bookTitle = bookInput.value.trim();
  const minutes = parseInt(timeInput.value);

  if (!bookTitle || isNaN(minutes) || minutes <= 0) return;

  const branch = branches.find(b => b.name === branchName);
  if (!branch) return;

  // Save the new log
  let logs = JSON.parse(localStorage.getItem('loggedBooks')) || [];
  logs.push({ title: bookTitle, minutes, branch: branch.name });
  localStorage.setItem('loggedBooks', JSON.stringify(logs));

  // Update branch progress
  const totalMinutes = logs.filter(b => b.branch === branch.name)
                           .reduce((sum, b) => sum + b.minutes, 0);
  branch.progress = Math.min(100, Math.floor((totalMinutes / 60) * 10));
  branch.level = Math.min(5, Math.floor(branch.progress / 20));

  renderTree();
  updateProgress(branch);
  saveState();
  updateBookList();

  bookInput.value = '';
  timeInput.value = '';
}

function updateBookList() {
  const bookList = document.getElementById('book-list');
  const logs = JSON.parse(localStorage.getItem('loggedBooks')) || [];
  
  bookList.innerHTML = ''; // Clear existing items
  
  logs.forEach((book, index) => {
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    bookItem.innerHTML = `
      <div class="book-content">
        <span class="book-branch">${book.branch}</span>
        <span class="book-title">${book.title}</span>
        <span class="book-time">${book.minutes} minutes</span>
      </div>
      <button class="delete-btn" onclick="removeBook(${index})">×</button>
    `;
    bookList.appendChild(bookItem);
  });
}



function removeBook(index) {
  loggedBooks.splice(index, 1);
  localStorage.setItem('loggedBooks', JSON.stringify(loggedBooks));

  // Recalculate progress from total time
  const totalMinutes = loggedBooks.reduce((sum, b) => sum + b.minutes, 0);
  const progressFromTime = Math.floor((totalMinutes / 60) * 10);
  literatureBranch.progress = Math.min(100, progressFromTime);
  literatureBranch.level = Math.min(5, Math.floor(literatureBranch.progress / 20));

  renderTree();
  updateProgress(literatureBranch);
  saveState();
  updateBookList();
}

// Find and update the reading log toggle event listener
document.getElementById('reading-log-toggle').addEventListener('click', () => {
  const readingLogView = document.getElementById('reading-log-view');
  const skillTreeView = document.getElementById('skill-tree-view');
  const button = document.getElementById('reading-log-toggle');

  if (readingLogView.style.display === 'none' || !readingLogView.style.display) {
    // Show reading log
    readingLogView.style.display = 'block';
    skillTreeView.style.display = 'none';
    button.textContent = '🌳 Back to Skill Tree';
    
    // Update book list and refresh music data if needed
    updateBookList();
    
    // Refresh music item colors in case of dark mode
    const isDarkMode = document.body.classList.contains('dark-mode');
    const musicItems = document.querySelectorAll('#music-items-container > div');
    musicItems.forEach(item => {
      item.style.background = isDarkMode ? '#444' : '#f9f9f9';
    });
  } else {
    // Show skill tree
    readingLogView.style.display = 'none';
    skillTreeView.style.display = 'block';
    button.textContent = '📚 Show Activity Log';
    renderTree();
  }
});



document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initProgressCards();
  renderTree();
  updateBookList();
});











