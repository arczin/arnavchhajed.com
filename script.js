document.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('character');

    const sprites = {
        idle: ['sprites/idle-frame-1.png', 'sprites/idle-frame-2.png'],
        walkAhead: ['sprites/walk-ahead-left.png', 'sprites/walk-ahead-right.png'],
        walkBack: ['sprites/walk-back-left.png', 'sprites/walk-back-right.png']
    };

    let charX = window.innerWidth / 2;
    let charY = window.innerHeight / 2;
    let mouseX = charX;
    let mouseY = charY;
    let currentState = 'idle';
    let frameIndex = 0;
    let animationCounter = 0;
    let facingRight = true;

    const moveSpeed = 3;
    const stopDistance = 100;
    const frameDelay = 8;

    character.style.backgroundImage = `url('${sprites.idle[0]}')`;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateCharacter() {
        const dx = mouseX - charX;
        const dy = mouseY - charY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > stopDistance) {
            const isMovingRight = dx > 0;
            facingRight = isMovingRight;

            if (Math.abs(dy) > Math.abs(dx) * 0.3) {
                currentState = dy > 0 ? 'walkAhead' : 'walkBack';
            } else {
                currentState = 'walkAhead';
            }

            const moveX = (dx / distance) * moveSpeed;
            const moveY = (dy / distance) * moveSpeed;
            charX += moveX;
            charY += moveY;

            animationCounter++;
            if (animationCounter >= frameDelay) {
                frameIndex = (frameIndex + 1) % 2;
                animationCounter = 0;
            }
        } else {
            currentState = 'idle';

            animationCounter++;
            if (animationCounter >= frameDelay * 2) {
                frameIndex = (frameIndex + 1) % 2;
                animationCounter = 0;
            }
        }

        const spriteArray = sprites[currentState];
        character.style.backgroundImage = `url('${spriteArray[frameIndex]}')`;

        character.style.left = `${charX - 74}px`;
        character.style.top = `${charY - 74}px`;
        character.style.transform = facingRight ? 'scaleX(1)' : 'scaleX(-1)';

        requestAnimationFrame(updateCharacter);
    }

    updateCharacter();

    const disableBtn = document.getElementById('disable-follow-btn');
    const disableBtn2 = document.getElementById('disable-follow-btn-2');
    let followEnabled = false;

    function toggleFollow() {
        followEnabled = !followEnabled;

        if (!followEnabled) {
            character.style.opacity = '0';
            disableBtn.textContent = 'CLICK HERE FOR SOMETHING COOL!';
            disableBtn.classList.add('disabled');
            if (disableBtn2) {
                disableBtn2.textContent = 'CLICK HERE FOR SOMETHING COOL!';
                disableBtn2.classList.add('disabled');
            }
        } else {
            character.style.opacity = '1';
            disableBtn.textContent = 'DISABLE COOL THING';
            disableBtn.classList.remove('disabled');
            if (disableBtn2) {
                disableBtn2.textContent = 'DISABLE COOL THING';
                disableBtn2.classList.remove('disabled');
            }
        }
    }

    disableBtn.addEventListener('click', toggleFollow);
    if (disableBtn2) {
        disableBtn2.addEventListener('click', toggleFollow);
    }

    const potatoContainer = document.querySelector('.potato-container');
    const knife = document.getElementById('knife');
    const potato = document.getElementById('potato');
    const potatoWrapper = document.getElementById('potato-wrapper');

    let isDragging = false;
    let startY = 0;
    let initialKnifeTop = 20;
    let knifeY = initialKnifeTop;
    let isChopped = false;

    knife.addEventListener('mousedown', startDrag);
    knife.addEventListener('touchstart', startDrag, { passive: false });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function startDrag(e) {
        if (isChopped) return;
        isDragging = true;
        startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        knife.style.transition = 'none';
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        const deltaY = currentY - startY;

        let newTop = initialKnifeTop + deltaY;
        if (newTop < initialKnifeTop) newTop = initialKnifeTop;
        if (newTop > 120) newTop = 120;

        knife.style.top = `${newTop}px`;

        if (newTop > 100 && !isChopped) {
            chopPotato();
        }
    }

    function endDrag() {
        isDragging = false;
        knife.style.transition = 'top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        knife.style.top = `${initialKnifeTop}px`;
    }

    function chopPotato() {
        isChopped = true;
        playChopSound();

        potato.src = 'sprites/potato-chopped.png';

        setTimeout(() => {
            potatoWrapper.classList.add('potato-slide-out');
        }, 200);

        setTimeout(() => {
            potatoWrapper.classList.remove('potato-slide-out');
            potatoWrapper.style.opacity = '0';
            potato.src = 'sprites/potato.png';

            void potatoWrapper.offsetWidth;

            potatoWrapper.style.opacity = '1';
            potatoWrapper.classList.add('potato-slide-in');

            setTimeout(() => {
                potatoWrapper.classList.remove('potato-slide-in');
                isChopped = false;
            }, 500);
        }, 800);
    }

    function playChopSound() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();

        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    }
    const projectModal = document.getElementById('project-modal');
    const pastProjectsModal = document.getElementById('past-projects-modal');
    const achievementsModal = document.getElementById('achievements-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const closeButtons = document.querySelectorAll('.close-modal');
    const pastProjectsBtn = document.getElementById('past-projects-btn');
    const achievementsBtn = document.getElementById('achievements-btn');

    const projects = {
        'founder': {
            title: 'FOUNDER',
            desc: "Founded NPO, built and led hackathon and tech event series; 1000+ students reached (got huge positive feedback); brought 10+ sponsors for ~$15k in prizes; engaged speakers from YC, IEEE, Harvard etc"
        },
        'llm-scratch': {
            title: 'LLM FROM SCRATCH',
            desc: 'A deep dive into building Large Language Models from the ground up. This project follows the Stanford CS336 course curriculum, implementing transformer architectures, attention mechanisms, and optimization algorithms in PyTorch. The goal is to understand the mathematical foundations and engineering challenges of modern AI.'
        },
        'research': {
            title: 'CREATIVITY RESEARCH',
            desc: 'Investigating combinatorial algorithms to enhance creativity in LLMs. This research focuses on moving beyond next-token prediction to generate novel and useful ideas. Currently developing a "Phase 1" algorithm that acts as a general-purpose creative wrapper for existing models.'
        },
        'parkinsons-detector': {
            title: 'Parkinsons Detector',
            desc: 'Motivated by family history, an early-screening parkinsons detection model using vocal/ acoustic markers for low - cost preclinical triage for Parkinsons disease. Testing multiple methodologies & creating a novel one to identify optimal approach for real - world deployment.'
        },
        'transient-detector': {
            title: 'Astrophysical Transients Detector',
            desc: "Focused on the Vera C. Rubin Observatory's Large Synoptic Survey Telescope, which generates nearly 10 million nightly alerts from sky surveys. Traditional supervised ML methods are limited to pre-labeled classes, while this approach explores unsupervised AI/ML models to automatically detect anomalies and flag novel or rare astrophysical transients.",
        },
        'farmfriend': {
            title: 'FARMFRIEND',
            desc: "FarmFriend is a mobile app that uses LLMs and image detection to help farmers identify crop diseases and plan sustainable farming strategies. check the master branch for the code",
        },
        'pigeepost': {
            title: 'AI Intern @ Pigeepost',
            desc: "Designed Pigeepost’s first agentic pipeline for AI-assisted outreach; automated CRM/email workflows to reduce manual tasks."
        },
        'writing-ml': {
            title: 'Writing + Other ML models',
            desc: "Other ML models made during learning. Also attempting to write White Paper on ASI: Exploring multiple branching scenarios on how the emergence of superintelligence could impact the world - while getting to know more."
        },

    };

    function openProjectModal(projectId) {
        const project = projects[projectId];
        if (project) {
            modalTitle.textContent = project.title;
            modalDesc.textContent = project.desc;
            projectModal.classList.add('active');
        }
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card) {
            const projectId = card.getAttribute('data-id');
            if (projectId) {
                openProjectModal(projectId);
            }
        }
    });

    if (pastProjectsBtn) {
        pastProjectsBtn.addEventListener('click', () => {
            pastProjectsModal.classList.add('active');
        });
    }

    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', () => {
            achievementsModal.classList.add('active');
        });
    }

    const readingModal = document.getElementById('reading-modal');
    const readingBtn = document.getElementById('reading-btn');

    if (readingBtn) {
        readingBtn.addEventListener('click', () => {
            readingModal.classList.add('active');
        });
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            projectModal.classList.remove('active');
            pastProjectsModal.classList.remove('active');
            achievementsModal.classList.remove('active');
            if (readingModal) readingModal.classList.remove('active');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            projectModal.classList.remove('active');
        }
        if (e.target === pastProjectsModal) {
            pastProjectsModal.classList.remove('active');
        }
        if (e.target === achievementsModal) {
            achievementsModal.classList.remove('active');
        }
        if (e.target === readingModal) {
            readingModal.classList.remove('active');
        }
    });

    const canvas = document.getElementById('sketch-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const pencilBtn = document.getElementById('tool-pencil');
        const eraserBtn = document.getElementById('tool-eraser');
        const clearBtn = document.getElementById('tool-clear');

        const sizeSlider = document.getElementById('tool-size');
        let currentSize = 2;

        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let currentTool = 'pencil';

        pencilBtn.addEventListener('click', () => {
            currentTool = 'pencil';
            pencilBtn.classList.add('active');
            eraserBtn.classList.remove('active');
        });

        eraserBtn.addEventListener('click', () => {
            currentTool = 'eraser';
            eraserBtn.classList.add('active');
            pencilBtn.classList.remove('active');
        });

        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        sizeSlider.addEventListener('input', (e) => {
            currentSize = e.target.value;
        });

        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = getCoords(e);
        }

        function draw(e) {
            if (!isDrawing) return;
            e.preventDefault();

            const [x, y] = getCoords(e);

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);

            if (currentTool === 'pencil') {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = currentSize;
                ctx.globalCompositeOperation = 'source-over';
            } else {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = currentSize * 2;
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.stroke();
            [lastX, lastY] = [x, y];
        }

        function stopDrawing() {
            isDrawing = false;
        }

        function getCoords(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            return [clientX - rect.left, clientY - rect.top];
        }

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        const character = document.getElementById('character');
        canvas.addEventListener('mouseenter', () => {
            if (character) character.style.opacity = '0';
        });
        canvas.addEventListener('mouseleave', () => {
            if (followEnabled) {
                if (character) character.style.opacity = '1';
            }
        });
    }

    const cookingContainer = document.querySelector('.potato-container');
    if (cookingContainer) {
        cookingContainer.addEventListener('mouseenter', () => {
            if (character) character.style.opacity = '0';
        });
        cookingContainer.addEventListener('mouseleave', () => {
            if (followEnabled) {
                if (character) character.style.opacity = '1';
            }
        });
    }

    const revealBtn = document.querySelector('.reveal-btn');
    const drawingRefContainer = document.getElementById('drawing-ref-container');

    if (revealBtn && drawingRefContainer) {
        revealBtn.addEventListener('click', () => {
            drawingRefContainer.classList.add('revealed');
        });
    }
});
