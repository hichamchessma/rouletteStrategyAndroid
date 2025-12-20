/**
 * Fichier de test pour la Roulette Strategy Helper
 * 
 * Ce fichier contient 20 scénarios de test avec des historiques de 10 numéros
 * et les résultats attendus pour chaque scénario.
 */

const testScenarios = [
    // Scénario 1: Exemple fourni par l'utilisateur
    {
        id: 1,
        description: "Exemple 1 fourni par l'utilisateur",
        config: {
            threshold: 3,
            maxBet: 8,
            baseBet: 1
        },
        history: [1, 2, 14, 21, 31, 24, 1, 0, 17, 18],
        expected: {
            columns: {
                1: { absence: 0, noRepetition: "1X", bet: "0", betEuros: "0" },
                2: { absence: 1, noRepetition: "1", bet: "0", betEuros: "0" },
                3: { absence: 3, noRepetition: "1", bet: "1(a)", betEuros: "1€" }
            },
            tiers: {
                1: { absence: 0, noRepetition: "0Y", bet: "0", betEuros: "0" },
                2: { absence: 2, noRepetition: "0", bet: "0", betEuros: "0" },
                3: { absence: 4, noRepetition: "0", bet: "1(a)", betEuros: "1€" }
            }
        }
    },
    
    // Scénario 2: Exemple fourni par l'utilisateur
    {
        id: 2,
        description: "Exemple 2 fourni par l'utilisateur",
        config: {
            threshold: 3,
            maxBet: 8,
            baseBet: 1
        },
        history: [14, 2, 1, 21, 5, 24, 1, 0, 17, 18],
        expected: {
            columns: {
                1: { absence: 2, noRepetition: "0", bet: "0", betEuros: "0" },
                2: { absence: 0, noRepetition: "0X", bet: "0", betEuros: "0" },
                3: { absence: 3, noRepetition: "0", bet: "1(a)", betEuros: "1€" }
            },
            tiers: {
                1: { absence: 1, noRepetition: "1Y", bet: "0", betEuros: "0" },
                2: { absence: 0, noRepetition: "1", bet: "0", betEuros: "0" },
                3: { absence: 10, noRepetition: "1", bet: "1(a)", betEuros: "1€" }
            }
        }
    },
    
    // Scénario 3: Exemple fourni par l'utilisateur
    {
        id: 3,
        description: "Exemple 3 fourni par l'utilisateur",
        config: {
            threshold: 3,
            maxBet: 8,
            baseBet: 1
        },
        history: [33, 3, 35, 2, 1, 25, 26, 16, 1, 34],
        expected: {
            columns: {
                1: { absence: 4, noRepetition: "0", bet: "1(a)", betEuros: "1€" },
                2: { absence: 2, noRepetition: "0", bet: "0", betEuros: "0" },
                3: { absence: 0, noRepetition: "0X", bet: "0", betEuros: "0" }
            },
            tiers: {
                1: { absence: 1, noRepetition: "3", bet: "0", betEuros: "0" },
                2: { absence: 7, noRepetition: "3", bet: "3(a)", betEuros: "3€" },
                3: { absence: 0, noRepetition: "3Y", bet: "1(n)", betEuros: "1€" }
            }
        }
    },
    
    // Scénario 4: Exemple fourni par l'utilisateur
    {
        id: 4,
        description: "Exemple 4 fourni par l'utilisateur",
        config: {
            threshold: 2,
            maxBet: 5,
            baseBet: 1
        },
        history: [33, 3, 35, 2, 1, 25, 26, 1, 16, 34],
        expected: {
            columns: {
                1: { absence: 4, noRepetition: "0", bet: "1(a)", betEuros: "1€" },
                2: { absence: 2, noRepetition: "0", bet: "0", betEuros: "0" },
                3: { absence: 0, noRepetition: "0X", bet: "0", betEuros: "0" }
            },
            tiers: {
                1: { absence: 1, noRepetition: "3", bet: "0", betEuros: "0" },
                2: { absence: 8, noRepetition: "3", bet: "1(a)", betEuros: "1€" },
                3: { absence: 0, noRepetition: "3Y", bet: "1(a)", betEuros: "1€" }
            }
        }
    },
    
    // Scénario 5: Exemple fourni par l'utilisateur avec zéro
    {
        id: 5,
        description: "Exemple 5 fourni par l'utilisateur avec zéro",
        config: {
            threshold: 2,
            maxBet: 5,
            baseBet: 1
        },
        history: [1, 11, 31, 0, 32, 15, 2, 18, 3, 33],
        expected: {
            columns: {
                1: { absence: 0, noRepetition: "7X", bet: "5(n)", betEuros: "5€" },
                2: { absence: 1, noRepetition: "7", bet: "0", betEuros: "0" },
                3: { absence: 5, noRepetition: "7", bet: "2(a)", betEuros: "2€" }
            },
            tiers: {
                1: { absence: 0, noRepetition: "0Y", bet: "0", betEuros: "0" },
                2: { absence: 6, noRepetition: "0", bet: "3(a)", betEuros: "3€" },
                3: { absence: 2, noRepetition: "0", bet: "1(a)", betEuros: "1€" }
            }
        }
    },
    
    // Scénario 6: Progression des paris d'absence avec reset
    {
        id: 6,
        description: "Progression des paris d'absence avec reset",
        config: {
            threshold: 2,
            maxBet: 5,
            baseBet: 1
        },
        history: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30], // Tous dans C3
        expected: {
            columns: {
                1: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" }, // Reset après max bet
                2: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" }, // Reset après max bet
                3: { absence: 0, noRepetition: "0X", bet: "0", betEuros: "0" }
            },
            tiers: {
                1: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" }, // Reset après max bet
                2: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" }, // Reset après max bet
                3: { absence: 0, noRepetition: "0Y", bet: "0", betEuros: "0" }
            }
        }
    },

    // Scénario 7: Alternance C1-C2-C3
    {
        id: 7,
        description: "Alternance C1-C2-C3",
        config: {
            threshold: 3,
            maxBet: 8,
            baseBet: 1
        },
        history: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Alternance
        expected: {
            columns: {
                1: { absence: 0, noRepetition: "9X", bet: "8(n)", betEuros: "8€" },
                2: { absence: 1, noRepetition: "9", bet: "0", betEuros: "0" },
                3: { absence: 2, noRepetition: "9", bet: "0", betEuros: "0" }
            },
            tiers: {
                1: { absence: 0, noRepetition: "0Y", bet: "0", betEuros: "0" },
                2: { absence: 10, noRepetition: "0", bet: "1", betEuros: "1€" },// Reset après max bet
                3: { absence: 10, noRepetition: "0", bet: "1", betEuros: "1€" } // Reset après max bet
            }
        }
    },



    // Scénario 9: No-repetition sur C1 avec seuil bas
    {
        id: 9,
        description: "No-repetition sur C1 avec seuil bas",
        config: {
            threshold: 2,
            maxBet: 5,
            baseBet: 1
        },
        history: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28], // Tous dans C1
        expected: {
            columns: {
                1: { absence: 0, noRepetition: "0X", bet: "0", betEuros: "0" },
                2: { absence: 10, noRepetition: "0", bet: "1(a)",betEuros: "1€" },// Reset après max bet
                3: { absence: 10, noRepetition: "0", bet: "1(a)",betEuros: "1€" } // Reset après max bet
            },
            tiers: {
                1: { absence: 0, noRepetition: "0Y", bet: "0", betEuros: "0" },
                2: { absence: 4, noRepetition: "0", bet: "1(a)", betEuros: "1€" },
                3: { absence: 8, noRepetition: "0", bet: "1(a)", betEuros: "1€" } // Reset après max bet
            }
        }
    },

    // Scénario 10: Zéro (0) répété
    {
        id: 10,
        description: "Zéro (0) répété",
        config: {
            threshold: 3,
            maxBet: 8,
            baseBet: 1
        },
        history: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Tous zéro
        expected: {
            columns: {
                1: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" },// Reset après max bet 9:8 10:1
                2: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" },// Reset après max bet
                3: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" }// Reset après max bet
            },                                                             
            tiers: {                                                       
                1: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" },// Reset après max bet
                2: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" },// Reset après max bet
                3: { absence: 10, noRepetition: "0", bet: "1(a)", betEuros: "1€" }// Reset après max bet
            }
        }
    },

    // Scénario 11: Alternance T1-T2-T3
    {
        id: 11,
        description: "Alternance T1-T2-T3",
        config: {
            threshold: 2,
            maxBet: 27,
            baseBet: 1
        },
        history: [1, 13, 25, 2, 14, 26, 3, 15, 27, 4], // Alternance T1-T2-T3
        expected: {
            columns: {
                1: { absence: 0, noRepetition: "0X", bet: "0", betEuros: "0" },
                2: { absence: 3, noRepetition: "0", bet: "1(a)", betEuros: "1€" },
                3: { absence: 6, noRepetition: "0", bet: "3(a)", betEuros: "3€" }
            },
            tiers: {
                1: { absence: 0, noRepetition: "9Y", bet: "12(n)", betEuros: "12€" },
                2: { absence: 1, noRepetition: "9", bet: "0", betEuros: "0" },
                3: { absence: 2, noRepetition: "9", bet: "1(a)", betEuros: "1€" }
            }
        }
    },

];

/**
 * Fonction pour exécuter les tests et vérifier les résultats
 */
function runTests() {
    console.log("=== DÉBUT DES TESTS ===");
    
    testScenarios.forEach(scenario => {
        console.log(`\n--- Test ${scenario.id}: ${scenario.description} ---`);
        console.log(`Configuration: seuil=${scenario.config.threshold}, maxBet=${scenario.config.maxBet}, baseBet=${scenario.config.baseBet}`);
        console.log(`Historique: ${scenario.history.join(', ')}`);
        
        // Ici, on pourrait appeler la fonction d'analyse avec les paramètres du scénario
        // et comparer les résultats avec les valeurs attendues
        
        console.log("Résultats attendus:");
        console.log("- Colonnes:", JSON.stringify(scenario.expected.columns));
        console.log("- Tiers:", JSON.stringify(scenario.expected.tiers));
    });
    
    console.log("\n=== FIN DES TESTS ===");
}

// Exporter les scénarios pour utilisation externe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testScenarios,
        runTests
    };
}
