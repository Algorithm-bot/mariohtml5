/**
	Displays the title screen and menu.
	Code by Rob Kleffner, 2011
*/

Mario.TitleState = function() {
    this.drawManager = null;
    this.camera = null;
    this.logoY = null;
    this.bounce = null;
    this.font = null;
};

Mario.TitleState.prototype = new Enjine.GameState();

Mario.TitleState.prototype.Enter = function() {
    this.drawManager = new Enjine.DrawableManager();
    this.camera = new Enjine.Camera();

    var bgGenerator = new Mario.BackgroundGenerator(2048, 15, true, Mario.LevelType.Overground);
    var bgLayer0 = new Mario.BackgroundRenderer(bgGenerator.CreateLevel(), 320, 240, 2);
    bgGenerator.SetValues(2048, 15, false, Mario.LevelType.Overground);
    var bgLayer1 = new Mario.BackgroundRenderer(bgGenerator.CreateLevel(), 320, 240, 1);

    this.title = new Enjine.Sprite();
    this.title.Image = Enjine.Resources.Images["title"];
    this.title.X = 0, this.title.Y = 120;

    this.logo = new Enjine.Sprite();
    this.logo.Image = Enjine.Resources.Images["logo"];
    this.logo.X = 0, this.logo.Y = 0;

    this.font = Mario.SpriteCuts.CreateRedFont();
    
    // Display welcome message in the left panel instead of canvas
    this.displayWelcomeMessage();

    this.logoY = 20;

    this.drawManager.Add(bgLayer0);
    this.drawManager.Add(bgLayer1);

    this.bounce = 0;

	Mario.GlobalMapState = new Mario.MapState();
	//set up the global main character variable
	Mario.MarioCharacter = new Mario.Character();
	Mario.MarioCharacter.Image = Enjine.Resources.Images["smallMario"];

	Mario.PlayTitleMusic();
};

Mario.TitleState.prototype.Exit = function() {
    Mario.StopMusic();
    
    // Clean up welcome message elements
    this.cleanupWelcomeMessage();
	
    this.drawManager.Clear();
    delete this.drawManager;
    delete this.camera;
    delete this.font;
};

Mario.TitleState.prototype.Update = function(delta) {
    this.bounce += delta * 2;
    this.logoY = 20 + Math.sin(this.bounce) * 10;

    this.camera.X += delta * 25;

    this.drawManager.Update(delta);
};

Mario.TitleState.prototype.Draw = function(context) {
    this.drawManager.Draw(context, this.camera);

    context.drawImage(Enjine.Resources.Images["title"], 0, 120);
    context.drawImage(Enjine.Resources.Images["logo"], 0, this.logoY);

    this.font.Draw(context, this.Camera);
};

Mario.TitleState.prototype.CheckForChange = function(context) {
    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.S)) {
        context.ChangeState(Mario.GlobalMapState);
    }
    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.L)) {
        context.ChangeState(new Mario.LeaderboardState());
    }
};

Mario.TitleState.prototype.displayWelcomeMessage = function() {
    // Get player name
    var playerName = null;
    if (window.Mario && window.Mario.PlayerName) {
        playerName = window.Mario.PlayerName;
    } else {
        // Fallback: check localStorage
        try {
            playerName = localStorage.getItem('marioPlayerName');
            if (playerName) {
                window.Mario.PlayerName = playerName;
            }
        } catch (error) {
            console.log('localStorage not available');
        }
    }
    
    // Create welcome message container
    const welcomeContainer = document.createElement('div');
    welcomeContainer.id = 'welcome-message-container';
    welcomeContainer.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        right: 20px;
        background: linear-gradient(145deg, rgba(44, 62, 80, 0.9), rgba(52, 73, 94, 0.9));
        border: 2px solid #3498db;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
    `;
    
    // Create welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.style.cssText = `
        color: #ecf0f1;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    `;
    
    if (playerName) {
        welcomeMessage.innerHTML = `🎮 Welcome <span style="color: #2ecc71;">${playerName}</span>!`;
    } else {
        welcomeMessage.innerHTML = '🎮 Welcome to Mario!';
    }
    
    // Create instructions container
    const instructionsContainer = document.createElement('div');
    instructionsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
    `;
    
    // Create start instruction
    const startInstruction = document.createElement('div');
    startInstruction.style.cssText = `
        background: linear-gradient(145deg, #27ae60, #2ecc71);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
    `;
    startInstruction.innerHTML = '🚀 Press <strong>S</strong> to Start Game';
    
    // Add hover effect for start instruction
    startInstruction.addEventListener('mouseenter', function() {
        this.style.background = 'linear-gradient(145deg, #2ecc71, #27ae60)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 12px rgba(39, 174, 96, 0.4)';
    });
    
    startInstruction.addEventListener('mouseleave', function() {
        this.style.background = 'linear-gradient(145deg, #27ae60, #2ecc71)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 8px rgba(39, 174, 96, 0.3)';
    });
    
    // Create leaderboard instruction
    const leaderboardInstruction = document.createElement('div');
    leaderboardInstruction.style.cssText = `
        background: linear-gradient(145deg, #f39c12, #e67e22);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
    `;
    leaderboardInstruction.innerHTML = '🏆 Press <strong>L</strong> for Leaderboard';
    
    // Add hover effect for leaderboard instruction
    leaderboardInstruction.addEventListener('mouseenter', function() {
        this.style.background = 'linear-gradient(145deg, #e67e22, #f39c12)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 12px rgba(243, 156, 18, 0.4)';
    });
    
    leaderboardInstruction.addEventListener('mouseleave', function() {
        this.style.background = 'linear-gradient(145deg, #f39c12, #e67e22)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 8px rgba(243, 156, 18, 0.3)';
    });
    
    // Assemble the welcome message
    instructionsContainer.appendChild(startInstruction);
    instructionsContainer.appendChild(leaderboardInstruction);
    welcomeContainer.appendChild(welcomeMessage);
    welcomeContainer.appendChild(instructionsContainer);
    
    // Add to the code panel
    const codePanel = document.querySelector('.code-panel');
    if (codePanel) {
        codePanel.appendChild(welcomeContainer);
    }
};

Mario.TitleState.prototype.cleanupWelcomeMessage = function() {
    const welcomeContainer = document.getElementById('welcome-message-container');
    if (welcomeContainer && welcomeContainer.parentNode) {
        welcomeContainer.parentNode.removeChild(welcomeContainer);
    }
};
