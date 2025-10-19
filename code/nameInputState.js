/**
 * State for collecting player name before starting the game.
 * Shows a popup modal for name input and stores it in MongoDB.
 */

Mario.NameInputState = function() {
    this.drawManager = null;
    this.camera = null;
    this.font = null;
    this.nameInput = null;
    this.submitButton = null;
    this.modal = null;
    this.isModalVisible = false;
    this.playerName = null;
};

Mario.NameInputState.prototype = new Enjine.GameState();

Mario.NameInputState.prototype.Enter = function() {
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
    this.font.Strings[0] = { String: "Enter Your Name", X: 80, Y: 100 };

    // Check if there's a previously stored name
    this.checkForStoredName();

    // Create and show the name input modal
    this.createNameInputModal();
    this.showModal();
};

Mario.NameInputState.prototype.Exit = function() {
    this.hideModal();
    this.drawManager.Clear();
    delete this.drawManager;
    delete this.camera;
    delete this.font;
};

Mario.NameInputState.prototype.Update = function(delta) {
    this.camera.X += delta * 25;
    this.drawManager.Update(delta);
};

Mario.NameInputState.prototype.Draw = function(context) {
    this.drawManager.Draw(context, this.camera);
    this.font.Draw(context, this.camera);
};

Mario.NameInputState.prototype.CheckForChange = function(context) {
    // State change is handled by the modal submit button
    // Store the context for use in transitionToTitleState
    this.stateContext = context;
};

Mario.NameInputState.prototype.createNameInputModal = function() {
    // Create modal overlay
    this.modal = document.createElement('div');
    this.modal.id = 'name-input-modal';
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
        min-width: 400px;
        max-width: 500px;
    `;

    // Create title
    const title = document.createElement('h2');
    title.textContent = '🎮 Welcome to Mario!';
    title.style.cssText = `
        color: #ecf0f1;
        margin-bottom: 20px;
        font-size: 24px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    `;

    // Create subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Please enter your name to start playing:';
    subtitle.style.cssText = `
        color: #bdc3c7;
        margin-bottom: 25px;
        font-size: 16px;
    `;

    // Create input field
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Enter your name...';
    this.nameInput.maxLength = 20;
    this.nameInput.style.cssText = `
        width: 100%;
        padding: 15px;
        border: 2px solid #3498db;
        border-radius: 8px;
        font-size: 16px;
        background: #1a1a1a;
        color: #ecf0f1;
        margin-bottom: 20px;
        outline: none;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
    `;

    // Add focus effect
    this.nameInput.addEventListener('focus', function() {
        this.style.borderColor = '#00ff00';
        this.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
    });

    this.nameInput.addEventListener('blur', function() {
        this.style.borderColor = '#3498db';
        this.style.boxShadow = 'none';
    });

    // Create submit button
    this.submitButton = document.createElement('button');
    this.submitButton.textContent = '🚀 Start Game';
    this.submitButton.style.cssText = `
        background: linear-gradient(145deg, #27ae60, #2ecc71);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
    `;

    // Add hover effect
    this.submitButton.addEventListener('mouseenter', function() {
        this.style.background = 'linear-gradient(145deg, #2ecc71, #27ae60)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 12px rgba(39, 174, 96, 0.4)';
    });

    this.submitButton.addEventListener('mouseleave', function() {
        this.style.background = 'linear-gradient(145deg, #27ae60, #2ecc71)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 8px rgba(39, 174, 96, 0.3)';
    });

    // Add click handler
    this.submitButton.addEventListener('click', () => {
        this.handleNameSubmit();
    });

    // Add Enter key handler
    this.nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            this.handleNameSubmit();
        }
    });

    // Assemble modal
    modalContent.appendChild(title);
    modalContent.appendChild(subtitle);
    modalContent.appendChild(this.nameInput);
    modalContent.appendChild(this.submitButton);
    this.modal.appendChild(modalContent);

    // Add to document
    document.body.appendChild(this.modal);
};

Mario.NameInputState.prototype.checkForStoredName = function() {
    try {
        const storedName = localStorage.getItem('marioPlayerName');
        if (storedName) {
            console.log('Found stored name:', storedName);
            // Pre-fill the input field with the stored name
            setTimeout(() => {
                if (this.nameInput) {
                    this.nameInput.value = storedName;
                }
            }, 200);
        }
    } catch (error) {
        console.log('No stored name found or localStorage not available');
    }
};

Mario.NameInputState.prototype.showModal = function() {
    this.modal.style.display = 'flex';
    this.isModalVisible = true;
    // Focus on input field
    setTimeout(() => {
        this.nameInput.focus();
    }, 100);
};

Mario.NameInputState.prototype.hideModal = function() {
    if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
    }
    this.isModalVisible = false;
};

Mario.NameInputState.prototype.transitionToTitleState = function() {
    try {
        // Hide the modal first
        this.hideModal();
        
        // Clean up any existing welcome message before transitioning
        const existingWelcome = document.getElementById('welcome-message-container');
        if (existingWelcome && existingWelcome.parentNode) {
            existingWelcome.parentNode.removeChild(existingWelcome);
        }
        
        // Wait a moment for the modal to be removed from DOM
        setTimeout(() => {
            // Use the stored state context if available
            if (this.stateContext) {
                console.log('Transitioning to TitleState using stored context...');
                this.stateContext.ChangeState(new Mario.TitleState());
            } else {
                // Fallback: try to access the global application
                if (window.Mario && window.Mario.GlobalApplication && window.Mario.GlobalApplication.stateContext) {
                    console.log('Transitioning to TitleState using global application...');
                    window.Mario.GlobalApplication.stateContext.ChangeState(new Mario.TitleState());
                } else {
                    console.error('No state context available for transition');
                    console.log('Available objects:', {
                        stateContext: !!this.stateContext,
                        Mario: !!window.Mario,
                        GlobalApplication: !!(window.Mario && window.Mario.GlobalApplication),
                        globalStateContext: !!(window.Mario && window.Mario.GlobalApplication && window.Mario.GlobalApplication.stateContext)
                    });
                    
                    // Fallback: try to reload the page to restart the game
                    alert('Game state error. Reloading page...');
                    window.location.reload();
                }
            }
        }, 100);
    } catch (error) {
        console.error('Error transitioning to TitleState:', error);
        alert('Error transitioning to game. Reloading page...');
        window.location.reload();
    }
};

Mario.NameInputState.prototype.handleNameSubmit = function() {
    const name = this.nameInput.value.trim();
    
    if (!name) {
        alert('Please enter your name!');
        return;
    }

    if (name.length < 2) {
        alert('Name must be at least 2 characters long!');
        return;
    }

    this.playerName = name;
    
    // Store name in MongoDB
    this.storePlayerName(name).then((result) => {
        console.log('Name storage result:', result);
        // Transition to title state
        this.transitionToTitleState();
    }).catch((error) => {
        console.error('Error storing player name:', error);
        
        // Provide more specific error message
        let errorMessage = 'Error saving name, but continuing to game...';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server. Name saved locally. Make sure to run "npm start" and access via http://localhost:3000';
        } else if (error.message.includes('HTTP error')) {
            errorMessage = 'Server error occurred. Name saved locally.';
        } else if (error.message.includes('file://')) {
            errorMessage = 'Running in offline mode. Name saved locally.';
        }
        
        alert(errorMessage);
        
        // Still transition to title state even if save fails
        this.transitionToTitleState();
    });
};

Mario.NameInputState.prototype.storePlayerName = async function(name) {
    try {
        // Check if we're running on localhost (server mode) or file:// (direct file access)
        const isServerMode = window.location.protocol === 'http:' || window.location.protocol === 'https:';
        
        if (!isServerMode) {
            console.warn('Running in file:// mode - cannot connect to server. Storing name locally.');
            // Store name locally in localStorage as fallback
            localStorage.setItem('marioPlayerName', name);
            localStorage.setItem('marioPlayerTimestamp', new Date().toISOString());
            window.Mario.PlayerName = name;
            return { success: true, message: 'Name stored locally (offline mode)' };
        }

        const response = await fetch('/api/player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Player name stored successfully:', result);
        
        // Store name in global variable for use in game
        window.Mario.PlayerName = name;
        
        return result;
    } catch (error) {
        console.error('Error storing player name:', error);
        
        // Fallback: store locally if server fails
        try {
            localStorage.setItem('marioPlayerName', name);
            localStorage.setItem('marioPlayerTimestamp', new Date().toISOString());
            window.Mario.PlayerName = name;
            console.log('Name stored locally as fallback');
        } catch (localError) {
            console.error('Failed to store name locally:', localError);
        }
        
        throw error;
    }
};
