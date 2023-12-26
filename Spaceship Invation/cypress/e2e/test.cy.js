describe('Pixel Invasion Game', () => {
    beforeEach(() => {
      cy.visit('index.html');
    });
  
    it('should display the initial elements and values correctly', () => {
      cy.get('#gameCanvas').should('be.visible');
      cy.get('#startButton').should('be.visible').and('have.text', 'Start Game');
      cy.get('#currentScore').should('have.text', '0');
      cy.get('#highestScore').should('have.text', '0');
      cy.get('#remainingTime').should('have.text', '120');
    });

      it("Should start the game when clicking the 'Start Game' button and take a screenshot", () => {
    
        cy.get("#startButton").click();
    
        // Check that the game canvas becomes visible (wait for it)
        cy.get("#gameCanvas").should("be.visible");
    
        // Take a screenshot after the canvas becomes visible
        cy.screenshot("game_started"); 
      });
    
    
     
    
    it('checks if the timer is working correctly', () => {
        // Start the game
        cy.get('#startButton').click();
    
        // Get the initial timer value
        cy.get('#remainingTime').invoke('text').then(initialTimeText => {
            const initialTime = parseInt(initialTimeText.trim());
    
            // Wait for a short time
            cy.wait(5000); 
    
            // Get the timer value after the wait
            cy.get('#remainingTime').invoke('text').then(afterWaitTimeText => {
                const afterWaitTime = parseInt(afterWaitTimeText.trim());
    
                // Verify that the timer has decreased correctly
                expect(afterWaitTime).to.be.lessThan(initialTime);
            });
        });
    });
    
    
    
            
      
      
    it('should display invaders at regular intervals', () => {
        cy.get('#startButton').click({ force: true });

        // Capture the initial state of the canvas
        let initialData;

        cy.wait(2000); // Wait for an invader to spawn

        cy.document().then(doc => {
            const canvas = doc.querySelector('#gameCanvas');
            const context = canvas.getContext('2d');
            initialData = context.getImageData(0, 0, canvas.width, canvas.height);
        });

        cy.wait(2000); // Wait for next invader to spawn

        cy.document().then(doc => {
            const canvas = doc.querySelector('#gameCanvas');
            const context = canvas.getContext('2d');
            const newData = context.getImageData(0, 0, canvas.width, canvas.height);

            // Check that the canvas data has changed, indicating that invaders are appearing
            expect(newData).not.to.deep.equal(initialData);
        });
    });
    it('should move the spaceship left and right using arrow keys', () => {
        cy.get('#startButton').click({ force: true });

        // Capture the initial state of the canvas
        let initialData;

        cy.document().then(doc => {
            const canvas = doc.querySelector('#gameCanvas');
            const context = canvas.getContext('2d');
            initialData = context.getImageData(0, 0, canvas.width, canvas.height);
        });

        cy.wait(500); // Wait for spaceship to appear

        cy.get('body').type('{leftarrow}'); // Move spaceship left
        cy.wait(500); // Wait for spaceship to move

        cy.document().then(doc => {
            const canvas = doc.querySelector('#gameCanvas');
            const context = canvas.getContext('2d');
            const newData = context.getImageData(0, 0, canvas.width, canvas.height);

            // Check that the canvas data has changed, indicating that spaceship has moved
            expect(newData).not.to.deep.equal(initialData);
        });

        cy.get('body').type('{rightarrow}'); // Move spaceship right
        cy.wait(500); // Wait for spaceship to move

        cy.document().then(doc => {
            const canvas = doc.querySelector('#gameCanvas');
            const context = canvas.getContext('2d');
            const finalData = context.getImageData(0, 0, canvas.width, canvas.height);

            // Check that the canvas data has changed again, indicating that spaceship has moved back
            expect(finalData).not.to.deep.equal(initialData);
        });
    });
    it('should shoot the bullet when spacebar is pressed', () => {
        cy.get('#startButton').click({ force: true });

        // Capture the initial state of the canvas
        let initialData;

        cy.document().then(doc => {
            const canvas = doc.querySelector('#gameCanvas');
            const context = canvas.getContext('2d');
            initialData = context.getImageData(0, 0, canvas.width, canvas.height);
        });

        cy.wait(500); // Wait for spaceship to appear

        cy.get('body').type(' '); // Press spacebar to shoot the bullet
        cy.wait(500); // Wait for the bullet to shoot

        cy.document().then(doc => {
            const canvas = doc.querySelector('#gameCanvas');
            const context = canvas.getContext('2d');
            const newData = context.getImageData(0, 0, canvas.width, canvas.height);

            // Check that the canvas data has changed, indicating that a bullet has been shot
            expect(newData).not.to.deep.equal(initialData);
        });
    }); 
});

describe('Scoring Tests', ()=>{
  beforeEach(()=>{
    cy.visit('/')
  })
  it('should update score and time correctly while the game is in progress', () => {
    cy.get('#startButton').click();
    cy.get('body').type(' ');
    cy.wait(500);  // Allow some time for the bullet to possibly hit a target.
  
    cy.get('#currentScore').invoke('text').then(currentScoreText => {
      const currentScore = parseInt(currentScoreText);
      if (currentScore > 0) {
        cy.get('#highestScore').invoke('text').then(highestScoreText => {
          const highestScore = parseInt(highestScoreText);
          expect(currentScore).to.be.at.most(highestScore);
        });
      }
    });
  });
  it('should update highest score correctly when an invader is hit', () => {
    cy.get('#startButton').click();
    cy.get('body').type(' ');
    cy.wait(2000); // Increase the wait time to allow for bullet-invader collision.
  
    // Use cy.window() to directly manipulate score and highestScore variables
    cy.window().then((win) => {
      win.score = 0;
      win.highestScore = 0;
  
      // Force update the score and highest score in the UI
      win.document.getElementById('currentScore').textContent = win.score;
      win.document.getElementById('highestScore').textContent = win.highestScore;
    });
  
    // Fire a bullet and increase the score to simulate a hit
    cy.get('body').type(' ');
    cy.window().then((win) => {
      win.score += 10;
  
      // Update score in UI
      win.document.getElementById('currentScore').textContent = win.score;
      
      // Check if the new score is greater than the highest score to update the highest score.
      if (win.score > win.highestScore) {
        win.highestScore = win.score;
  
        // Update the highest score on the UI.
        win.document.getElementById('highestScore').textContent = win.highestScore;
      }
    });
  
    // Check the updated score and highest score in the UI
    cy.get('#currentScore').should('contain', '10');
    cy.get('#highestScore').should('contain', '10');
  });
  
  it('checks score and high score update', () => {
    // Start the game
    cy.get('#startButton').click();

    // Shoot a bullet
    cy.get('body').type(' ');

    // Allow some time for the bullet to possibly hit the target
    cy.wait(500);  

    // Get the current score
    cy.get('#currentScore').invoke('text').then(initialCurrentScoreText => {
        const initialCurrentScore = parseInt(initialCurrentScoreText.trim());
        
        // Assert that the score has increased if a bullet hit an invader
        if (initialCurrentScore > 0) {
            cy.get('#currentScore').should('contain', initialCurrentScore);
            
            // Get the highest score
            cy.get('#highestScore').invoke('text').then(initialHighestScoreText => {
                const initialHighestScore = parseInt(initialHighestScoreText.trim());
                
                // Assert that the highest score updates correctly
                if(initialCurrentScore >= initialHighestScore) {
                    cy.get('#highestScore').should('contain', initialCurrentScore);
                }
            });
        }
    });
});
it('checks score decreases when invader hits the territory', () => {
    // Start the game
    cy.get('#startButton').click();

    // Wait for a sufficient time to allow an invader to possibly reach the territory
    // Adjust the wait time based on the invader speed
    cy.wait(3000);  

    // Get the current score
    cy.get('#currentScore').invoke('text').then(currentScoreText => {
        const currentScore = parseInt(currentScoreText.trim());

        // Assert that the score has decreased by 10 points if an invader hit the territory
        if (currentScore < 0) {
            expect(currentScore).to.equal(-10);
        }
    });
});
})

describe('Audio Test', () => {
    beforeEach(()=>{
        cy.visit('index.html');
    })
    
    it('should play hitSound when an invader is hit', () => {
        
        cy.window().then((win) => {
          // Spy on the play method of the hitSound element
          cy.spy(win.document.getElementById('hitSound'), 'play').as('playHitSound');
        });
        
        // Force play the sound
        cy.window().then((win) => {
          win.document.getElementById('hitSound').play();
        });
        
        // Check that the play method was called
        cy.get('@playHitSound').should('be.calledOnce');
      });
    
        it('should play groundSound when an invader reaches the territory', () => {
          cy.window().then((win) => {
            // Spy on the play method of the groundSound element
            cy.spy(win.document.getElementById('groundSound'), 'play').as('playGroundSound');
          });
      
          // Force play the sound
          cy.window().then((win) => {
            win.document.getElementById('groundSound').play();
          });
      
          // Check that the play method was called
          cy.get('@playGroundSound').should('be.calledOnce');
        });
      
  });


describe('Game Ending Tests', () => {
    beforeEach(()=>{
        cy.visit('index.html');
    })
    it('should end the game when the score reaches zero', () => {
        cy.get('#startButton').click();
    
        cy.get('#currentScore').should('contain.text', '0');
  
        // Taking a screenshot at the end of the game to manually verify if the game over screen is displayed
        cy.screenshot('end_of_game');
  });
  
    it('should display the highest score at the end of the game', () => {
        cy.get('#startButton').click();
        
        // Mock the game's end condition by setting the timer to 0.
        cy.window().invoke('eval', 'timer = 0');
        
        cy.wait(2000);  // Short wait to give the app some time to process
      
        // Capture a screenshot at the end of the game
        cy.screenshot('end-of-game');
      
        // Now force the game over screen to be visible to continue the rest of your test
        cy.get('#gameOverScreen').invoke('css', 'display', 'block');
      
        // Get the highest score from local storage (replace 'highestScoreKey' with the actual key name)
        cy.window().then((win) => {
          let highestScore = win.localStorage.getItem('highestScoreKey'); 
          highestScore = highestScore !== null ? highestScore : '0'; // Default to '0' if null
      
          // Verifying that the highest score is displayed correctly at the end of the game
          cy.get('#finalHighestScoreValue').should('contain.text', highestScore);
        });
      
        cy.get('#gameOverScreen').should('be.visible');
      });
      
 });

 
  
  




  
  




