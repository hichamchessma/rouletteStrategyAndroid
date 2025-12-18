/**
 * Roulette Decision Support System - UI Controller
 * 
 * This file handles all the UI interactions and connects the UI with the business logic.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Générer automatiquement un historique aléatoire au démarrage pour tester
    setTimeout(() => {
        generateRandomHistory();
    }, 500);
    // DOM Elements
    const maxBetSelect = document.getElementById('max-bet');
    const newNumberInput = document.getElementById('number-picker-input');
    const randomHistoryBtn = document.getElementById('random-history-btn');
    const generatedNumbersContainer = document.getElementById('generated-numbers');
    
    // Tracking elements for columns
    const column1AbsenceElement = document.getElementById('column-1-absence');
    const column2AbsenceElement = document.getElementById('column-2-absence');
    const column3AbsenceElement = document.getElementById('column-3-absence');
    
    // Tracking elements for tiers
    const tier1AbsenceElement = document.getElementById('tier-1-absence');
    const tier2AbsenceElement = document.getElementById('tier-2-absence');
    const tier3AbsenceElement = document.getElementById('tier-3-absence');
    
    // Current history of numbers (most recent first)
    let currentHistory = [];
    
    /**
     * Clears all input fields and results
     */
    function clearAll() {
        // Clear new number input
        newNumberInput.value = '';
        newNumberInput.classList.remove('error');
        
        // Clear generated numbers display
        generatedNumbersContainer.innerHTML = '';
        currentHistory = [];
        
        // Reset results
        columnSignalElement.textContent = 'Pas encore';
        columnAbsenceElement.textContent = '-';
        columnBetElement.textContent = '-';
        
        tierSignalElement.textContent = 'Pas encore';
        tierAbsenceElement.textContent = '-';
        tierBetElement.textContent = '-';
        
        // Reset tracking for columns
        column1AbsenceElement.textContent = '0';
        column2AbsenceElement.textContent = '0';
        column3AbsenceElement.textContent = '0';
        
        // Reset tracking for tiers
        tier1AbsenceElement.textContent = '0';
        tier2AbsenceElement.textContent = '0';
        tier3AbsenceElement.textContent = '0';
        
        // Remove any error messages
        const errorMsg = document.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }



    const numberGrid = document.getElementById('number-grid');
    const numberPickerInput = document.getElementById('number-picker-input');
    const undoBtn = document.getElementById('undo-last-number');

    // Générer les boutons 0 → 36
    for (let i = 0; i <= 36; i++) {
        const btn = document.createElement('div');
        btn.className = 'number-btn';
        btn.textContent = i;

        btn.addEventListener('click', () => {
             addNumberAndRecalculate(i);
                numberGrid.classList.add('hidden');
                numberPickerInput.value = '';
        });

        numberGrid.appendChild(btn);
    }

    // Afficher la grille au clic sur l’input
    numberPickerInput.addEventListener('click', (e) => {
        e.stopPropagation();
        numberGrid.classList.remove('hidden');
    });

    numberGrid.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', () => {
        numberGrid.classList.add('hidden');
    });

    // Supprimer le dernier numéro ajouté
    undoBtn.addEventListener('click', () => {
        if (currentHistory.length > 0) {
            currentHistory.shift(); // enlève le plus récent
            displayGeneratedNumbers(currentHistory);
            calculateNextBet();
        }
    });



    function addNumberAndRecalculate(num) {
        // Ajouter en tête
        currentHistory.unshift(num);

        // Limite à 30
        if (currentHistory.length > 30) {
            currentHistory = currentHistory.slice(0, 30);
        }

        // UI
        displayGeneratedNumbers(currentHistory);

        // 🔥 CALCUL TOUJOURS
        calculateNextBet();
    }


    /**
     * Met à jour l'affichage visuel d'un pari sur le tableau de roulette
     * @param {string} elementId - ID de l'élément HTML à mettre à jour
     * @param {string} betValue - Valeur du pari à afficher
     */
    function updateVisualBet(elementId, betValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Réinitialiser les classes
        element.classList.remove('active-bet');
        
        // Si le pari est actif (pas '-')
        if (betValue && betValue !== '-') {
            let betAmount = '-';
            
            // Vérifier si c'est un pari combiné (format: "5(a) + 3(n) = 8 sur C1")
            if (betValue.includes('=')) {
                // Extraire le montant total après le signe =
                const totalMatch = betValue.match(/=\s*(\d+)/);
                if (totalMatch && totalMatch[1]) {
                    betAmount = totalMatch[1]; // Montant total après le signe =
                }
            } else {
                // Pari simple (format: "5(a) sur C1" ou "3(n) sur T2")
                const match = betValue.match(/\d+/);
                if (match) {
                    betAmount = match[0];
                }
            }
            
            // Mettre à jour le texte et ajouter la classe active
            element.textContent = betAmount;
            element.classList.add('active-bet');
        } else {
            // Pas de pari actif
            if (elementId.includes('tier')) {
                // Pour les tiers, afficher le label standard
                const tierNumber = elementId.charAt(5);
                if (tierNumber === '1') element.textContent = '1st 12';
                else if (tierNumber === '2') element.textContent = '2nd 12';
                else if (tierNumber === '3') element.textContent = '3rd 12';
                else element.textContent = '-';
            } else {
                // Pour les colonnes, afficher un tiret
                element.textContent = '-';
            }
        }
    }
    
    // Display functions are now handled directly in calculateNextBet
    
    /**
     * Displays the generated numbers in the UI
     * @param {Array<number>} numbers - Array of numbers to display
     */
    function displayGeneratedNumbers(numbers) {
        // Clear the container
        generatedNumbersContainer.innerHTML = '';
        
        // Create rows of 10 numbers
        const rows = [];
        let currentRow = [];
        
        numbers.forEach((num, index) => {
            currentRow.push({
                num: num,
                position: index
            });
            
            // Start a new row after 10 numbers
            if (currentRow.length === 10) {
                rows.push([...currentRow]);
                currentRow = [];
            }
        });
        
        // Add any remaining numbers to the last row
        if (currentRow.length > 0) {
            rows.push(currentRow);
        }
        
        // Create DOM elements for each row
        rows.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.className = 'number-row';
            
            row.forEach(item => {
                const numElement = document.createElement('span');
                numElement.className = 'generated-number';
                numElement.textContent = item.num;
                numElement.setAttribute('data-position', item.position);
                rowElement.appendChild(numElement);
            });
            
            generatedNumbersContainer.appendChild(rowElement);
        });
    }
    
    /**
     * Validates the input fields and returns the numbers array
     * @returns {Array|null} Array of numbers or null if invalid
     */
    function getInputNumbers() {
        // Remove any previous error messages
        const prevError = document.querySelector('.error-message');
        if (prevError) {
            prevError.remove();
        }
        
        // Reset error styling
        numberInputs.forEach(input => {
            input.classList.remove('error');
        });
        
        // Collect non-empty inputs in order by data-index
        const numbersMap = new Map();
        let hasError = false;
        
        numberInputs.forEach(input => {
            if (input.value.trim() !== '') {
                const num = parseInt(input.value);
                const index = parseInt(input.dataset.index);
                
                // Validate number range
                if (isNaN(num) || num < 0 || num > 36) {
                    input.classList.add('error');
                    hasError = true;
                } else {
                    numbersMap.set(index, num);
                }
            }
        });
        
        // Convert map to array preserving order
        const numbers = Array.from(numbersMap)
            .sort((a, b) => a[0] - b[0])
            .map(item => item[1]);
        
        // Check if we have enough numbers
        if (numbers.length < 5) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Veuillez entrer au moins 5 numéros';
            document.querySelector('.number-inputs').after(errorMsg);
            return null;
        }
        
        // Check for errors
        if (hasError) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Les numéros doivent être entre 0 et 36';
            document.querySelector('.number-inputs').after(errorMsg);
            return null;
        }
        
        return numbers;
    }
    
    /**
     * Displays the analysis results in the UI
     * @param {Object} result - The analysis result
     */
    function displayResults(result) {
        if (result.error) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = result.error;
            document.querySelector('.number-inputs').after(errorMsg);
            return;
        }
        
        signalTypeElement.textContent = result.signalType;
        targetElement.textContent = result.target;
        absenceElement.textContent = `${result.absence} spins`;
        
        if (result.betSeries && result.betSeries.length > 0) {
            betSeriesElement.textContent = result.betSeries.join(' → ');
            nextBetElement.textContent = `${result.nextBet} sur ${result.target}`;
        } else {
            betSeriesElement.textContent = '-';
            nextBetElement.textContent = '-';
        }
    }
    
    /**
     * Adds a new number to the history and shifts all existing numbers
     * @param {number} newNum - The new number to add
     */
    function addNewNumber(newNum) {
        // Remove any previous error messages
        const prevError = document.querySelector('.error-message');
        if (prevError) {
            prevError.remove();
        }
        
        // Validate the new number
        if (isNaN(newNum) || newNum < 0 || newNum > 36) {
            newNumberInput.classList.add('error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Le numéro doit être entre 0 et 36';
            document.querySelector('.new-number-input').after(errorMsg);
            return;
        }
        
        // Add the new number at the beginning (left side)
        currentHistory.unshift(newNum);
        
        // Keep only the last 30 numbers if needed
        if (currentHistory.length > 30) {
            currentHistory = currentHistory.slice(0, 30);
        }
        
        // Display the numbers in the generated numbers area
        displayGeneratedNumbers(currentHistory);
        
        // Clear the new number input
        newNumberInput.value = '';
        
        // Always call calculateNextBet which will handle both tracking and signals
        calculateNextBet();
    }
    
    /**
     * Generates a random history of 10 roulette numbers
     */
    function generateRandomHistory() {
        // Remove any previous error messages
        const prevError = document.querySelector('.error-message');
        if (prevError) {
            prevError.remove();
        }
        
        // Clear current history
        currentHistory = [];
        
        // Generate 10 random numbers between 0 and 36
        for (let i = 0; i < 10; i++) {
            const randomNum = Math.floor(Math.random() * 37); // 0-36
            currentHistory.push(randomNum);
        }
        
        // Display the generated numbers
        displayGeneratedNumbers(currentHistory);
        
        // Calculate bets based on the random history
        calculateNextBet();
    }
    
    /**
     * Calculates the next bet based on the current history
     */
    function calculateNextBet() {
        // Remove any previous error messages
        const prevError = document.querySelector('.error-message');
        if (prevError) {
            prevError.remove();
        }
        
        if (currentHistory.length < 5) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Veuillez entrer au moins 5 numéros';
            document.querySelector('.input-section').after(errorMsg);
            
            // Réinitialiser les valeurs
            document.getElementById('column-1-absence').textContent = '0';
            document.getElementById('column-2-absence').textContent = '0';
            document.getElementById('column-3-absence').textContent = '0';
            document.getElementById('tier-1-absence').textContent = '0';
            document.getElementById('tier-2-absence').textContent = '0';
            document.getElementById('tier-3-absence').textContent = '0';
            
            document.getElementById('column-1-no-rep').textContent = '0';
            document.getElementById('column-2-no-rep').textContent = '0';
            document.getElementById('column-3-no-rep').textContent = '0';
            document.getElementById('tier-1-no-rep').textContent = '0';
            document.getElementById('tier-2-no-rep').textContent = '0';
            document.getElementById('tier-3-no-rep').textContent = '0';
            
            document.getElementById('column-1-bet').textContent = '-';
            document.getElementById('column-2-bet').textContent = '-';
            document.getElementById('column-3-bet').textContent = '-';
            document.getElementById('tier-1-bet').textContent = '-';
            document.getElementById('tier-2-bet').textContent = '-';
            document.getElementById('tier-3-bet').textContent = '-';
            
            // Réinitialiser les éléments visuels
            updateVisualBet('column-1-bet-visual', null);
            updateVisualBet('column-2-bet-visual', null);
            updateVisualBet('column-3-bet-visual', null);
            updateVisualBet('tier-1-bet-visual', null);
            updateVisualBet('tier-2-bet-visual', null);
            updateVisualBet('tier-3-bet-visual', null);
            return;
        }
        
        const maxBet = parseInt(maxBetSelect.value);
        const result = analyzeRouletteHistory(currentHistory, maxBet);
        
        // Debug output to console
        console.log('Current History:', currentHistory);
        console.log('Analysis Result:', result);
        
        // Display the results
        try {
            // Calculer les absences
            const absences = detectAbsence(currentHistory);
            
            // Mettre à jour les absences dans le tableau
            document.getElementById('column-1-absence').textContent = absences.columns[1];
            document.getElementById('column-2-absence').textContent = absences.columns[2];
            document.getElementById('column-3-absence').textContent = absences.columns[3];
            
            document.getElementById('tier-1-absence').textContent = absences.tiers[1];
            document.getElementById('tier-2-absence').textContent = absences.tiers[2];
            document.getElementById('tier-3-absence').textContent = absences.tiers[3];
            
            // Mettre à jour les no-repetition dans le tableau avec marquage X et Y
            if (result.noRepCounts) {
                // Colonnes
                const columnCandidate = result.noRepCounts.columnCandidate;
                document.getElementById('column-1-no-rep').textContent = result.noRepCounts.columns[1] + (columnCandidate === 1 ? 'X' : '');
                document.getElementById('column-2-no-rep').textContent = result.noRepCounts.columns[2] + (columnCandidate === 2 ? 'X' : '');
                document.getElementById('column-3-no-rep').textContent = result.noRepCounts.columns[3] + (columnCandidate === 3 ? 'X' : '');
                
                // Tiers
                const tierCandidate = result.noRepCounts.tierCandidate;
                document.getElementById('tier-1-no-rep').textContent = result.noRepCounts.tiers[1] + (tierCandidate === 1 ? 'Y' : '');
                document.getElementById('tier-2-no-rep').textContent = result.noRepCounts.tiers[2] + (tierCandidate === 2 ? 'Y' : '');
                document.getElementById('tier-3-no-rep').textContent = result.noRepCounts.tiers[3] + (tierCandidate === 3 ? 'Y' : '');
            } else {
                // Valeurs par défaut basées sur l'exemple
                document.getElementById('column-1-no-rep').textContent = '1';
                document.getElementById('column-2-no-rep').textContent = '1X'; // C2 est le candidat actuel
                document.getElementById('column-3-no-rep').textContent = '1';
                document.getElementById('tier-1-no-rep').textContent = '0';
                document.getElementById('tier-2-no-rep').textContent = '0Y'; // T2 est le candidat actuel
                document.getElementById('tier-3-no-rep').textContent = '0';
            }
            
            // Mettre à jour les paris dans le tableau d'informations
            if (result.columnBets) {
                document.getElementById('column-1-bet').textContent = result.columnBets[1] || '-';
                document.getElementById('column-2-bet').textContent = result.columnBets[2] || '-';
                document.getElementById('column-3-bet').textContent = result.columnBets[3] || '-';
                
                // Mettre à jour l'affichage visuel des paris sur les colonnes
                updateVisualBet('column-1-bet-visual', result.columnBets[1]);
                updateVisualBet('column-2-bet-visual', result.columnBets[2]);
                updateVisualBet('column-3-bet-visual', result.columnBets[3]);
            }
            
            if (result.tierBets) {
                document.getElementById('tier-1-bet').textContent = result.tierBets[1] || '-';
                document.getElementById('tier-2-bet').textContent = result.tierBets[2] || '-';
                document.getElementById('tier-3-bet').textContent = result.tierBets[3] || '-';
                
                // Mettre à jour l'affichage visuel des paris sur les tiers
                updateVisualBet('tier-1-bet-visual', result.tierBets[1]);
                updateVisualBet('tier-2-bet-visual', result.tierBets[2]);
                updateVisualBet('tier-3-bet-visual', result.tierBets[3]);
            }
            
            // Les signaux actifs ont été supprimés de l'interface
        } catch (error) {
            console.error('Error displaying results:', error);
        }
    }
    
    // Event Listeners
    
    // Add random number button
    document.getElementById('add-random-number-btn').addEventListener('click', () => {
        // Generate a random number between 0 and 36
        const randomNum = Math.floor(Math.random() * 37);
        
        // Add it to the history
        currentHistory.unshift(randomNum);
        
        // Display the updated history
        displayGeneratedNumbers(currentHistory);
        
        // Calculate bets based on the updated history
        calculateNextBet();
    });
    
    // Clear history button
    document.getElementById('clear-history-btn').addEventListener('click', () => {
        // Clear the history
        currentHistory = [];
        
        // Clear the display
        displayGeneratedNumbers(currentHistory);
        
        // Reset all values
        clearAll();
    });
    
    // Add new number with Enter key
    newNumberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newNum = parseInt(newNumberInput.value);
            if (!isNaN(newNum) && newNum >= 0 && newNum <= 36) {
                addNewNumber(newNum);
            } else {
                newNumberInput.classList.add('error');
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Veuillez entrer un numéro valide (0-36)';
                const existingError = document.querySelector('.error-message');
                if (existingError) existingError.remove();
                document.querySelector('.new-number-input').after(errorMsg);
            }
        }
    });
    
    // Generate random history button
    randomHistoryBtn.addEventListener('click', generateRandomHistory);
    
    // Add input validation for new number field
    newNumberInput.addEventListener('input', function() {
        // Remove non-numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Limit to 2 digits
        if (this.value.length > 2) {
            this.value = this.value.slice(0, 2);
        }
        
        // Ensure value is within range
        const num = parseInt(this.value);
        if (!isNaN(num) && num > 36) {
            this.value = '36';
        }
        
        // Remove error class when typing
        this.classList.remove('error');
    });
});
