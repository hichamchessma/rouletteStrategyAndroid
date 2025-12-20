/**
 * Roulette Decision Support System - UI Controller
 * 
 * This file handles all the UI interactions and connects the UI with the business logic.
 */

// Attendre que le DOM soit complètement chargé avant d'initialiser les événements
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, initialisation des événements...');
    // DOM Elements
    const maxBetSelect = document.getElementById('max-bet');
    const thresholdSelect = document.getElementById('threshold');
    const baseBetSelect = document.getElementById('base-bet');
    const randomHistoryBtn = document.getElementById('random-history-btn');
    const generatedNumbersContainer = document.getElementById('generated-numbers');
    const undoBtn = document.getElementById('undo-last-number');
    const addRandomNumberBtn = document.getElementById('add-random-number-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    // Charger la session sauvegardée au démarrage
    loadSavedSession();
    
    // Ajouter des gestionnaires d'événements pour la rotation de l'écran et la visibilité de la page
    window.addEventListener('orientationchange', function() {
        console.log('Orientation changée, sauvegarde de la session...');
        saveSession();
    });
    
    // Sauvegarder la session lorsque la page devient invisible (changement d'application)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            console.log('Page cachée, sauvegarde de la session...');
            saveSession();
        } else if (document.visibilityState === 'visible') {
            console.log('Page visible, chargement de la session...');
            loadSavedSession();
        }
    });
    
    // Sélectionner tous les numéros cliquables de la roulette
    const rouletteNumbers = document.querySelectorAll('.number-cell.clickable');
    
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
    
    // Charger l'historique et les paramètres sauvegardés
    function loadSavedSession() {
        try {
            // Charger l'historique
            const savedHistory = localStorage.getItem('rouletteHistory');
            if (savedHistory) {
                currentHistory = JSON.parse(savedHistory);
                displayGeneratedNumbers(currentHistory);
                
                // Charger les états des paris (betIndices et signalHits)
                const savedBetState = localStorage.getItem('rouletteBetState');
                if (savedBetState) {
                    const betState = JSON.parse(savedBetState);
                    if (betState.betIndices) {
                        // Restaurer les indices de paris
                        window.betIndices = betState.betIndices;
                    }
                    if (betState.signalHits) {
                        // Restaurer les signaux de hit
                        window.signalHits = betState.signalHits;
                    }
                }
            }
            
            // Charger les paramètres
            const savedParams = localStorage.getItem('rouletteParams');
            if (savedParams) {
                const params = JSON.parse(savedParams);
                if (params.baseBet) baseBetSelect.value = params.baseBet;
                if (params.maxBet) maxBetSelect.value = params.maxBet;
                if (params.threshold) thresholdSelect.value = params.threshold;
            }
            
            // Recalculer les paris si l'historique existe
            if (currentHistory.length >= 5) {
                calculateNextBet();
            }
            
            console.log('Session chargée avec succès');
        } catch (error) {
            console.error('Erreur lors du chargement de la session:', error);
        }
    }
    
    // Sauvegarder l'historique et les paramètres
    function saveSession() {
        try {
            // Sauvegarder l'historique
            localStorage.setItem('rouletteHistory', JSON.stringify(currentHistory));
            
            // Sauvegarder les paramètres
            const params = {
                baseBet: baseBetSelect.value,
                maxBet: maxBetSelect.value,
                threshold: thresholdSelect.value
            };
            localStorage.setItem('rouletteParams', JSON.stringify(params));
            
            // Sauvegarder l'état des paris (betIndices et signalHits)
            if (typeof window.betIndices !== 'undefined' && typeof window.signalHits !== 'undefined') {
                const betState = {
                    betIndices: window.betIndices,
                    signalHits: window.signalHits
                };
                localStorage.setItem('rouletteBetState', JSON.stringify(betState));
            }
            
            console.log('Session sauvegardée avec succès');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la session:', error);
        }
    }
    
    /**
     * Clears all input fields and results
     */
    function clearAll() {
        // Clear generated numbers display
        generatedNumbersContainer.innerHTML = '';
        currentHistory = [];
        
        // Reset tracking for columns
        column1AbsenceElement.textContent = '0';
        column2AbsenceElement.textContent = '0';
        column3AbsenceElement.textContent = '0';
        
        // Reset tracking for tiers
        tier1AbsenceElement.textContent = '0';
        tier2AbsenceElement.textContent = '0';
        tier3AbsenceElement.textContent = '0';
        
        // Reset no-repetition counters
        document.getElementById('column-1-no-rep').textContent = '0';
        document.getElementById('column-2-no-rep').textContent = '0';
        document.getElementById('column-3-no-rep').textContent = '0';
        document.getElementById('tier-1-no-rep').textContent = '0';
        document.getElementById('tier-2-no-rep').textContent = '0';
        document.getElementById('tier-3-no-rep').textContent = '0';
        
        // Reset bet displays
        document.getElementById('column-1-bet').textContent = '-';
        document.getElementById('column-2-bet').textContent = '-';
        document.getElementById('column-3-bet').textContent = '-';
        document.getElementById('tier-1-bet').textContent = '-';
        document.getElementById('tier-2-bet').textContent = '-';
        document.getElementById('tier-3-bet').textContent = '-';
        
        // Remove any error messages
        const errorMsg = document.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
        
        // Réinitialiser les indices de paris
        resetBetIndices();
        
        // Réinitialiser les paris visuels sur la table
        resetVisualBets();
        
        // Effacer les données sauvegardées
        localStorage.removeItem('rouletteHistory');
        // On garde les paramètres (mise initiale, max, seuil)
        
        console.log('Tableau complètement réinitialisé');
    }
    
    /**
     * Réinitialise tous les indices de paris
     */
    function resetBetIndices() {
        // Réinitialiser les indices de paris dans roulette-logic.js
        if (typeof betIndices !== 'undefined') {
            betIndices.columns = { 1: 0, 2: 0, 3: 0 };
            betIndices.tiers = { 1: 0, 2: 0, 3: 0 };
            betIndices.noRepColumns = { 1: 0, 2: 0, 3: 0 };
            betIndices.noRepTiers = { 1: 0, 2: 0, 3: 0 };
            betIndices.columnsMaxBetPlayed = { 1: false, 2: false, 3: false };
            betIndices.tiersMaxBetPlayed = { 1: false, 2: false, 3: false };
        }
        
        // Réinitialiser les signaux de hit
        if (typeof signalHits !== 'undefined') {
            signalHits.columns = { 1: false, 2: false, 3: false };
            signalHits.tiers = { 1: false, 2: false, 3: false };
            signalHits.noRepColumns = { 1: false, 2: false, 3: false };
            signalHits.noRepTiers = { 1: false, 2: false, 3: false };
        }
    }
    
    /**
     * Réinitialise l'affichage visuel des paris sur la table
     */
    function resetVisualBets() {
        // Réinitialiser les paris sur les colonnes dans le tableau de suivi
        updateVisualBet('bet-column-1', '-');
        updateVisualBet('bet-column-2', '-');
        updateVisualBet('bet-column-3', '-');
        
        // Réinitialiser les paris sur les tiers dans le tableau de suivi
        updateVisualBet('bet-tier-1', '-');
        updateVisualBet('bet-tier-2', '-');
        updateVisualBet('bet-tier-3', '-');
        
        // Réinitialiser les paris visuels sur la table de roulette
        // Colonnes
        const columnBetVisuals = document.querySelectorAll('[id$="-bet-visual"]');
        columnBetVisuals.forEach(element => {
            element.textContent = '-';
            element.classList.remove('active-bet');
        });
        
        // Supprimer tous les paris visuels sur les numéros
        document.querySelectorAll('.number-cell').forEach(cell => {
            cell.classList.remove('bet-highlight');
        });
        
        console.log('Paris visuels réinitialisés sur la table de roulette');
    }



    const numberGrid = document.getElementById('number-grid');

    // Générer les boutons 0 → 36 pour la grille de numéros (non utilisée actuellement)
    for (let i = 0; i <= 36; i++) {
        const btn = document.createElement('div');
        btn.className = 'number-btn';
        btn.textContent = i;

        btn.addEventListener('click', () => {
             addNumberAndRecalculate(i);
             numberGrid.classList.add('hidden');
        });

        numberGrid.appendChild(btn);
    }

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
        
        // Sauvegarder la session après chaque modification
        saveSession();
    }


    /**
     * Met à jour l'affichage visuel d'un pari sur le tableau de roulette
     * @param {string} elementId - ID de l'élément à mettre à jour
     * @param {string} betValue - Valeur du pari à afficher
     */
    function updateVisualBet(elementId, betValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Récupérer la mise initiale (valeur en euros)
        const baseBet = parseInt(document.getElementById('base-bet').value) || 2;
        
        // Réinitialiser les classes
        element.classList.remove('active-bet');
        
        // Si le pari est actif (pas '-')
        if (betValue && betValue !== '-') {
            let betAmount = '-';
            
            // Vérifier si c'est un pari combiné (format: "5(a) + 3(n) = 8")
            if (betValue.includes('=')) {
                // Extraire le montant total après le signe =
                const totalMatch = betValue.match(/=\s*(\d+)/);
                if (totalMatch && totalMatch[1]) {
                    betAmount = totalMatch[1]; // Montant total après le signe =
                }
            } else {
                // Pari simple (format: "5(a)" ou "3(n)")
                const match = betValue.match(/\d+/);
                if (match) {
                    betAmount = match[0];
                }
            }
            
            // Convertir en euros en multipliant par la mise initiale
            const betEuros = parseInt(betAmount) * baseBet;
            
            // Mettre à jour le texte et ajouter la classe active
            element.textContent = betEuros + '€';
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
        console.log('Affichage de l\'historique:', numbers);
        
        // Vérifier que le conteneur existe
        if (!generatedNumbersContainer) {
            console.error('Conteneur d\'historique introuvable!');
            return;
        }
        
        // Clear the container
        generatedNumbersContainer.innerHTML = '';
        
        if (numbers.length === 0) {
            console.log('Historique vide');
            return;
        }
        
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
        
        console.log('Historique affiché avec', numbers.length, 'numéros');
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
    
    // Ajouter des gestionnaires d'événements pour les numéros de la roulette
    console.log('Initialisation des gestionnaires d\'événements pour', rouletteNumbers.length, 'numéros cliquables');
    rouletteNumbers.forEach(numberCell => {
        numberCell.addEventListener('click', () => {
            // Récupérer le numéro depuis l'attribut data-number
            const number = parseInt(numberCell.getAttribute('data-number'));
            console.log('Clic sur le numéro', number);
            
            // Ajouter le numéro à l'historique et recalculer les paris
            addNumberAndRecalculate(number);
            
            // Effet visuel pour indiquer que le numéro a été ajouté
            numberCell.classList.add('just-clicked');
            setTimeout(() => {
                numberCell.classList.remove('just-clicked');
            }, 300);
        });
    });
    
    // Mise à jour automatique lors du changement de seuil
    thresholdSelect.addEventListener('change', () => {
        // Recalculer les paris avec le nouveau seuil
        if (currentHistory.length >= 5) {
            calculateNextBet();
        }
        // Sauvegarder les paramètres
        saveSession();
    });
    
    // Mise à jour automatique lors du changement de mise max
    maxBetSelect.addEventListener('change', () => {
        // Recalculer les paris avec la nouvelle mise max
        if (currentHistory.length >= 5) {
            calculateNextBet();
        }
        // Sauvegarder les paramètres
        saveSession();
    });
    
    // Mise à jour automatique lors du changement de mise initiale
    baseBetSelect.addEventListener('change', () => {
        // Recalculer les paris avec la nouvelle mise initiale
        if (currentHistory.length >= 5) {
            calculateNextBet();
        }
        // Sauvegarder les paramètres
        saveSession();
    });
    
    // Add random number button
    addRandomNumberBtn.addEventListener('click', () => {
        // Generate a random number between 0 and 36
        const randomNum = Math.floor(Math.random() * 37);
        
        // Add it to the history
        currentHistory.unshift(randomNum);
        
        // Display the updated history
        displayGeneratedNumbers(currentHistory);
        
        // Calculate bets based on the updated history
        calculateNextBet();
        
        // Sauvegarder la session
        saveSession();
    });
    
    // Clear history button
    clearHistoryBtn.addEventListener('click', () => {
        // Clear the history
        currentHistory = [];
        
        // Clear the display
        displayGeneratedNumbers(currentHistory);
        
        // Reset all values
        clearAll();
        
        // Sauvegarder la session vide
        saveSession();
    });
    
    // Generate random history button
    randomHistoryBtn.addEventListener('click', generateRandomHistory);
});
