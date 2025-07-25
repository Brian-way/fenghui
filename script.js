// Feng Shui Advisory App - JavaScript Logic
class FengShuiAdvisor {
    constructor() {
        this.form = document.getElementById('fengshuiForm');
        this.resultsContainer = document.getElementById('results');
        this.analysisContent = document.getElementById('analysisContent');
        this.newAnalysisBtn = document.getElementById('newAnalysis');
        
        // Photo upload elements
        this.photoUploadArea = document.getElementById('photoUploadArea');
        this.roomPhotoInput = document.getElementById('roomPhoto');
        this.photoPreview = document.getElementById('photoPreview');
        this.previewImage = document.getElementById('previewImage');
        this.removePhotoBtn = document.getElementById('removePhoto');
        this.photoAnalysisStatus = document.getElementById('photoAnalysisStatus');
        
        this.uploadedPhotoData = null;
        this.photoAnalysisResults = null;
        
        this.initializeEventListeners();
        this.initializePhotoUpload();
        this.initializeFengShuiData();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmission(e));
        this.newAnalysisBtn.addEventListener('click', () => this.resetForm());
    }

    initializePhotoUpload() {
        // Click to upload
        this.photoUploadArea.addEventListener('click', () => {
            this.roomPhotoInput.click();
        });

        // File input change
        this.roomPhotoInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files[0]);
        });

        // Drag and drop
        this.photoUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.photoUploadArea.classList.add('dragover');
        });

        this.photoUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.photoUploadArea.classList.remove('dragover');
        });

        this.photoUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.photoUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0]);
            }
        });

        // Remove photo
        this.removePhotoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removePhoto();
        });
    }

    handleFileSelection(file) {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (JPG, PNG, WebP)');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        // Display preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImage.src = e.target.result;
            this.uploadedPhotoData = e.target.result;
            this.showPhotoPreview();
            this.analyzePhoto(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    showPhotoPreview() {
        this.photoUploadArea.style.display = 'none';
        this.photoPreview.style.display = 'block';
        this.photoAnalysisStatus.style.display = 'flex';
        this.photoAnalysisStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Analyzing photo...</span>';
    }

    removePhoto() {
        this.photoUploadArea.style.display = 'block';
        this.photoPreview.style.display = 'none';
        this.roomPhotoInput.value = '';
        this.uploadedPhotoData = null;
        this.photoAnalysisResults = null;
    }

    analyzePhoto(imageData) {
        // Simulate photo analysis with setTimeout
        setTimeout(() => {
            this.photoAnalysisResults = this.performPhotoAnalysis(imageData);
            this.photoAnalysisStatus.className = 'photo-analysis-status complete';
            this.photoAnalysisStatus.innerHTML = '<i class="fas fa-check-circle"></i><span>Photo analysis complete!</span>';
        }, 2000);
    }

    performPhotoAnalysis(imageData) {
        // Create a canvas to analyze the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        return new Promise((resolve) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Analyze image data
                const imageDataArray = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const analysis = this.analyzeImageData(imageDataArray);
                resolve(analysis);
            };
            img.src = imageData;
        });
    }

    analyzeImageData(imageData) {
        const data = imageData.data;
        const pixelCount = data.length / 4;
        
        let totalR = 0, totalG = 0, totalB = 0;
        let brightness = 0;
        const colorDistribution = {
            red: 0, green: 0, blue: 0, yellow: 0, 
            brown: 0, white: 0, black: 0, gray: 0
        };
        
        // Analyze pixels
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            totalR += r;
            totalG += g;
            totalB += b;
            brightness += (r + g + b) / 3;
            
            // Categorize colors
            this.categorizePixelColor(r, g, b, colorDistribution);
        }
        
        const avgR = totalR / pixelCount;
        const avgG = totalG / pixelCount;
        const avgB = totalB / pixelCount;
        const avgBrightness = brightness / pixelCount;
        
        // Determine dominant colors
        const dominantColors = Object.entries(colorDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([color]) => color);
        
        return {
            averageColor: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
            brightness: Math.round(avgBrightness),
            dominantColors,
            colorDistribution,
            analysis: this.interpretPhotoAnalysis({
                avgBrightness,
                dominantColors,
                colorDistribution
            })
        };
    }

    categorizePixelColor(r, g, b, distribution) {
        const total = r + g + b;
        
        if (total < 60) {
            distribution.black++;
        } else if (total > 720) {
            distribution.white++;
        } else if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
            distribution.gray++;
        } else if (r > g && r > b) {
            if (g > 100) distribution.yellow++;
            else distribution.red++;
        } else if (g > r && g > b) {
            distribution.green++;
        } else if (b > r && b > g) {
            distribution.blue++;
        } else if (r > 100 && g > 50 && b < 50) {
            distribution.brown++;
        }
    }

    interpretPhotoAnalysis(data) {
        const insights = [];
        const suggestions = [];
        
        // Brightness analysis
        if (data.avgBrightness < 80) {
            insights.push('Room appears dimly lit');
            suggestions.push('Add more lighting or light-colored decor to brighten the space');
        } else if (data.avgBrightness > 200) {
            insights.push('Room has excellent natural lighting');
            suggestions.push('Great natural light! Use warm accents to balance the brightness');
        } else {
            insights.push('Room has balanced lighting');
        }
        
        // Color analysis
        const primaryColor = data.dominantColors[0];
        switch (primaryColor) {
            case 'blue':
                insights.push('Cool blue tones detected - promotes calm and water element');
                suggestions.push('Excellent for meditation and focus areas');
                break;
            case 'green':
                insights.push('Natural green tones detected - strong wood element presence');
                suggestions.push('Perfect for growth and health energy');
                break;
            case 'red':
                insights.push('Warm red tones detected - active fire element');
                suggestions.push('Great for social areas, but balance with cooler tones in bedrooms');
                break;
            case 'yellow':
                insights.push('Sunny yellow tones detected - earth element energy');
                suggestions.push('Excellent for dining areas and social spaces');
                break;
            case 'brown':
                insights.push('Earth tones detected - grounding and stability');
                suggestions.push('Add colorful accents to prevent energy stagnation');
                break;
            case 'white':
                insights.push('Clean white tones detected - metal element clarity');
                suggestions.push('Add warm accents to create coziness');
                break;
            case 'gray':
                insights.push('Neutral gray tones detected - balanced but may lack energy');
                suggestions.push('Add vibrant colors to energize the space');
                break;
            case 'black':
                insights.push('Dark tones detected - may absorb too much energy');
                suggestions.push('Add light colors and reflective surfaces to balance');
                break;
        }
        
        return { insights, suggestions };
    }

    async integratePhotoAnalysis(photoResults, analysis) {
        // Wait for photo analysis to complete if it's still processing
        let results = photoResults;
        if (photoResults instanceof Promise) {
            results = await photoResults;
        }

        if (results && results.analysis) {
            // Add photo insights to suggestions
            results.analysis.insights.forEach(insight => {
                analysis.suggestions.push(`📸 Photo Analysis: ${insight}`);
            });

            results.analysis.suggestions.forEach(suggestion => {
                analysis.suggestions.push(`📸 Photo Recommendation: ${suggestion}`);
            });

            // Adjust score based on photo analysis
            if (results.brightness > 150) {
                analysis.overallScore += 10; // Good lighting bonus
            } else if (results.brightness < 80) {
                analysis.overallScore -= 5; // Poor lighting penalty
            }

            // Color harmony bonus
            const dominantPhotoColor = results.dominantColors[0];
            const selectedColor = document.querySelector('input[name="dominantColor"]:checked')?.value;
            
            if (dominantPhotoColor === selectedColor) {
                analysis.suggestions.push('📸 Photo confirms your color selection - excellent consistency!');
                analysis.overallScore += 15;
            } else if (selectedColor) {
                analysis.suggestions.push(`📸 Photo shows ${dominantPhotoColor} tones, which differs from your selected ${selectedColor} - consider this for color harmony.`);
            }
        }
    }

    initializeFengShuiData() {
        // Five Elements Theory
        this.elements = {
            wood: {
                colors: ['green', 'brown'],
                directions: ['east', 'southeast'],
                characteristics: 'Growth, creativity, flexibility',
                enhancement: 'Plants, wooden furniture, rectangular shapes',
                weakening: 'Metal elements, too much red'
            },
            fire: {
                colors: ['red', 'orange', 'pink', 'yellow'],
                directions: ['south'],
                characteristics: 'Energy, passion, recognition',
                enhancement: 'Candles, triangular shapes, bright lighting',
                weakening: 'Water elements, too much blue/black'
            },
            earth: {
                colors: ['yellow', 'brown', 'beige'],
                directions: ['center', 'southwest', 'northeast'],
                characteristics: 'Stability, grounding, support',
                enhancement: 'Crystals, square shapes, earth tones',
                weakening: 'Wood elements, too much green'
            },
            metal: {
                colors: ['white', 'gray', 'silver'],
                directions: ['west', 'northwest'],
                characteristics: 'Precision, efficiency, clarity',
                enhancement: 'Metal objects, round shapes, white colors',
                weakening: 'Fire elements, too much red'
            },
            water: {
                colors: ['blue', 'black', 'dark blue'],
                directions: ['north'],
                characteristics: 'Flow, wisdom, career success',
                enhancement: 'Water features, flowing shapes, mirrors',
                weakening: 'Earth elements, too much yellow/brown'
            }
        };

        // Bagua Map Areas
        this.baguaAreas = {
            north: { element: 'water', aspect: 'Career & Life Path', colors: ['blue', 'black'] },
            northeast: { element: 'earth', aspect: 'Knowledge & Self-Cultivation', colors: ['yellow', 'brown'] },
            east: { element: 'wood', aspect: 'Health & Family', colors: ['green', 'brown'] },
            southeast: { element: 'wood', aspect: 'Wealth & Prosperity', colors: ['green', 'purple'] },
            south: { element: 'fire', aspect: 'Fame & Reputation', colors: ['red', 'orange'] },
            southwest: { element: 'earth', aspect: 'Love & Marriage', colors: ['pink', 'red'] },
            west: { element: 'metal', aspect: 'Children & Creativity', colors: ['white', 'silver'] },
            northwest: { element: 'metal', aspect: 'Helpful People & Travel', colors: ['gray', 'white'] }
        };

        // Room-specific guidelines
        this.roomGuidelines = {
            bedroom: {
                idealDirections: ['southwest', 'west', 'northwest'],
                avoidDirections: ['north'],
                idealColors: ['earth tones', 'soft pastels', 'warm colors'],
                avoidColors: ['bright red', 'electric blue'],
                essentialElements: ['earth', 'metal'],
                tips: ['Position bed away from door', 'Avoid mirrors facing bed', 'Keep electronics minimal']
            },
            living: {
                idealDirections: ['south', 'southeast', 'east'],
                avoidDirections: [],
                idealColors: ['warm yellows', 'earth tones', 'balanced colors'],
                avoidColors: ['overwhelming dark colors'],
                essentialElements: ['fire', 'earth', 'wood'],
                tips: ['Central focal point', 'Good lighting', 'Comfortable seating arrangement']
            },
            kitchen: {
                idealDirections: ['east', 'southeast', 'south'],
                avoidDirections: ['northwest'],
                idealColors: ['earth tones', 'warm colors'],
                avoidColors: ['blue', 'black'],
                essentialElements: ['fire', 'earth'],
                tips: ['Keep stove and sink separated', 'Good ventilation', 'Organized storage']
            },
            office: {
                idealDirections: ['north', 'east', 'southeast'],
                avoidDirections: [],
                idealColors: ['blue', 'green', 'earth tones'],
                avoidColors: ['overwhelming red'],
                essentialElements: ['water', 'wood', 'earth'],
                tips: ['Desk facing door', 'Good lighting', 'Organized workspace']
            },
            bathroom: {
                idealDirections: ['north', 'east'],
                avoidDirections: ['center', 'southeast'],
                idealColors: ['white', 'light blue', 'earth tones'],
                avoidColors: ['dark colors'],
                essentialElements: ['metal', 'water'],
                tips: ['Keep door closed', 'Good ventilation', 'Live plants if possible']
            },
            dining: {
                idealDirections: ['east', 'southeast', 'south'],
                avoidDirections: [],
                idealColors: ['warm earth tones', 'appetite-enhancing colors'],
                avoidColors: ['blue', 'black'],
                essentialElements: ['earth', 'fire'],
                tips: ['Round or square table', 'Adequate lighting', 'Pleasant atmosphere']
            },
            entryway: {
                idealDirections: ['depends on house orientation'],
                avoidDirections: [],
                idealColors: ['welcoming warm colors'],
                avoidColors: ['overwhelming dark colors'],
                essentialElements: ['depends on direction'],
                tips: ['Keep clutter-free', 'Good lighting', 'Welcoming energy']
            }
        };
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const formData = this.collectFormData();
        const analysis = this.analyzeSpace(formData);
        this.displayResults(analysis);
        
        // Smooth scroll to results
        this.resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Basic form data
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Collect checkbox data
        data.naturalLight = Array.from(document.querySelectorAll('input[value*="window"]:checked'))
            .map(cb => cb.value);
        data.elements = Array.from(document.querySelectorAll('input[value]:checked'))
            .filter(cb => !cb.value.includes('window'))
            .map(cb => cb.value);
        
        // Additional form fields
        data.roomType = document.getElementById('roomType').value;
        data.roomSize = parseInt(document.getElementById('roomSize').value) || 100;
        data.facingDirection = document.getElementById('facingDirection').value;
        data.floorLevel = document.getElementById('floorLevel').value;
        data.doorPosition = document.getElementById('doorPosition').value;
        data.windowCount = parseInt(document.getElementById('windowCount').value) || 1;
        data.birthYear = parseInt(document.getElementById('birthYear').value);
        data.purpose = document.getElementById('purpose').value;
        
        return data;
    }

    analyzeSpace(data) {
        const analysis = {
            overallScore: 0,
            issues: [],
            suggestions: [],
            elements: {},
            personalizedAdvice: []
        };

        // Analyze based on room type and direction
        this.analyzeRoomDirection(data, analysis);
        
        // Analyze color harmony
        this.analyzeColorHarmony(data, analysis);
        
        // Analyze elements balance
        this.analyzeElementsBalance(data, analysis);
        
        // Analyze natural light
        this.analyzeNaturalLight(data, analysis);
        
        // Analyze space configuration
        this.analyzeSpaceConfiguration(data, analysis);
        
        // Personal element analysis
        if (data.birthYear) {
            this.analyzePersonalElement(data, analysis);
        }
        
        // Purpose-specific advice
        this.analyzePurpose(data, analysis);
        
        // Photo analysis integration
        if (this.photoAnalysisResults) {
            this.integratePhotoAnalysis(this.photoAnalysisResults, analysis);
        }
        
        // Calculate overall score
        this.calculateOverallScore(analysis);
        
        return analysis;
    }

    analyzeRoomDirection(data, analysis) {
        const roomGuideline = this.roomGuidelines[data.roomType];
        const baguaArea = this.baguaAreas[data.facingDirection];
        
        if (roomGuideline) {
            if (roomGuideline.idealDirections.includes(data.facingDirection)) {
                analysis.suggestions.push(`Excellent direction choice! ${data.facingDirection.charAt(0).toUpperCase() + data.facingDirection.slice(1)} is ideal for a ${data.roomType}.`);
                analysis.overallScore += 20;
            } else if (roomGuideline.avoidDirections.includes(data.facingDirection)) {
                analysis.issues.push(`${data.facingDirection.charAt(0).toUpperCase() + data.facingDirection.slice(1)} direction may create challenges for a ${data.roomType}.`);
                analysis.suggestions.push(`Consider enhancing with ${baguaArea.element} element to counterbalance directional challenges.`);
                analysis.overallScore -= 10;
            } else {
                analysis.suggestions.push(`${data.facingDirection.charAt(0).toUpperCase() + data.facingDirection.slice(1)} direction is neutral for your ${data.roomType}.`);
                analysis.overallScore += 10;
            }
        }

        if (baguaArea) {
            analysis.elements[baguaArea.element] = {
                reason: `${data.facingDirection.charAt(0).toUpperCase() + data.facingDirection.slice(1)} corresponds to ${baguaArea.aspect}`,
                enhancement: this.elements[baguaArea.element].enhancement
            };
        }
    }

    analyzeColorHarmony(data, analysis) {
        const dominantColor = data.dominantColor;
        if (!dominantColor) {
            analysis.issues.push('No dominant color selected - color harmony is important for energy flow.');
            return;
        }

        const roomGuideline = this.roomGuidelines[data.roomType];
        const baguaArea = this.baguaAreas[data.facingDirection];
        
        // Check if color matches room type
        let colorMatch = false;
        if (roomGuideline) {
            for (let idealColor of roomGuideline.idealColors) {
                if (idealColor.includes(dominantColor) || dominantColor === 'white' || dominantColor === 'gray') {
                    colorMatch = true;
                    break;
                }
            }
            
            if (colorMatch) {
                analysis.suggestions.push(`${dominantColor.charAt(0).toUpperCase() + dominantColor.slice(1)} is a harmonious color choice for your ${data.roomType}.`);
                analysis.overallScore += 15;
            } else {
                for (let avoidColor of roomGuideline.avoidColors) {
                    if (avoidColor.includes(dominantColor)) {
                        analysis.issues.push(`${dominantColor.charAt(0).toUpperCase() + dominantColor.slice(1)} may be too stimulating for a ${data.roomType}.`);
                        analysis.overallScore -= 5;
                        break;
                    }
                }
            }
        }

        // Check if color matches bagua area
        if (baguaArea && baguaArea.colors.includes(dominantColor)) {
            analysis.suggestions.push(`${dominantColor.charAt(0).toUpperCase() + dominantColor.slice(1)} supports the ${baguaArea.aspect} energy of this direction.`);
            analysis.overallScore += 10;
        }

        // Element-color correspondence
        for (let [elementName, element] of Object.entries(this.elements)) {
            if (element.colors.includes(dominantColor)) {
                analysis.elements[elementName] = analysis.elements[elementName] || {};
                analysis.elements[elementName].colorSupport = true;
                analysis.elements[elementName].reason = `${dominantColor.charAt(0).toUpperCase() + dominantColor.slice(1)} color enhances ${elementName} element`;
                break;
            }
        }
    }

    analyzeElementsBalance(data, analysis) {
        const currentElements = data.elements || [];
        const elementCount = {};
        
        // Count current elements
        currentElements.forEach(element => {
            elementCount[element] = (elementCount[element] || 0) + 1;
        });
        
        const roomGuideline = this.roomGuidelines[data.roomType];
        if (roomGuideline && roomGuideline.essentialElements) {
            roomGuideline.essentialElements.forEach(element => {
                if (!currentElements.includes(element)) {
                    analysis.suggestions.push(`Consider adding ${element} element (${this.elements[element].enhancement}) to enhance your ${data.roomType}.`);
                    analysis.overallScore -= 5;
                } else {
                    analysis.overallScore += 10;
                }
            });
        }

        // Check for element imbalances
        if (Object.keys(elementCount).length === 0) {
            analysis.issues.push('No natural elements detected - consider adding plants, water features, or natural materials.');
            analysis.overallScore -= 15;
        } else if (Object.keys(elementCount).length === 1) {
            analysis.issues.push('Only one element type detected - balance is key in Feng Shui.');
            analysis.suggestions.push('Add complementary elements to create harmony.');
            analysis.overallScore -= 5;
        } else {
            analysis.suggestions.push('Good element diversity detected - this promotes balanced energy.');
            analysis.overallScore += 10;
        }
    }

    analyzeNaturalLight(data, analysis) {
        const lightSources = data.naturalLight || [];
        
        if (lightSources.length === 0) {
            analysis.issues.push('Limited natural light may affect energy flow.');
            analysis.suggestions.push('Consider adding mirrors or artificial lighting to brighten the space.');
            analysis.overallScore -= 10;
        } else if (lightSources.length === 1) {
            analysis.suggestions.push('Good natural light source. Consider enhancing with light-colored decor.');
            analysis.overallScore += 10;
        } else {
            analysis.suggestions.push('Excellent natural light from multiple directions - this creates vibrant energy.');
            analysis.overallScore += 15;
        }

        // Direction-specific light analysis
        if (lightSources.includes('south-window')) {
            analysis.suggestions.push('South-facing windows bring fire energy - excellent for activity and recognition.');
        }
        if (lightSources.includes('north-window')) {
            analysis.suggestions.push('North-facing windows support career and life path energy.');
        }
        if (lightSources.includes('east-window')) {
            analysis.suggestions.push('East-facing windows bring morning energy and health benefits.');
        }
        if (lightSources.includes('west-window')) {
            analysis.suggestions.push('West-facing windows support creativity and children\'s energy.');
        }
    }

    analyzeSpaceConfiguration(data, analysis) {
        // Door position analysis
        if (data.doorPosition === 'center') {
            analysis.suggestions.push('Centered door position allows for balanced energy flow.');
            analysis.overallScore += 5;
        } else if (data.doorPosition === 'corner') {
            analysis.issues.push('Corner door position may create energy blockages.');
            analysis.suggestions.push('Use mirrors or lighting to redirect energy flow.');
            analysis.overallScore -= 5;
        }

        // Window analysis
        if (data.windowCount === 0) {
            analysis.issues.push('No windows detected - this may create stagnant energy.');
            analysis.suggestions.push('Consider adding mirrors or bright lighting to simulate natural light.');
            analysis.overallScore -= 15;
        } else if (data.windowCount > 3) {
            analysis.issues.push('Many windows may cause energy to escape too quickly.');
            analysis.suggestions.push('Use curtains or plants to moderate energy flow.');
            analysis.overallScore -= 5;
        } else {
            analysis.overallScore += 5;
        }

        // Room size analysis
        if (data.roomSize < 80) {
            analysis.suggestions.push('Small space detected - use mirrors and light colors to create openness.');
        } else if (data.roomSize > 400) {
            analysis.suggestions.push('Large space detected - create intimate areas with furniture placement and lighting.');
        } else {
            analysis.suggestions.push('Good room size for comfortable energy circulation.');
            analysis.overallScore += 5;
        }

        // Floor level analysis
        if (data.floorLevel === 'basement') {
            analysis.issues.push('Basement level may have heavy earth energy.');
            analysis.suggestions.push('Enhance with bright lighting, light colors, and uplifting elements.');
            analysis.overallScore -= 10;
        } else if (data.floorLevel === 'higher') {
            analysis.suggestions.push('Higher floor level provides elevated perspective and clarity.');
            analysis.overallScore += 5;
        }
    }

    analyzePersonalElement(data, analysis) {
        // Calculate personal element based on birth year (simplified Chinese astrology)
        const personalElement = this.calculatePersonalElement(data.birthYear);
        const personalElementInfo = this.elements[personalElement];
        
        analysis.personalizedAdvice.push(`Your personal element is ${personalElement.toUpperCase()}: ${personalElementInfo.characteristics}`);
        analysis.personalizedAdvice.push(`Enhance your space with: ${personalElementInfo.enhancement}`);
        
        // Check if room direction supports personal element
        const baguaArea = this.baguaAreas[data.facingDirection];
        if (baguaArea && baguaArea.element === personalElement) {
            analysis.personalizedAdvice.push(`Excellent! This direction naturally supports your personal ${personalElement} element.`);
            analysis.overallScore += 15;
        } else {
            analysis.personalizedAdvice.push(`Consider adding ${personalElement} element enhancements to support your personal energy.`);
        }
    }

    calculatePersonalElement(birthYear) {
        // Simplified calculation based on last digit of birth year
        const lastDigit = birthYear % 10;
        const elementMap = {
            0: 'metal', 1: 'metal',
            2: 'water', 3: 'water',
            4: 'wood', 5: 'wood',
            6: 'fire', 7: 'fire',
            8: 'earth', 9: 'earth'
        };
        return elementMap[lastDigit];
    }

    analyzePurpose(data, analysis) {
        const purpose = data.purpose;
        const baguaArea = this.baguaAreas[data.facingDirection];
        
        const purposeAdvice = {
            relaxation: {
                elements: ['earth', 'water'],
                colors: ['soft blues', 'earth tones', 'pastels'],
                tips: ['Minimize electronics', 'Add soft textures', 'Use dim, warm lighting']
            },
            productivity: {
                elements: ['wood', 'fire'],
                colors: ['green', 'blue', 'energizing yellows'],
                tips: ['Organize thoroughly', 'Ensure good lighting', 'Add plants for oxygen']
            },
            creativity: {
                elements: ['fire', 'wood'],
                colors: ['inspiring oranges', 'vibrant colors', 'artistic combinations'],
                tips: ['Create inspiring focal points', 'Add artwork', 'Ensure good natural light']
            },
            wealth: {
                elements: ['wood', 'water'],
                colors: ['green', 'purple', 'gold accents'],
                tips: ['Keep space clutter-free', 'Add water features', 'Use symbols of abundance']
            },
            relationships: {
                elements: ['earth', 'fire'],
                colors: ['pink', 'red', 'warm earth tones'],
                tips: ['Create pairs of objects', 'Use soft, romantic lighting', 'Add fresh flowers']
            },
            health: {
                elements: ['wood', 'earth'],
                colors: ['green', 'natural earth tones'],
                tips: ['Maximize natural light', 'Add living plants', 'Keep air clean and fresh']
            }
        };

        if (purposeAdvice[purpose]) {
            const advice = purposeAdvice[purpose];
            analysis.personalizedAdvice.push(`For ${purpose}: Focus on ${advice.elements.join(' and ')} elements.`);
            analysis.personalizedAdvice.push(`Ideal colors: ${advice.colors.join(', ')}.`);
            advice.tips.forEach(tip => {
                analysis.personalizedAdvice.push(tip);
            });
        }

        // Check if direction supports purpose
        const directionPurposeMap = {
            wealth: ['southeast'],
            relationships: ['southwest'],
            health: ['east'],
            productivity: ['north', 'northeast'],
            creativity: ['west'],
            relaxation: ['southwest', 'west']
        };

        if (directionPurposeMap[purpose] && directionPurposeMap[purpose].includes(data.facingDirection)) {
            analysis.personalizedAdvice.push(`Perfect! ${data.facingDirection.charAt(0).toUpperCase() + data.facingDirection.slice(1)} direction is ideal for ${purpose}.`);
            analysis.overallScore += 15;
        }
    }

    calculateOverallScore(analysis) {
        // Ensure score is between 0 and 100
        analysis.overallScore = Math.max(0, Math.min(100, analysis.overallScore + 50)); // Base score of 50
        
        // Determine score category
        if (analysis.overallScore >= 80) {
            analysis.scoreCategory = 'excellent';
            analysis.scoreName = 'Excellent';
        } else if (analysis.overallScore >= 65) {
            analysis.scoreCategory = 'good';
            analysis.scoreName = 'Good';
        } else if (analysis.overallScore >= 45) {
            analysis.scoreCategory = 'fair';
            analysis.scoreName = 'Fair';
        } else {
            analysis.scoreCategory = 'poor';
            analysis.scoreName = 'Needs Improvement';
        }
    }

    displayResults(analysis) {
        this.resultsContainer.style.display = 'block';
        
        let html = `
            <div class="analysis-section score">
                <h3><i class="fas fa-chart-line"></i> Overall Feng Shui Score</h3>
                <div class="score-display">
                    <div class="score-circle ${analysis.scoreCategory}">
                        ${analysis.overallScore}
                    </div>
                    <div class="score-description">
                        <h4>${analysis.scoreName}</h4>
                        <p>Your space has ${analysis.scoreCategory} Feng Shui energy flow. ${this.getScoreDescription(analysis.scoreCategory)}</p>
                    </div>
                </div>
            </div>
        `;

        if (analysis.issues.length > 0) {
            html += `
                <div class="analysis-section issues">
                    <h3><i class="fas fa-exclamation-triangle"></i> Areas for Improvement</h3>
                    <ul class="issue-list">
                        ${analysis.issues.map(issue => `<li><i class="fas fa-times-circle"></i> <span>${issue}</span></li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (analysis.suggestions.length > 0) {
            html += `
                <div class="analysis-section suggestions">
                    <h3><i class="fas fa-lightbulb"></i> Feng Shui Recommendations</h3>
                    <ul class="suggestion-list">
                        ${analysis.suggestions.map(suggestion => `<li><i class="fas fa-check-circle"></i> <span>${suggestion}</span></li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (Object.keys(analysis.elements).length > 0) {
            html += `
                <div class="analysis-section elements">
                    <h3><i class="fas fa-leaf"></i> Element Analysis</h3>
                    <div class="element-grid">
                        ${Object.entries(analysis.elements).map(([element, info]) => `
                            <div class="element-card">
                                <h4><i class="fas fa-${this.getElementIcon(element)}"></i> ${element.charAt(0).toUpperCase() + element.slice(1)}</h4>
                                <p>${info.reason}</p>
                                ${info.enhancement ? `<p><strong>Enhancement:</strong> ${info.enhancement}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (analysis.personalizedAdvice.length > 0) {
            html += `
                <div class="analysis-section suggestions">
                    <h3><i class="fas fa-user-circle"></i> Personalized Guidance</h3>
                    <ul class="suggestion-list">
                        ${analysis.personalizedAdvice.map(advice => `<li><i class="fas fa-star"></i> <span>${advice}</span></li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Add photo analysis section if photo was uploaded
        if (this.uploadedPhotoData && this.photoAnalysisResults) {
            html += `
                <div class="analysis-section photo-analysis">
                    <h3><i class="fas fa-camera"></i> Visual Analysis Results</h3>
                    <div class="photo-analysis-content">
                        <div class="uploaded-photo">
                            <img src="${this.uploadedPhotoData}" alt="Analyzed room photo" style="max-width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 1rem;">
                        </div>
                        <div class="photo-insights">
                            <h4>AI-Detected Room Characteristics:</h4>
                            <div class="insight-grid">
                                <div class="insight-item">
                                    <strong>Brightness Level:</strong> ${this.getBrightnessDescription(this.photoAnalysisResults.brightness || 0)}
                                </div>
                                <div class="insight-item">
                                    <strong>Dominant Colors:</strong> ${this.photoAnalysisResults.dominantColors ? this.photoAnalysisResults.dominantColors.join(', ') : 'Processing...'}
                                </div>
                                <div class="insight-item">
                                    <strong>Average Color:</strong> 
                                    <span class="color-sample" style="background-color: rgb(${this.photoAnalysisResults.averageColor ? `${this.photoAnalysisResults.averageColor.r}, ${this.photoAnalysisResults.averageColor.g}, ${this.photoAnalysisResults.averageColor.b}` : '128, 128, 128'}); display: inline-block; width: 20px; height: 20px; border-radius: 50%; margin-left: 10px; vertical-align: middle;"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        this.analysisContent.innerHTML = html;
    }

    getScoreDescription(category) {
        const descriptions = {
            excellent: 'Your space demonstrates strong harmonious energy with excellent Feng Shui principles.',
            good: 'Your space has positive energy flow with some opportunities for enhancement.',
            fair: 'Your space has potential but would benefit from several Feng Shui adjustments.',
            poor: 'Your space needs significant attention to improve energy flow and harmony.'
        };
        return descriptions[category];
    }

    getElementIcon(element) {
        const icons = {
            wood: 'tree',
            fire: 'fire',
            earth: 'mountain',
            metal: 'cog',
            water: 'tint'
        };
        return icons[element] || 'circle';
    }

    getBrightnessDescription(brightness) {
        if (brightness < 80) return 'Dim (needs more light)';
        if (brightness < 120) return 'Moderate';
        if (brightness < 180) return 'Well-lit';
        return 'Very bright';
    }

    resetForm() {
        this.form.reset();
        this.removePhoto(); // Clear photo upload
        this.resultsContainer.style.display = 'none';
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FengShuiAdvisor();
});

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth animations to form sections
    const formSections = document.querySelectorAll('.form-section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    formSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(section);
    });

    // Add interactive feedback for form elements
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});