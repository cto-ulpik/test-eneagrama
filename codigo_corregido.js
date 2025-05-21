document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar elementos DENTRO del wrapper para evitar conflictos
    const wrapper = document.getElementById('eneagram-test-wrapper');
    if (!wrapper) {
        console.error("Contenedor principal #eneagram-test-wrapper no encontrado.");
        return;
    }

    const quizContainer = wrapper.querySelector('#quiz-container');
    const quizForm = wrapper.querySelector('#quiz-form');
    const resultsTextDiv = wrapper.querySelector('#results-text');
    const resultsContainer = wrapper.querySelector('#results-container');
    const alertMessageDiv = wrapper.querySelector('#alert-message');
    const paginationControlsDiv = wrapper.querySelector('#pagination-controls');
    const submitBtn = wrapper.querySelector('#submit-btn');
    const startTestContainer = wrapper.querySelector('#start-test-container');
    const startTestBtn = wrapper.querySelector('#start-test-btn');
    let resultsChart = null;

    const numTypes = 9;

    // --- PREGUNTAS (DEBES COMPLETARLAS CON 180) ---
    // Array de objetos: { text: "Texto de la pregunta", type: (número del 1 al 9) }
    // EJEMPLO CON POCAS PREGUNTAS - ¡RECUERDA PONER TUS 180 PREGUNTAS AQUÍ!
    const allQuestionsData = [
        // Tipo 1 (Ejemplo: poner 20 preguntas por tipo para 180 totales)
        { text: "P1-T1: Me esfuerzo por alcanzar la perfección en lo que hago.", type: 1 },
        { text: "P2-T1: Siento que es mi responsabilidad mejorar las cosas.", type: 1 },
        { text: "P3-T1: Tengo altos estándares.", type: 1 },
        { text: "P4-T1: Me molesta el desorden.", type: 1 },
        { text: "P5-T1: Soy crítico conmigo mismo.", type: 1 },
        { text: "P6-T1: La justicia es importante.", type: 1 },
        { text: "P7-T1: Soy organizado.", type: 1 },
        { text: "P8-T1: Veo lo que está mal.", type: 1 },
        { text: "P9-T1: Sigo las reglas.", type: 1 },
        { text: "P10-T1: Busco la corrección.", type: 1 },
        { text: "P11-T1: Me frustra la incompetencia.", type: 1 },
        { text: "P12-T1: Soy disciplinado.", type: 1 },
        { text: "P13-T1: Me importa la ética.", type: 1 },
        { text: "P14-T1: Intento ser un buen ejemplo.", type: 1 },
        { text: "P15-T1: Me tomo las cosas en serio.", type: 1 },
        // { text: "P16-T1: ...", type: 1 },
        // { text: "P17-T1: ...", type: 1 },
        // { text: "P18-T1: ...", type: 1 },
        // { text: "P19-T1: ...", type: 1 },
        // { text: "P20-T1: ...", type: 1 },


        // Tipo 2 (Ejemplo)
        { text: "P1-T2: A menudo pongo las necesidades de los demás antes que las mías.", type: 2 },
        { text: "P2-T2: Me siento bien cuando puedo ayudar.", type: 2 },
        { text: "P3-T2: Empatizo fácilmente.", type: 2 },
        { text: "P4-T2: Me cuesta decir 'no'.", type: 2 },
        { text: "P5-T2: Busco cercanía.", type: 2 },
        { text: "P6-T2: Me adapto para agradar.", type: 2 },
        { text: "P7-T2: Soy cálido y generoso.", type: 2 },
        { text: "P8-T2: Necesito sentirme querido.", type: 2 },
        { text: "P9-T2: Me ofrezco voluntariamente.", type: 2 },
        { text: "P10-T2: Anticipo las necesidades ajenas.", type: 2 },
        { text: "P11-T2: A veces me siento poco apreciado.", type: 2 },
        { text: "P12-T2: Me gusta dar consejos.", type: 2 },
        { text: "P13-T2: Soy muy sociable.", type: 2 },
        { text: "P14-T2: Me involucro en la vida de otros.", type: 2 },
        { text: "P15-T2: La gratitud me motiva.", type: 2 },
        // ... (continuar hasta 20 por tipo)

        // Tipo 3 ... (20 preguntas)
        { text: "P1-T3: Me motiva el éxito.", type: 3 }, { text: "P2-T3: Presento imagen exitosa.", type: 3 }, { text: "P3-T3: Trabajo duro por mis metas.", type: 3 }, { text: "P4-T3: Eficiencia es clave.", type: 3 }, { text: "P5-T3: Me importa la percepción ajena.", type: 3 }, { text: "P6-T3: Soy competitivo.", type: 3 }, { text: "P7-T3: Disfruto ser admirado.", type: 3 },{ text: "P8-T3: ...", type: 3 }, { text: "P9-T3: ...", type: 3 }, { text: "P10-T3: ...", type: 3 }, { text: "P11-T3: ...", type: 3 }, { text: "P12-T3: ...", type: 3 }, { text: "P13-T3: ...", type: 3 }, { text: "P14-T3: ...", type: 3 }, { text: "P15-T3: ...", type: 3 },
        // Tipo 4 ... (20 preguntas)
        { text: "P1-T4: Me siento diferente.", type: 4 }, { text: "P2-T4: Emociones intensas.", type: 4 }, { text: "P3-T4: Busco autenticidad.", type: 4 }, { text: "P4-T4: A menudo incomprendido.", type: 4 }, { text: "P5-T4: La belleza me importa.", type: 4 }, { text: "P6-T4: Introspectivo, melancólico.", type: 4 }, { text: "P7-T4: Anhelo conexiones profundas.", type: 4 },{ text: "P8-T4: ...", type: 4 }, { text: "P9-T4: ...", type: 4 }, { text: "P10-T4: ...", type: 4 }, { text: "P11-T4: ...", type: 4 }, { text: "P12-T4: ...", type: 4 }, { text: "P13-T4: ...", type: 4 }, { text: "P14-T4: ...", type: 4 }, { text: "P15-T4: ...", type: 4 },
        // Tipo 5 ... (20 preguntas)
        { text: "P1-T5: Valoro independencia.", type: 5 }, { text: "P2-T5: Adquiero conocimiento.", type: 5 }, { text: "P3-T5: Observo antes de actuar.", type: 5 }, { text: "P4-T5: Cómodo solo.", type: 5 }, { text: "P5-T5: Reservado, distante.", type: 5 }, { text: "P6-T5: Necesito recargarme.", type: 5 }, { text: "P7-T5: Competente al dominar tema.", type: 5 },{ text: "P8-T5: ...", type: 5 }, { text: "P9-T5: ...", type: 5 }, { text: "P10-T5: ...", type: 5 }, { text: "P11-T5: ...", type: 5 }, { text: "P12-T5: ...", type: 5 }, { text: "P13-T5: ...", type: 5 }, { text: "P14-T5: ...", type: 5 }, { text: "P15-T5: ...", type: 5 },
        // Tipo 6 ... (20 preguntas)
        { text: "P1-T6: Busco seguridad.", type: 6 }, { text: "P2-T6: Anticipo problemas.", type: 6 }, { text: "P3-T6: Lealtad es crucial.", type: 6 }, { text: "P4-T6: Ansioso, dudo.", type: 6 }, { text: "P5-T6: Valoro confianza.", type: 6 }, { text: "P6-T6: Cuestiono autoridad.", type: 6 }, { text: "P7-T6: Me gusta tener un plan.", type: 6 },{ text: "P8-T6: ...", type: 6 }, { text: "P9-T6: ...", type: 6 }, { text: "P10-T6: ...", type: 6 }, { text: "P11-T6: ...", type: 6 }, { text: "P12-T6: ...", type: 6 }, { text: "P13-T6: ...", type: 6 }, { text: "P14-T6: ...", type: 6 }, { text: "P15-T6: ...", type: 6 },
        // Tipo 7 ... (20 preguntas)
        { text: "P1-T7: Busco nuevas experiencias.", type: 7 }, { text: "P2-T7: Optimista.", type: 7 }, { text: "P3-T7: Evito dolor.", type: 7 }, { text: "P4-T7: Entusiasmado por futuro.", type: 7 }, { text: "P5-T7: Muchas ideas/proyectos.", type: 7 }, { text: "P6-T7: Disfruto diversión.", type: 7 }, { text: "P7-T7: Me cuesta comprometerme.", type: 7 },{ text: "P8-T7: ...", type: 7 }, { text: "P9-T7: ...", type: 7 }, { text: "P10-T7: ...", type: 7 }, { text: "P11-T7: ...", type: 7 }, { text: "P12-T7: ...", type: 7 }, { text: "P13-T7: ...", type: 7 }, { text: "P14-T7: ...", type: 7 }, { text: "P15-T7: ...", type: 7 },
        // Tipo 8 ... (20 preguntas)
        { text: "P1-T8: Directo, asertivo.", type: 8 }, { text: "P2-T8: Protejo a débiles.", type: 8 }, { text: "P3-T8: Valoro fuerza.", type: 8 }, { text: "P4-T8: Me gusta el control.", type: 8 }, { text: "P5-T8: Intimidante, dominante.", type: 8 }, { text: "P6-T8: Disgusta debilidad.", type: 8 }, { text: "P7-T8: Tomo decisiones rápido.", type: 8 },{ text: "P8-T8: ...", type: 8 }, { text: "P9-T8: ...", type: 8 }, { text: "P10-T8: ...", type: 8 }, { text: "P11-T8: ...", type: 8 }, { text: "P12-T8: ...", type: 8 }, { text: "P13-T8: ...", type: 8 }, { text: "P14-T8: ...", type: 8 }, { text: "P15-T8: ...", type: 8 },
        // Tipo 9 ... (20 preguntas)
        { text: "P1-T9: Busco armonía.", type: 9 }, { text: "P2-T9: Medio fácilmente.", type: 9 }, { text: "P3-T9: Valoro paz.", type: 9 }, { text: "P4-T9: Cuesta identificar mis necesidades.", type: 9 }, { text: "P5-T9: Complaciente.", type: 9 }, { text: "P6-T9: Cómodo en ambiente relajado.", type: 9 }, { text: "P7-T9: Procrastino.", type: 9 },{ text: "P8-T9: ...", type: 9 }, { text: "P9-T9: ...", type: 9 }, { text: "P10-T9: ...", type: 9 }, { text: "P11-T9: ...", type: 9 }, { text: "P12-T9: ...", type: 9 }, { text: "P13-T9: ...", type: 9 }, { text: "P14-T9: ...", type: 9 }, { text: "P15-T9: ...", type: 9 },
    ];
    // Asegúrate de tener 20 preguntas por cada uno de los 9 tipos (total 180)

    const typeColors = ['#FFC3A0', '#FF6B6B', '#D2691E', '#6A0DAD', '#C3B1E1', '#5F9EA0', '#ADD8E6', '#90EE90', '#FFB6C1'];
    const typeLabels = Array.from({ length: numTypes }, (_, i) => `Tipo ${i + 1}`);

    let currentPage = 1;
    const questionsPerPage = 15; // O 20 si prefieres menos páginas con 180 preguntas
    let shuffledQuestions = [];
    let userResponses = [];

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button'; prevBtn.id = 'prev-btn'; prevBtn.textContent = 'Anterior';
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button'; nextBtn.id = 'next-btn'; nextBtn.textContent = 'Siguiente';

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function initializeQuiz() {
        if (!quizContainer || !submitBtn || !paginationControlsDiv || !quizForm) {
            console.error("Faltan elementos esenciales del quiz en el DOM.");
            return;
        }
        
        // Inicializar preguntas y respuestas
        shuffledQuestions = [...allQuestionsData];
        shuffleArray(shuffledQuestions);
        userResponses = Array(shuffledQuestions.length).fill(null);
        
        // Mostrar el formulario y ocultar el botón de inicio
        if (quizForm && startTestContainer) {
            quizForm.style.display = 'block';
            startTestContainer.style.display = 'none';
        }
        
        // Configurar controles de paginación
        if (paginationControlsDiv) {
            paginationControlsDiv.innerHTML = '';
            paginationControlsDiv.appendChild(prevBtn);
            paginationControlsDiv.appendChild(nextBtn);
            paginationControlsDiv.style.display = 'block';
        }
        
        // Configurar botones de navegación
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCurrentPage();
                updatePaginationButtons();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (!areCurrentPageQuestionsAnswered()) {
                showAlert('Por favor, responde todas las preguntas de esta página antes de continuar.');
                return;
            }
            
            const totalPages = Math.ceil(shuffledQuestions.length / questionsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderCurrentPage();
                updatePaginationButtons();
            }
        });
        
        // Renderizar primera página y actualizar botones
        renderCurrentPage();
        updatePaginationButtons();
    }

    function renderCurrentPage() {
        if (!quizContainer) return;
        quizContainer.innerHTML = '';
        
        const startIdx = (currentPage - 1) * questionsPerPage;
        const endIdx = Math.min(startIdx + questionsPerPage, shuffledQuestions.length);
        
        for (let i = startIdx; i < endIdx; i++) {
            const question = shuffledQuestions[i];
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            questionDiv.id = `question-global-${i}`;
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = question.text;
            questionDiv.appendChild(questionText);
            
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            
            for (let value = 1; value <= 5; value++) {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `question-${i}`;
                input.value = value;
                
                if (userResponses[i] === value) {
                    input.checked = true;
                }
                
                input.addEventListener('change', () => {
                    userResponses[i] = parseInt(input.value);
                    questionDiv.style.borderColor = '#e0e0e0';
                    hideAlert();
                    updateSubmitButtonVisibility();
                });
                
                const span = document.createElement('span');
                span.textContent = value;
                
                label.appendChild(input);
                label.appendChild(span);
                optionsDiv.appendChild(label);
            }
            
            questionDiv.appendChild(optionsDiv);
            quizContainer.appendChild(questionDiv);
        }
    }

    function updatePaginationButtons() {
        if (!prevBtn || !nextBtn || !submitBtn) return;
        
        const totalPages = Math.ceil(shuffledQuestions.length / questionsPerPage);
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        
        if (currentPage === totalPages) {
            submitBtn.style.display = 'block';
        } else {
            submitBtn.style.display = 'none';
        }
    }

    function areCurrentPageQuestionsAnswered() {
        const startIdx = (currentPage - 1) * questionsPerPage;
        const endIdx = Math.min(startIdx + questionsPerPage, shuffledQuestions.length);
        
        for (let i = startIdx; i < endIdx; i++) {
            if (userResponses[i] === null) {
                const questionDiv = wrapper.querySelector(`#question-global-${i}`);
                if (questionDiv) {
                    questionDiv.style.borderColor = 'red';
                    questionDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return false;
            }
        }
        return true;
    }

    function updateSubmitButtonVisibility() {
        if (!submitBtn) return;
        
        const allAnswered = userResponses.every(response => response !== null);
        if (allAnswered && currentPage === Math.ceil(shuffledQuestions.length / questionsPerPage)) {
            submitBtn.style.display = 'block';
        }
    }

    function calculateScores() {
        if (userResponses.length !== shuffledQuestions.length) {
            console.error(`Longitud de respuestas (${userResponses.length}) no coincide con preguntas (${shuffledQuestions.length})`);
            showAlert('Error al procesar respuestas. Intenta recargar la página.');
            return null;
        }
        for (let i = 0; i < userResponses.length; i++) {
            if (userResponses[i] === null) {
                const pageOfMissingQuestion = Math.floor(i / questionsPerPage) + 1;
                currentPage = pageOfMissingQuestion;
                renderCurrentPage();
                updatePaginationButtons();
                 setTimeout(() => {
                    const missingQuestionDiv = wrapper.querySelector(`#question-global-${i}`);
                    if(missingQuestionDiv) {
                        missingQuestionDiv.style.borderColor = 'red';
                        missingQuestionDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    showAlert('Aún faltan preguntas por responder. Por favor, completa todas.');
                }, 100);
                return null;
            }
        }
        hideAlert();

        const scores = Array(numTypes).fill(0);
        userResponses.forEach((responseValue, globalIndex) => {
            if (shuffledQuestions[globalIndex] && typeof shuffledQuestions[globalIndex].type !== 'undefined') {
                const originalType = shuffledQuestions[globalIndex].type;
                scores[originalType - 1] += responseValue;
            } else {
                console.error(`Pregunta indefinida o sin tipo en el índice global ${globalIndex}`);
            }
        });
        return scores;
    }

    function displayResults(scores) {
        if (!resultsTextDiv || !resultsContainer || !paginationControlsDiv || !submitBtn || !quizForm) return;
        resultsTextDiv.innerHTML = '';
        scores.forEach((score, index) => {
            resultsTextDiv.innerHTML += `<p>Puntaje del <strong>Tipo ${index + 1}</strong>: ${score}</p>`;
        });
        resultsContainer.style.display = 'block';
        drawChart(scores);
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
        paginationControlsDiv.style.display = 'none';
        submitBtn.style.display = 'none';
        quizForm.style.display = 'none';
    }

    function drawChart(scores) {
        const chartCanvas = wrapper.querySelector('#results-chart');
        if (!chartCanvas) return;
        const chartCtx = chartCanvas.getContext('2d');
        if (resultsChart) resultsChart.destroy();

        let questionsPerType = 0;
        if (shuffledQuestions.length > 0) {
             questionsPerType = shuffledQuestions.filter(q => q.type === 1).length;
        }
        const maxScorePerType = questionsPerType * 5;

        // Configuración del gráfico circular (PolarArea)
        resultsChart = new Chart(chartCtx, {
            type: 'polarArea',  // Tipo de gráfico circular
            data: {
                labels: typeLabels,
                datasets: [{
                    label: 'Puntajes por Tipo',
                    data: scores,
                    backgroundColor: typeColors,
                    borderColor: '#FFFFFF',
                    borderWidth: 1,
                    borderAlign: 'center'  // Alinea los bordes al centro para evitar sobreposiciones
                }]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                scales: { 
                    r: { 
                        beginAtZero: true, 
                        suggestedMax: maxScorePerType > 0 ? maxScorePerType : 100,
                        pointLabels: { 
                            display: true, 
                            centerPointLabels: true, 
                            font: { size: 14, weight: 'bold' } 
                        },
                        ticks: { 
                            display: false  // Oculta las marcas de escala para un aspecto más limpio
                        },
                        grid: {
                            circular: true  // Asegura que la cuadrícula sea circular
                        }
                    } 
                },
                plugins: { 
                    legend: { 
                        position: 'bottom',  // Coloca la leyenda debajo del gráfico
                        labels: { 
                            font: { size: 13 } 
                        } 
                    }, 
                    tooltip: { 
                        callbacks: { 
                            label: function(context) { 
                                let label = context.label || ''; 
                                if (label) { 
                                    label += ': '; 
                                } 
                                if (context.parsed.r !== null) { 
                                    label += context.parsed.r; 
                                } 
                                return label; 
                            } 
                        } 
                    } 
                },
                layout: {
                    padding: 20  // Añade espacio alrededor del gráfico
                },
                elements: {
                    arc: {
                        borderWidth: 1,
                        borderColor: '#FFFFFF'
                    }
                }
            }
        });
    }

    function showAlert(message) {
        if (!alertMessageDiv) return;
        alertMessageDiv.textContent = message;
        alertMessageDiv.style.display = 'block';
        alertMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function hideAlert() {
        if (!alertMessageDiv) return;
        alertMessageDiv.style.display = 'none';
    }

    if (startTestBtn) {
        startTestBtn.addEventListener('click', () => {
            initializeQuiz();
        });
    } else {
        console.warn("Botón 'start-test-btn' no encontrado. El test no se iniciará automáticamente.");
        // No inicializar el quiz si no hay botón de inicio.
    }

    if (quizForm) {
        quizForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!areCurrentPageQuestionsAnswered()) return;
            const scores = calculateScores();
            if (scores) {
                displayResults(scores);
            }
        });
    } else {
        console.error("Elemento quizForm no encontrado.");
    }
});
