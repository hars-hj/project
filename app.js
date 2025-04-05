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
   // More realistic trunk with curve and gradient
   const trunkGradient = createSVG("linearGradient", {
     id: "trunkGradient",
     x1: "0%", y1: "0%", x2: "100%", y2: "0%"
   });
   
   const stop1 = createSVG("stop", {
     offset: "0%",
     "stop-color": "#4a2d1b"
   });
   
   const stop2 = createSVG("stop", {
     offset: "50%",
     "stop-color": "var(--trunk-color)"
   });
   
   const stop3 = createSVG("stop", {
     offset: "100%",
     "stop-color": "#4a2d1b"
   });
   
   trunkGradient.appendChild(stop1);
   trunkGradient.appendChild(stop2);
   trunkGradient.appendChild(stop3);
   
   svg.appendChild(trunkGradient);
   
   // Better trunk shape
   const trunk = createSVG("path", {
     d: "M420,500 C420,380 430,350 450,300 C470,350 480,380 480,500 Z",
     fill: "url(#trunkGradient)"
   });
   
   svg.appendChild(trunk);
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
   const length = 60 + branch.progress * 2.2;
   const curveAmount = 20 + (branch.progress / 5);
   
   // Calculate end points
   const endX = centerX + length * Math.sin(rad);
   const endY = centerY - 150 - length * Math.cos(rad);
   
   // Control points for curved branch
   const controlX1 = centerX + (length * 0.3) * Math.sin(rad) + (curveAmount * Math.cos(rad));
   const controlY1 = (centerY - 150) - (length * 0.3) * Math.cos(rad) + (curveAmount * Math.sin(rad));
   
   const controlX2 = centerX + (length * 0.7) * Math.sin(rad) - (curveAmount * Math.cos(rad));
   const controlY2 = (centerY - 150) - (length * 0.7) * Math.cos(rad) - (curveAmount * Math.sin(rad));
   
   // Branch gradient
   const branchGradient = createSVG("linearGradient", {
     id: `branchGradient${branch.name}`,
     x1: "0%", y1: "0%", x2: "100%", y2: "100%"
   });
   
   const branchStop1 = createSVG("stop", {
     offset: "0%",
     "stop-color": "var(--trunk-color)"
   });
   
   const branchStop2 = createSVG("stop", {
     offset: "100%",
     "stop-color": branch.color
   });
   
   branchGradient.appendChild(branchStop1);
   branchGradient.appendChild(branchStop2);
   svg.appendChild(branchGradient);
   
   // Draw the branch with curve
   const path = createSVG("path", {
     d: `M${centerX},${centerY - 150} C${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`,
     stroke: `url(#branchGradient${branch.name})`, 
     "stroke-width": 8 + (branch.level / 2), 
     "stroke-linecap": "round",
     "fill": "none",
     "filter": branch.level >= 3 ? "drop-shadow(0 0 3px rgba(255,255,255,0.3))" : "none",
     "class": "branch",
     "data-name": branch.name,
     "style": "cursor: pointer;"
   });
   
   svg.appendChild(path);
   
   // Add more leaves for higher levels
   if (branch.level > 0) {
     drawLeaves(branch, endX, endY, rad);
   }
   
   // Main leaf at the end
   const leafSize = 10 + (branch.level * 2);
   const leaf = createSVG("ellipse", {
     cx: endX, cy: endY, 
     rx: leafSize, ry: leafSize * 1.8, 
     fill: "var(--leaf-color)", 
     stroke: "white", 
     "stroke-width": 1.5,
     transform: `rotate(${branch.angle + 90} ${endX} ${endY})`,
     style: "cursor: pointer; transform-origin: center;",
     "class": "leaf",
     "data-name": branch.name
   });
   
   // Add animation to the leaf
   leaf.style.animation = `leafSway ${3 + Math.random() * 2}s ease-in-out infinite`;
   svg.appendChild(leaf);
   
   // Create a glow effect for level 5 branches
   if (branch.level >= 4) {
     const glow = createSVG("ellipse", {
       cx: endX, cy: endY, 
       rx: leafSize + 5, ry: (leafSize * 1.8) + 5, 
       fill: "none", 
       stroke: branch.color, 
       "stroke-width": 2,
       opacity: 0.5,
       transform: `rotate(${branch.angle + 90} ${endX} ${endY})`,
       style: "filter: blur(3px);"
     });
     svg.appendChild(glow);
   }
   
   // Label with level indicator
   const label = createSVG("text", {
     x: endX, y: endY - 25 - (branch.level * 2), 
     fill: branch.color,
     "font-size": 14, 
     "font-weight": "bold",
     "text-anchor": "middle",
     "pointer-events": "none"
   });
   label.textContent = branch.name;
   svg.appendChild(label);
   
   if (branch.level > 0) {
     const levelLabel = createSVG("text", {
       x: endX, y: endY - 10 - (branch.level * 2), 
       fill: branch.color,
       "font-size": 12, 
       "text-anchor": "middle",
       "pointer-events": "none"
     });
     levelLabel.textContent = `Level ${branch.level}`;
     svg.appendChild(levelLabel);
   }
   
   // Add event listeners
   path.addEventListener("click", () => grow(branch));
   leaf.addEventListener("click", () => grow(branch));
   
   // Tooltip events
   [path, leaf].forEach(el => {
     el.addEventListener("mouseenter", (e) => showTooltip(e, branch));
     el.addEventListener("mousemove", (e) => moveTooltip(e));
     el.addEventListener("mouseleave", hideTooltip);
   });
 }
 
 function drawLeaves(branch, endX, endY, rad) {
   // Add smaller leaves along the branch
   const numLeaves = Math.min(branch.level * 2, 8); // Max 8 leaves
   
   for (let i = 0; i < numLeaves; i++) {
     // Calculate position along the branch
     const t = 0.4 + (i / numLeaves) * 0.5; // Position from 40% to 90% along the branch
     const leafX = centerX + (endX - centerX) * t;
     const leafY = (centerY - 150) + (endY - (centerY - 150)) * t;
     
     // Add some randomness to position
     const offsetX = Math.sin(i * 2) * 10;
     const offsetY = Math.cos(i * 2) * 10;
     
     // Alternate sides of the branch
     const side = i % 2 === 0 ? 1 : -1;
     
     const leafSize = 6 + (branch.level * 0.5);
     const smallLeaf = createSVG("ellipse", {
       cx: leafX + (offsetX * side), 
       cy: leafY + offsetY, 
       rx: leafSize, 
       ry: leafSize * 1.5, 
       fill: "var(--leaf-color)", 
       stroke: "white", 
       "stroke-width": 1,
       opacity: 0.8,
       transform: `rotate(${branch.angle + 90 + (side * 30)} ${leafX + (offsetX * side)} ${leafY + offsetY})`,
       style: `animation: leafSway ${2 + Math.random() * 2}s ease-in-out infinite; animation-delay: ${Math.random() * 2}s;`
     });
     
     svg.appendChild(smallLeaf);
   }
 }
 
 function grow(branch) {
   if (branch.progress < 100) {
     // Add points based on current level
     const increment = Math.max(5, 10 - branch.level);
     branch.progress = Math.min(100, branch.progress + increment);
     
     // Update level based on progress
     branch.level = Math.min(5, Math.floor(branch.progress / 20));
     
     // Re-render tree and update progress display
     renderTree();
     updateProgress(branch);
     saveState();
     
     // Add particle effect on growth
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
   const fillElement = document.getElementById(`fill-${branch.name}`);
   const percentElement = document.getElementById(`percent-${branch.name}`);
   const levelElement = document.getElementById(`level-${branch.name}`);
   
   if (fillElement) fillElement.style.width = branch.progress + '%';
   if (percentElement) percentElement.textContent = `${branch.progress}%`;
   if (levelElement) levelElement.textContent = `Level ${branch.level}/5`;
 }
 
 function renderTree() {
   svg.innerHTML = '';
   drawGround();
   drawTrunk();
   branches.forEach(drawBranch);
 }
 
 function initProgressCards() {
   const container = document.getElementById('progress');
   container.innerHTML = '';
   
   branches.forEach(branch => {
     const card = document.createElement('div');
     card.className = 'progress-card';
     card.innerHTML = `
       <div class="card-header">
         <h3 class="card-title">${branch.name}</h3>
         <span id="percent-${branch.name}" class="progress-percentage">${branch.progress}%</span>
       </div>
       <div class="progress-bar">
         <div id="fill-${branch.name}" class="progress-fill" style="background:${branch.color};width:${branch.progress}%"></div>
       </div>
       <div id="level-${branch.name}" class="level-indicator">Level ${branch.level}/5</div>
     `;
     
     card.onclick = () => grow(branch);
     container.appendChild(card);
   });
 }
 
 updateBookList();

document.getElementById('log-book-btn').addEventListener('click', logBook);

 // Theme toggle functionality
 document.getElementById('theme-toggle').addEventListener('click', () => {
   const isDarkMode = document.body.classList.toggle('dark-mode');
   document.getElementById('theme-toggle').textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
   localStorage.setItem('darkMode', isDarkMode);
 });
 
 // Reset button functionality
 document.getElementById('reset-btn').addEventListener('click', () => {
   if (confirm('Are you sure you want to reset all progress?')) {
     branches.forEach(branch => {
       branch.progress = 0;
       branch.level = 0;
     });
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
 });
 
 // Load state immediately in case DOMContentLoaded already fired
 loadState();
 initProgressCards();
 renderTree();

 

// Add this function to your existing code
function logBook() {
  const bookInput = document.getElementById('book-input');
  const timeInput = document.getElementById('reading-time');
  const bookTitle = bookInput.value.trim();
  const minutes = parseInt(timeInput.value);

  if (bookTitle && !isNaN(minutes) && minutes > 0 && literatureBranch) {
    // Save book to log with time
    loggedBooks.push({ title: bookTitle, minutes });
    localStorage.setItem('loggedBooks', JSON.stringify(loggedBooks));

    // ✅ Time-based growth only
    const progressFromTime = Math.floor((minutes / 60) * 10); // 10% per hour
    literatureBranch.progress = Math.min(100, literatureBranch.progress + progressFromTime);
    literatureBranch.level = Math.min(5, Math.floor(literatureBranch.progress / 20));

    renderTree();
    updateProgress(literatureBranch);
    saveState();
    updateBookList();

    bookInput.value = '';
    timeInput.value = '';
  }
}



if (bookTitle && literatureBranch) {
 // Add book to list
 loggedBooks.push(bookTitle);
 localStorage.setItem('loggedBooks', JSON.stringify(loggedBooks));
 
 // Grow literature branch based on number of books
 const pointsPerBook = 5; // Each book adds 5 points
 literatureBranch.progress = Math.min(100, loggedBooks.length * pointsPerBook);
 literatureBranch.level = Math.min(5, Math.floor(literatureBranch.progress / 20));
 
 // Update UI
 renderTree();
 updateProgress(literatureBranch);
 saveState();
 updateBookList();
 
 // Clear input
 bookInput.value = '';
 
 // Show celebration for reaching milestones
 if (literatureBranch.level > 0 && literatureBranch.progress % 20 === 0) {
   celebrateMilestone(literatureBranch);
 }
}


function updateBookList() {
const bookList = document.getElementById('book-list');
const booksContainer = document.getElementById('logged-books');

if (loggedBooks.length > 0) {
 booksContainer.style.display = 'block';
 bookList.innerHTML = '';
 
 loggedBooks.forEach((book, index) => {
   const bookItem = document.createElement('div');
   bookItem.className = 'book-item';
   bookItem.innerHTML = `
     <span>${book}</span>
     <button class="book-remove" data-index="${index}">×</button>
   `;
   bookList.appendChild(bookItem);
 });
 
 // Add event listeners to remove buttons
 document.querySelectorAll('.book-remove').forEach(btn => {
   btn.addEventListener('click', (e) => {
     const index = parseInt(e.target.getAttribute('data-index'));
     removeBook(index);
   });
 });
} else {
 booksContainer.style.display = 'none';
}
}

function removeBook(index) {
loggedBooks.splice(index, 1);
localStorage.setItem('loggedBooks', JSON.stringify(loggedBooks));

// Update literature progress
const pointsPerBook = 5;
literatureBranch.progress = Math.min(100, loggedBooks.length * pointsPerBook);
literatureBranch.level = Math.min(5, Math.floor(literatureBranch.progress / 20));

// Update UI
renderTree();
updateProgress(literatureBranch);
saveState();
updateBookList();
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
  const bookTitle = bookInput.value.trim();
  const minutes = parseInt(timeInput.value);

  if (bookTitle && !isNaN(minutes) && minutes > 0 && literatureBranch) {
    // Save book to log with time
    loggedBooks.push({ title: bookTitle, minutes });
    localStorage.setItem('loggedBooks', JSON.stringify(loggedBooks));

    // ✅ Time-based growth only
    const progressFromTime = Math.floor((minutes / 60) * 10); // 10% per hour
    literatureBranch.progress = Math.min(100, literatureBranch.progress + progressFromTime);
    literatureBranch.level = Math.min(5, Math.floor(literatureBranch.progress / 20));

    renderTree();
    updateProgress(literatureBranch);
    saveState();
    updateBookList();

    bookInput.value = '';
    timeInput.value = '';
  }
}


function updateBookList() {
  const bookList = document.getElementById('book-list');
  const booksContainer = document.getElementById('logged-books');

  if (loggedBooks.length > 0) {
    booksContainer.style.display = 'block';
    bookList.innerHTML = '';

    loggedBooks.forEach((book, index) => {
      const bookItem = document.createElement('div');
      bookItem.className = 'book-item';
      bookItem.innerHTML = `
        <span>${book.title} (${book.minutes} min)</span>
        <button class="book-remove" data-index="${index}">&times;</button>
      `;
      bookList.appendChild(bookItem);
    });

    document.querySelectorAll('.book-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        removeBook(index);
      });
    });
  } else {
    booksContainer.style.display = 'none';
  }
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
