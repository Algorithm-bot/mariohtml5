/**
 * Command Manager for Mario Code-Based Control System
 * Provides a safe API for users to control Mario through code
 */

// Global command queue
let commandQueue = [];

// Mario API - functions that users can call from their code
window.marioAPI = {
    // Move Mario in a direction for a specified number of steps
    move: function(direction, steps) {
        if (typeof direction !== 'string' || typeof steps !== 'number') {
            console.warn('marioAPI.move() requires direction (string) and steps (number)');
            return;
        }
        if (direction !== 'left' && direction !== 'right') {
            console.warn('marioAPI.move() direction must be "left" or "right"');
            return;
        }
        if (steps <= 0 || steps > 50) {
            console.warn('marioAPI.move() steps must be between 1 and 50');
            return;
        }
        
        commandQueue.push({ 
            action: 'move', 
            direction: direction, 
            steps: Math.floor(steps) 
        });
    },
    
    // Make Mario jump
    jump: function() {
        commandQueue.push({ action: 'jump' });
    },
    
    // Wait for a specified number of frames
    wait: function(frames) {
        if (typeof frames !== 'number' || frames <= 0 || frames > 100) {
            console.warn('marioAPI.wait() frames must be between 1 and 100');
            return;
        }
        commandQueue.push({ 
            action: 'wait', 
            frames: Math.floor(frames) 
        });
    },
    
    // Fire a fireball (if Mario has fire power)
    fireball: function() {
        commandQueue.push({ action: 'fireball' });
    },
    
    // Duck (if Mario is large)
    duck: function() {
        commandQueue.push({ action: 'duck' });
    },
    
    // Stop ducking
    stopDuck: function() {
        commandQueue.push({ action: 'stopDuck' });
    },
    
    // Get Mario's current position (for debugging/planning)
    getPosition: function() {
        if (window.Mario && window.Mario.Character && window.Mario.Character.prototype) {
            // This is a read-only function, doesn't add to command queue
            return {
                x: window.Mario.Character.prototype.X || 0,
                y: window.Mario.Character.prototype.Y || 0,
                onGround: window.Mario.Character.prototype.OnGround || false,
                facing: window.Mario.Character.prototype.Facing || 0
            };
        }
        return { x: 0, y: 0, onGround: false, facing: 0 };
    },
    
    // Get the number of commands currently in queue
    getQueueLength: function() {
        return commandQueue.length;
    }
};

// Command Manager object
window.MarioCommandManager = {
    // Get the next command from the queue
    getNextCommand: function() {
        if (commandQueue.length > 0) {
            return commandQueue.shift();
        }
        return null;
    },
    
    // Clear all commands
    clearCommands: function() {
        commandQueue = [];
    },
    
    // Get the number of commands in queue
    getCommandCount: function() {
        return commandQueue.length;
    },
    
    // Add a command directly (for internal use)
    addCommand: function(command) {
        commandQueue.push(command);
    }
};

// Status message display
function updateStatusMessage(message, isError = false) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = isError ? '#ff0000' : '#ffff00';
    }
}

// Clear status message
function clearStatusMessage() {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = '';
    }
}
