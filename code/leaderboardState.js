/**
 * State for displaying the leaderboard with player names and completion times.
 */

Mario.LeaderboardState = function() {
    this.drawManager = null;
    this.camera = null;
    this.font = null;
    this.leaderboardData = [];
    this.isLoading = true;
    this.errorMessage = null;
    this.backButton = null;
    this.refreshButton = null;
    this.modal = null;
    this.isModalVisible = false;
};

Mario.LeaderboardState.prototype = new Enjine.GameState();

Mario.LeaderboardState.prototype.Enter = function() {
    this.drawManager = new Enjine.DrawableManager();
    this.camera = new Enjine.Camera();

    // Create background
    var bgGenerator = new Mario.BackgroundGenerator(2048, 15, true, Mario.LevelType.Overground);
    var bgLayer0 = new Mario.BackgroundRenderer(bgGenerator.CreateLevel(), 320, 240, 2);
    bgGenerator.SetValues(2048, 15, false, Mario.LevelType.Overground);
    var bgLayer1 = new Mario.BackgroundRenderer(bgGenerator.CreateLevel(), 320, 240, 1);

    this.drawManager.Add(bgLayer0);
    this.drawManager.Add(bgLayer1);

    this.font = Mario.SpriteCuts.CreateRedFont();
    this.font.Strings[0] = { String: "Leaderboard", X: 100, Y: 20 };

    // Create and show the leaderboard modal
    this.createLeaderboardModal();
    this.showModal();
    
    // Load leaderboard data
    this.loadLeaderboardData();
};

Mario.LeaderboardState.prototype.Exit = function() {
    this.hideModal();
    this.drawManager.Clear();
    delete this.drawManager;
    delete this.camera;
    delete this.font;
};

Mario.LeaderboardState.prototype.Update = function(delta) {
    this.camera.X += delta * 25;
    this.drawManager.Update(delta);
};

Mario.LeaderboardState.prototype.Draw = function(context) {
    this.drawManager.Draw(context, this.camera);
    this.font.Draw(context, this.camera);
};

Mario.LeaderboardState.prototype.CheckForChange = function(context) {
    // State change is handled by the modal buttons
    this.stateContext = context;
};

Mario.LeaderboardState.prototype.createLeaderboardModal = function() {
    // Create modal overlay
    this.modal = document.createElement('div');
    this.modal.id = 'leaderboard-modal';
    this.modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(145deg, #2c3e50, #34495e);
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        border: 3px solid #3498db;
        text-align: center;
        min-width: 600px;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
    `;

    // Create title
    const title = document.createElement('h2');
    title.textContent = '🏆 Leaderboard';
    title.style.cssText = `
        color: #ecf0f1;
        margin-bottom: 20px;
        font-size: 28px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    `;

    // Create subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Fastest Level Completion Times';
    subtitle.style.cssText = `
        color: #bdc3c7;
        margin-bottom: 25px;
        font-size: 16px;
    `;

    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.textContent = 'Loading leaderboard...';
    loadingDiv.style.cssText = `
        color: #f39c12;
        font-size: 16px;
        margin: 20px 0;
    `;

    // Create leaderboard table container
    const tableContainer = document.createElement('div');
    tableContainer.id = 'leaderboard-table';
    tableContainer.style.cssText = `
        margin: 20px 0;
        overflow-x: auto;
    `;

    // Create table
    const table = document.createElement('table');
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        overflow: hidden;
    `;

    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background: linear-gradient(145deg, #3498db, #2980b9);">
            <th style="padding: 15px; color: white; text-align: left; border-bottom: 2px solid #2980b9;">Rank</th>
            <th style="padding: 15px; color: white; text-align: left; border-bottom: 2px solid #2980b9;">Player Name</th>
            <th style="padding: 15px; color: white; text-align: left; border-bottom: 2px solid #2980b9;">Time (seconds)</th>
            <th style="padding: 15px; color: white; text-align: left; border-bottom: 2px solid #2980b9;">Level Type</th>
        </tr>
    `;

    // Create table body
    const tbody = document.createElement('tbody');
    tbody.id = 'leaderboard-tbody';

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 25px;
    `;

    // Create refresh button
    this.refreshButton = document.createElement('button');
    this.refreshButton.textContent = '🔄 Refresh';
    this.refreshButton.style.cssText = `
        background: linear-gradient(145deg, #f39c12, #e67e22);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
    `;

    // Create back button
    this.backButton = document.createElement('button');
    this.backButton.textContent = '← Back to Game';
    this.backButton.style.cssText = `
        background: linear-gradient(145deg, #27ae60, #2ecc71);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
    `;

    // Add hover effects
    this.refreshButton.addEventListener('mouseenter', function() {
        this.style.background = 'linear-gradient(145deg, #e67e22, #f39c12)';
        this.style.transform = 'translateY(-2px)';
    });

    this.refreshButton.addEventListener('mouseleave', function() {
        this.style.background = 'linear-gradient(145deg, #f39c12, #e67e22)';
        this.style.transform = 'translateY(0)';
    });

    this.backButton.addEventListener('mouseenter', function() {
        this.style.background = 'linear-gradient(145deg, #2ecc71, #27ae60)';
        this.style.transform = 'translateY(-2px)';
    });

    this.backButton.addEventListener('mouseleave', function() {
        this.style.background = 'linear-gradient(145deg, #27ae60, #2ecc71)';
        this.style.transform = 'translateY(0)';
    });

    // Add click handlers
    this.refreshButton.addEventListener('click', () => {
        this.loadLeaderboardData();
    });

    this.backButton.addEventListener('click', () => {
        this.transitionToTitleState();
    });

    // Assemble modal
    buttonContainer.appendChild(this.refreshButton);
    buttonContainer.appendChild(this.backButton);
    
    modalContent.appendChild(title);
    modalContent.appendChild(subtitle);
    modalContent.appendChild(loadingDiv);
    modalContent.appendChild(tableContainer);
    modalContent.appendChild(buttonContainer);
    this.modal.appendChild(modalContent);

    // Add to document
    document.body.appendChild(this.modal);
};

Mario.LeaderboardState.prototype.showModal = function() {
    this.modal.style.display = 'flex';
    this.isModalVisible = true;
};

Mario.LeaderboardState.prototype.hideModal = function() {
    if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
    }
    this.isModalVisible = false;
};

Mario.LeaderboardState.prototype.loadLeaderboardData = function() {
    this.isLoading = true;
    this.errorMessage = null;
    
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.textContent = 'Loading leaderboard...';
        loadingDiv.style.display = 'block';
    }

    this.fetchLeaderboardData().then((data) => {
        this.leaderboardData = data;
        this.displayLeaderboard();
        this.isLoading = false;
    }).catch((error) => {
        console.error('Error loading leaderboard:', error);
        this.errorMessage = error.message;
        this.displayError();
        this.isLoading = false;
    });
};

Mario.LeaderboardState.prototype.fetchLeaderboardData = async function() {
    try {
        const isServerMode = window.location.protocol === 'http:' || window.location.protocol === 'https:';
        
        if (!isServerMode) {
            // Load from localStorage
            return this.loadLeaderboardFromLocal();
        }

        const response = await fetch('/api/leaderboard?limit=50&sortBy=completionTime&order=asc');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.leaderboard || [];
        
    } catch (error) {
        console.error('Error fetching leaderboard from server:', error);
        // Fallback to localStorage
        return this.loadLeaderboardFromLocal();
    }
};

Mario.LeaderboardState.prototype.loadLeaderboardFromLocal = function() {
    try {
        const localData = localStorage.getItem('marioLeaderboard');
        if (localData) {
            const leaderboard = JSON.parse(localData);
            // Sort by completion time (ascending - fastest first)
            return leaderboard.sort((a, b) => a.completionTime - b.completionTime);
        }
        return [];
    } catch (error) {
        console.error('Error loading leaderboard from localStorage:', error);
        return [];
    }
};

Mario.LeaderboardState.prototype.displayLeaderboard = function() {
    const loadingDiv = document.getElementById('loading-indicator');
    const tbody = document.getElementById('leaderboard-tbody');
    
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (this.leaderboardData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" style="padding: 20px; text-align: center; color: #bdc3c7; font-style: italic;">
                No leaderboard entries yet. Complete a level to see your time here!
            </td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    // Add leaderboard entries
    this.leaderboardData.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.style.cssText = `
            border-bottom: 1px solid #34495e;
            transition: background-color 0.3s ease;
        `;
        
        // Add hover effect
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
        
        // Determine rank color
        let rankColor = '#bdc3c7';
        let rankText = (index + 1).toString();
        
        if (index === 0) {
            rankColor = '#f1c40f'; // Gold
            rankText = '🥇';
        } else if (index === 1) {
            rankColor = '#95a5a6'; // Silver
            rankText = '🥈';
        } else if (index === 2) {
            rankColor = '#e67e22'; // Bronze
            rankText = '🥉';
        }
        
        row.innerHTML = `
            <td style="padding: 12px; color: ${rankColor}; font-weight: bold; text-align: center;">${rankText}</td>
            <td style="padding: 12px; color: #ecf0f1;">${entry.playerName}</td>
            <td style="padding: 12px; color: #2ecc71; font-weight: bold;">${entry.completionTime.toFixed(2)}s</td>
            <td style="padding: 12px; color: #bdc3c7;">${entry.levelType || 'Overground'}</td>
        `;
        
        tbody.appendChild(row);
    });
};

Mario.LeaderboardState.prototype.displayError = function() {
    const loadingDiv = document.getElementById('loading-indicator');
    const tbody = document.getElementById('leaderboard-tbody');
    
    if (loadingDiv) {
        loadingDiv.textContent = 'Error loading leaderboard. Showing local data if available.';
        loadingDiv.style.color = '#e74c3c';
    }
    
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="padding: 20px; text-align: center; color: #e74c3c;">
                    Error: ${this.errorMessage}
                </td>
            </tr>
        `;
    }
};

Mario.LeaderboardState.prototype.transitionToTitleState = function() {
    try {
        this.hideModal();
        
        // Clean up any existing welcome message before transitioning
        const existingWelcome = document.getElementById('welcome-message-container');
        if (existingWelcome && existingWelcome.parentNode) {
            existingWelcome.parentNode.removeChild(existingWelcome);
        }
        
        setTimeout(() => {
            if (this.stateContext) {
                console.log('Transitioning to TitleState from LeaderboardState...');
                this.stateContext.ChangeState(new Mario.TitleState());
            } else if (window.Mario && window.Mario.GlobalApplication && window.Mario.GlobalApplication.stateContext) {
                console.log('Transitioning to TitleState using global application...');
                window.Mario.GlobalApplication.stateContext.ChangeState(new Mario.TitleState());
            } else {
                console.error('No state context available for transition');
                alert('Error transitioning to game. Reloading page...');
                window.location.reload();
            }
        }, 100);
    } catch (error) {
        console.error('Error transitioning to TitleState:', error);
        alert('Error transitioning to game. Reloading page...');
        window.location.reload();
    }
};
