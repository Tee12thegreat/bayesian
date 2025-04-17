// Global variables
let assetNames = [];
let expectedReturns = [];
let covarianceMatrix = [];
let optimalWeights = [];
let userProfiles = {};
let allocationChart = null;
let efficientFrontierChart = null;
let comparisonChart = null;
let stabilityChart = null;
let correlationHeatmap = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    document.getElementById('generateInputs').addEventListener('click', generateAssetInputs);
    document.getElementById('optimizeBtn').addEventListener('click', runOptimization);
    document.getElementById('compareBtn').addEventListener('click', compareWithTraditional);
    document.getElementById('resetBtn').addEventListener('click', resetTool);
    document.getElementById('loadSampleData').addEventListener('click', loadSampleData);
    document.getElementById('processFile').addEventListener('click', processUploadedFile);
    
    // User profile event listeners
    document.getElementById('saveProfileBtn').addEventListener('click', saveUserProfile);
    document.getElementById('loadProfileBtn').addEventListener('click', loadUserProfile);
    
    // Load any saved profiles
    loadSavedProfiles();
    
    // Generate initial inputs for default 3 assets
    generateAssetInputs();
});

// Generate input fields for assets based on user selection
function generateAssetInputs() {
    const numAssets = parseInt(document.getElementById('numAssets').value);
    const assetInputsDiv = document.getElementById('assetInputs');
    
    // Clear previous inputs
    assetInputsDiv.innerHTML = '';
    assetNames = [];
    
    // Generate new inputs
    for (let i = 0; i < numAssets; i++) {
        const assetDiv = document.createElement('div');
        assetDiv.className = 'col-md-4';
        assetDiv.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">Asset ${i + 1}</h5>
                    <div class="mb-3">
                        <label for="assetName${i}" class="form-label">Name:</label>
                        <input type="text" id="assetName${i}" class="form-control" value="Asset ${i + 1}">
                    </div>
                    <div class="mb-3">
                        <label for="assetReturn${i}" class="form-label">Expected Return (%):</label>
                        <input type="number" id="assetReturn${i}" class="form-control" step="0.1" value="${5 + i}">
                    </div>
                    <div class="mb-3">
                        <label for="assetVolatility${i}" class="form-label">Volatility (%):</label>
                        <input type="number" id="assetVolatility${i}" class="form-control" step="0.1" value="${10 + i * 5}">
                    </div>
                </div>
            </div>
        `;
        assetInputsDiv.appendChild(assetDiv);
    }
    
    // Generate default matrices
    generateDefaultMatrices(numAssets);
}

// Generate default matrices based on asset inputs
function generateDefaultMatrices(numAssets) {
    // Generate returns vector
    let returnsVector = [];
    for (let i = 0; i < numAssets; i++) {
        const returnInput = document.getElementById(`assetReturn${i}`);
        returnsVector.push(returnInput ? parseFloat(returnInput.value) : 5 + i);
    }
    document.getElementById('returnsMatrix').value = returnsVector.join(', ');
    
    // Generate covariance matrix
    let covMatrix = [];
    for (let i = 0; i < numAssets; i++) {
        let row = [];
        const volI = document.getElementById(`assetVolatility${i}`) ? 
            parseFloat(document.getElementById(`assetVolatility${i}`).value) : 10 + i * 5;
        
        for (let j = 0; j < numAssets; j++) {
            if (i === j) {
                // Diagonal is variance (volatility squared)
                row.push(Math.pow(volI, 2));
            } else {
                // Off-diagonal is covariance (assume 0.3 correlation for default)
                const volJ = document.getElementById(`assetVolatility${j}`) ? 
                    parseFloat(document.getElementById(`assetVolatility${j}`).value) : 10 + j * 5;
                row.push(0.3 * volI * volJ);
            }
        }
        covMatrix.push(row);
    }
    
    // Format for display
    let covMatrixText = covMatrix.map(row => row.join(', ')).join('\n');
    document.getElementById('covarianceMatrix').value = covMatrixText;
}

// Load sample dataset
function loadSampleData() {
    const dataset = document.getElementById('sampleDataset').value;
    let numAssets, names, returns, covMatrix;
    
    switch(dataset) {
        case 'stocks':
            numAssets = 3;
            names = ['Tech', 'Finance', 'Healthcare'];
            returns = [8.5, 6.2, 7.8];
            covMatrix = [
                [225, 45, 60],
                [45, 196, 30],
                [60, 30, 169]
            ];
            break;
        case 'global':
            numAssets = 4;
            names = ['US Stocks', 'Europe Stocks', 'Asia Stocks', 'Bonds'];
            returns = [7.2, 5.8, 6.5, 3.5];
            covMatrix = [
                [196, 70, 80, -20],
                [70, 225, 65, -15],
                [80, 65, 256, -10],
                [-20, -15, -10, 25]
            ];
            break;
        case 'sectors':
            numAssets = 5;
            names = ['Technology', 'Financials', 'Energy', 'Consumer', 'Healthcare'];
            returns = [9.2, 5.5, 6.8, 7.0, 8.1];
            covMatrix = [
                [256, 50, 40, 60, 70],
                [50, 225, 45, 55, 40],
                [40, 45, 289, 35, 45],
                [60, 55, 35, 196, 65],
                [70, 40, 45, 65, 169]
            ];
            break;
        case 'zimbabwe':
            numAssets = 8;
            names = ['DLTA.ZW', 'ECO.ZW', 'INN.ZW', 'NTFD.ZW', 'SIM.ZW', 'Gold', 'Maize', 'Crude Oil'];
            returns = [9.8, 7.5, 8.2, 8.0, 6.7, 5.5, 4.2, 6.0];
            covMatrix = [
                [225, 80, 70, 75, 60, 15, 10, 20],
                [80, 256, 65, 75, 55, 12, 8, 18],
                [70, 65, 196, 70, 50, 10, 5, 15],
                [75, 75, 70, 225, 65, 12, 8, 20],
                [60, 55, 50, 65, 196, 8, 5, 15],
                [15, 12, 10, 12, 8, 100, 5, 30],
                [10, 8, 5, 8, 5, 5, 64, 10],
                [20, 18, 15, 20, 15, 30, 10, 289]
            ];
            break;
    }
    
    // Set number of assets and generate inputs
    document.getElementById('numAssets').value = numAssets;
    generateAssetInputs();
    
    // Populate asset names and values
    for (let i = 0; i < numAssets; i++) {
        document.getElementById(`assetName${i}`).value = names[i];
        document.getElementById(`assetReturn${i}`).value = returns[i];
        document.getElementById(`assetVolatility${i}`).value = Math.sqrt(covMatrix[i][i]);
    }
    
    // Update matrices
    document.getElementById('returnsMatrix').value = returns.join(', ');
    document.getElementById('covarianceMatrix').value = covMatrix.map(row => row.join(', ')).join('\n');
    
    showAlert('Sample data loaded successfully!', 'success');
}

// Process uploaded CSV file
function processUploadedFile() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Please select a file to upload.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const lines = content.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length < 2) {
                showAlert('File must contain at least one data row.', 'error');
                return;
            }
            
            // Parse header to get asset names
            const headers = lines[0].split(',');
            if (headers.length < 2) {
                showAlert('File must contain at least one asset column.', 'error');
                return;
            }
            
            const numAssets = headers.length - 1; // First column is date
            assetNames = headers.slice(1).map(name => name.trim());
            
            // Parse data rows
            const prices = {};
            assetNames.forEach(name => prices[name] = []);
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length !== headers.length) continue;
                
                for (let j = 1; j < values.length; j++) {
                    const price = parseFloat(values[j]);
                    if (!isNaN(price)) {
                        prices[assetNames[j-1]].push(price);
                    }
                }
            }
            
            // Calculate returns and covariance
            const returns = calculateReturnsFromPrices(prices);
            const covMatrix = calculateCovarianceMatrix(returns);
            
            // Update UI
            document.getElementById('numAssets').value = numAssets;
            generateAssetInputs();
            
            for (let i = 0; i < numAssets; i++) {
                document.getElementById(`assetName${i}`).value = assetNames[i];
                document.getElementById(`assetReturn${i}`).value = (returns.mean[i] * 100).toFixed(2);
                document.getElementById(`assetVolatility${i}`).value = (Math.sqrt(covMatrix[i][i]) * 100).toFixed(2);
            }
            
            // Update matrices
            document.getElementById('returnsMatrix').value = returns.mean.map(r => (r * 100).toFixed(2)).join(', ');
            document.getElementById('covarianceMatrix').value = covMatrix.map(row => 
                row.map(val => (val * 10000).toFixed(2)).join(', ')
            ).join('\n');
            
            showAlert('File processed successfully!', 'success');
        } catch (error) {
            showAlert('Error processing file: ' + error.message, 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// Calculate returns from price data
function calculateReturnsFromPrices(prices) {
    const assets = Object.keys(prices);
    const returns = {};
    const meanReturns = [];
    
    assets.forEach(asset => {
        const assetPrices = prices[asset];
        returns[asset] = [];
        
        for (let i = 1; i < assetPrices.length; i++) {
            const ret = (assetPrices[i] - assetPrices[i-1]) / assetPrices[i-1];
            returns[asset].push(ret);
        }
        
        // Calculate mean return for this asset
        const sum = returns[asset].reduce((a, b) => a + b, 0);
        meanReturns.push(sum / returns[asset].length);
    });
    
    return {
        daily: returns,
        mean: meanReturns
    };
}

// Calculate covariance matrix from returns
function calculateCovarianceMatrix(returnsData) {
    const assets = Object.keys(returnsData.daily);
    const numAssets = assets.length;
    const covMatrix = Array(numAssets).fill().map(() => Array(numAssets).fill(0));
    
    // Calculate covariance between each pair of assets
    for (let i = 0; i < numAssets; i++) {
        for (let j = 0; j < numAssets; j++) {
            if (i === j) {
                // Variance calculation
                const variance = returnsData.daily[assets[i]].reduce((sum, ret) => 
                    sum + Math.pow(ret - returnsData.mean[i], 2), 0) / returnsData.daily[assets[i]].length;
                covMatrix[i][j] = variance;
            } else {
                // Covariance calculation
                let covariance = 0;
                const retsI = returnsData.daily[assets[i]];
                const retsJ = returnsData.daily[assets[j]];
                const meanI = returnsData.mean[i];
                const meanJ = returnsData.mean[j];
                
                for (let k = 0; k < retsI.length; k++) {
                    covariance += (retsI[k] - meanI) * (retsJ[k] - meanJ);
                }
                covariance /= retsI.length;
                
                covMatrix[i][j] = covariance;
                covMatrix[j][i] = covariance;
            }
        }
    }
    
    return covMatrix;
}

// Run Bayesian portfolio optimization
function runOptimization() {
    // Show loading indicator
    document.getElementById('loader').classList.remove('d-none');
    document.getElementById('resultsSection').classList.add('d-none');
    
    // Parse inputs
    try {
        parseInputs();
    } catch (error) {
        showAlert(error.message, 'error');
        document.getElementById('loader').classList.add('d-none');
        return;
    }
    
    // Simulate processing delay (in a real app, this would be actual computation)
    setTimeout(() => {
        try {
            // Get optimization parameters
            const priorStrength = parseInt(document.getElementById('priorStrength').value) / 100;
            const riskAversion = parseInt(document.getElementById('riskAversion').value);
            
            // Run optimization
            const result = bayesianOptimization(expectedReturns, covarianceMatrix, priorStrength, riskAversion);
            optimalWeights = result.weights;
            
            // Display results
            displayResults(result);
            
            // Show correlation matrix
            displayCorrelationMatrix();
            
            // Show results section
            document.getElementById('resultsSection').classList.remove('d-none');
            document.getElementById('portfolioComparison').classList.add('d-none');
        } catch (error) {
            showAlert('Optimization error: ' + error.message, 'error');
            console.error(error);
        } finally {
            document.getElementById('loader').classList.add('d-none');
        }
    }, 1000);
}

// Parse user inputs into arrays/matrices
function parseInputs() {
    const numAssets = parseInt(document.getElementById('numAssets').value);
    
    // Get asset names
    assetNames = [];
    for (let i = 0; i < numAssets; i++) {
        const name = document.getElementById(`assetName${i}`).value.trim();
        assetNames.push(name || `Asset ${i + 1}`);
    }
    
    // Parse returns vector
    const returnsInput = document.getElementById('returnsMatrix').value.trim();
    if (!returnsInput) {
        throw new Error('Please enter expected returns for all assets.');
    }
    
    expectedReturns = returnsInput.split(',').map(val => parseFloat(val.trim()) / 100); // Convert % to decimal
    if (expectedReturns.length !== numAssets || expectedReturns.some(isNaN)) {
        throw new Error('Expected returns must be a comma-separated list of numbers matching the number of assets.');
    }
    
    // Parse covariance matrix
    const covInput = document.getElementById('covarianceMatrix').value.trim();
    if (!covInput) {
        throw new Error('Please enter the covariance matrix.');
    }
    
    const rows = covInput.split('\n').filter(row => row.trim() !== '');
    if (rows.length !== numAssets) {
        throw new Error('Covariance matrix must have the same number of rows as assets.');
    }
    
    covarianceMatrix = rows.map(row => 
        row.split(',').map(val => parseFloat(val.trim()) / 10000 // Convert %^2 to decimal
    ));
    
    // Check matrix is square and symmetric
    for (let i = 0; i < numAssets; i++) {
        if (covarianceMatrix[i].length !== numAssets) {
            throw new Error('Each row of the covariance matrix must have the same number of columns as assets.');
        }
        for (let j = 0; j < i; j++) {
            if (Math.abs(covarianceMatrix[i][j] - covarianceMatrix[j][i]) > 1e-6) {
                throw new Error('Covariance matrix must be symmetric (value at ['+i+','+j+'] should match ['+j+','+i+'])');
            }
        }
    }
}

// Bayesian portfolio optimization algorithm
function bayesianOptimization(returns, covariance, priorStrength, riskAversion) {
    const numAssets = returns.length;
    
    // Prior distribution (equal weights)
    const priorWeights = Array(numAssets).fill(1 / numAssets);
    
    // Calculate traditional Markowitz weights
    const markowitzWeights = markowitzOptimization(returns, covariance, riskAversion);
    
    // Blend with prior based on prior strength
    const blendedWeights = [];
    for (let i = 0; i < numAssets; i++) {
        blendedWeights.push(
            priorStrength * priorWeights[i] + (1 - priorStrength) * markowitzWeights[i]
        );
    }
    
    // Normalize weights to sum to 1
    const sum = blendedWeights.reduce((a, b) => a + b, 0);
    const normalizedWeights = blendedWeights.map(w => w / sum);
    
    // Calculate portfolio metrics
    const portfolioReturn = calculatePortfolioReturn(normalizedWeights, returns);
    const portfolioRisk = calculatePortfolioRisk(normalizedWeights, covariance);
    const sharpeRatio = portfolioReturn / portfolioRisk;
    
    // Calculate posterior probability (simplified for demo)
    const posteriorProb = 1 - priorStrength;
    
    return {
        weights: normalizedWeights,
        portfolioReturn,
        portfolioRisk,
        sharpeRatio,
        posteriorProb
    };
}

// Traditional Markowitz optimization
function markowitzOptimization(returns, covariance, riskAversion) {
    const numAssets = returns.length;
    
    // Initialize weights
    let weights = Array(numAssets).fill(1 / numAssets);
    
    // Simple gradient ascent (for demonstration - real implementation would use proper QP solver)
    const learningRate = 0.01;
    const iterations = 1000;
    
    for (let iter = 0; iter < iterations; iter++) {
        // Calculate gradient
        const gradient = Array(numAssets).fill(0);
        
        // Gradient of expected return part (r)
        for (let i = 0; i < numAssets; i++) {
            gradient[i] += returns[i];
        }
        
        // Gradient of risk aversion part (-lambda * S * w)
        for (let i = 0; i < numAssets; i++) {
            for (let j = 0; j < numAssets; j++) {
                gradient[i] -= riskAversion * covariance[i][j] * weights[j];
            }
        }
        
        // Update weights with gradient
        for (let i = 0; i < numAssets; i++) {
            weights[i] += learningRate * gradient[i];
        }
        
        // Project onto simplex (sum to 1, non-negative)
        weights = projectToSimplex(weights);
    }
    
    return weights;
}

// Project weights onto simplex (sum to 1, non-negative)
function projectToSimplex(weights) {
    // Sort weights in descending order
    const sorted = [...weights].map((w, i) => [w, i]).sort((a, b) => b[0] - a[0]);
    const n = weights.length;
    let sum = 0;
    let rho = n;
    
    // Find rho
    for (let i = 0; i < n; i++) {
        sum += sorted[i][0];
        const t = (sum - 1) / (i + 1);
        if (t >= sorted[i][0]) {
            rho = i;
            break;
        }
    }
    
    const theta = (sorted.slice(0, rho + 1).reduce((a, b) => a + b[0], 0) - 1) / (rho + 1);
    
    // Project
    const projected = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        projected[i] = Math.max(weights[i] - theta, 0);
    }
    
    return projected;
}

// Calculate portfolio return
function calculatePortfolioReturn(weights, returns) {
    let portfolioReturn = 0;
    for (let i = 0; i < weights.length; i++) {
        portfolioReturn += weights[i] * returns[i];
    }
    return portfolioReturn;
}

// Calculate portfolio risk
function calculatePortfolioRisk(weights, covariance) {
    let variance = 0;
    for (let i = 0; i < weights.length; i++) {
        for (let j = 0; j < weights.length; j++) {
            variance += weights[i] * weights[j] * covariance[i][j];
        }
    }
    return Math.sqrt(variance);
}

// Display optimization results
function displayResults(result) {
    // Display metrics
    document.getElementById('expectedReturn').textContent = (result.portfolioReturn * 100).toFixed(2) + '%';
    document.getElementById('portfolioRisk').textContent = (result.portfolioRisk * 100).toFixed(2) + '%';
    document.getElementById('sharpeRatio').textContent = result.sharpeRatio.toFixed(2);
    document.getElementById('posteriorProb').textContent = (result.posteriorProb * 100).toFixed(0) + '%';
    
    // Create allocation chart
    createAllocationChart(assetNames, optimalWeights);
    
    // Create efficient frontier chart
    createEfficientFrontierChart(expectedReturns, covarianceMatrix, optimalWeights);
    
    // Populate weights table
    const weightsTable = document.getElementById('weightsTable').getElementsByTagName('tbody')[0];
    weightsTable.innerHTML = '';
    
    for (let i = 0; i < assetNames.length; i++) {
        const row = weightsTable.insertRow();
        
        // Asset name
        row.insertCell(0).textContent = assetNames[i];
        
        // Weight
        row.insertCell(1).textContent = (optimalWeights[i] * 100).toFixed(2) + '%';
        
        // Contribution to return
        const returnContribution = optimalWeights[i] * expectedReturns[i];
        row.insertCell(2).textContent = (returnContribution * 100).toFixed(2) + '%';
        
        // Contribution to risk (simplified)
        let riskContribution = 0;
        for (let j = 0; j < assetNames.length; j++) {
            riskContribution += optimalWeights[i] * optimalWeights[j] * covarianceMatrix[i][j];
        }
        riskContribution /= result.portfolioRisk; // Normalize by total risk
        row.insertCell(3).textContent = (riskContribution * 100).toFixed(2) + '%';
    }
}

// Create allocation pie chart
function createAllocationChart(labels, weights) {
    const ctx = document.getElementById('allocationChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (allocationChart) {
        allocationChart.destroy();
    }
    
    const backgroundColors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(255, 99, 255, 0.7)',
        'rgba(99, 255, 132, 0.7)'
    ];
    
    allocationChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: weights.map(w => w * 100),
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Optimal Asset Allocation',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Create efficient frontier chart
function createEfficientFrontierChart(returns, covariance, optimalWeights) {
    const ctx = document.getElementById('efficientFrontierChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (efficientFrontierChart) {
        efficientFrontierChart.destroy();
    }
    
    // Generate efficient frontier points
    const frontierPoints = calculateEfficientFrontier(returns, covariance, 20);
    
    // Calculate optimal portfolio metrics
    const optimalReturn = calculatePortfolioReturn(optimalWeights, returns);
    const optimalRisk = calculatePortfolioRisk(optimalWeights, covariance);
    
    efficientFrontierChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Efficient Frontier',
                    data: frontierPoints.map(p => ({x: p.risk * 100, y: p.return * 100})),
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    pointRadius: 0,
                    showLine: true,
                    fill: true
                },
                {
                    label: 'Optimal Portfolio',
                    data: [{x: optimalRisk * 100, y: optimalReturn * 100}],
                    backgroundColor: 'rgba(255, 99, 132, 1)',
                    pointRadius: 8,
                    pointHoverRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Efficient Frontier',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return 'Efficient Frontier';
                            } else {
                                return `Optimal Portfolio (${optimalRisk.toFixed(2)}% risk, ${optimalReturn.toFixed(2)}% return)`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Risk (Standard Deviation, %)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Expected Return (%)'
                    }
                }
            }
        }
    });
}

// Calculate efficient frontier points
function calculateEfficientFrontier(returns, covariance, numPoints = 20) {
    const numAssets = returns.length;
    const minReturn = Math.min(...returns);
    const maxReturn = Math.max(...returns);
    const step = (maxReturn - minReturn) / (numPoints - 1);
    
    const frontierPoints = [];
    
    // For each target return, find minimum variance portfolio
    for (let i = 0; i < numPoints; i++) {
        const targetReturn = minReturn + i * step;
        
        // Initial guess (equal weights)
        let weights = Array(numAssets).fill(1 / numAssets);
        const learningRate = 0.001;
        const iterations = 1000;
        
        for (let iter = 0; iter < iterations; iter++) {
            // Calculate gradient of variance (2 * S * w)
            const gradient = Array(numAssets).fill(0);
            for (let i = 0; i < numAssets; i++) {
                for (let j = 0; j < numAssets; j++) {
                    gradient[i] += 2 * covariance[i][j] * weights[j];
                }
            }
            
            // Calculate current return and sum
            const currentReturn = calculatePortfolioReturn(weights, returns);
            const currentSum = weights.reduce((a, b) => a + b, 0);
            
            // Adjust gradient to move toward constraints
            for (let i = 0; i < numAssets; i++) {
                // Move toward target return
                gradient[i] -= 0.1 * (currentReturn - targetReturn) * returns[i];
                
                // Move toward sum = 1
                gradient[i] -= 0.1 * (currentSum - 1);
            }
            
            // Update weights
            for (let i = 0; i < numAssets; i++) {
                weights[i] -= learningRate * gradient[i];
            }
            
            // Project onto simplex (sum to 1, non-negative)
            weights = projectToSimplex(weights);
        }
        
        // Calculate portfolio metrics
        const portfolioReturn = calculatePortfolioReturn(weights, returns);
        const portfolioRisk = calculatePortfolioRisk(weights, covariance);
        
        frontierPoints.push({
            return: portfolioReturn,
            risk: portfolioRisk,
            weights: weights
        });
    }
    
    return frontierPoints;
}

// Compare with traditional Markowitz optimization
function compareWithTraditional() {
    if (!optimalWeights || optimalWeights.length === 0) {
        showAlert('Please run Bayesian optimization first.', 'error');
        return;
    }
    
    // Get parameters
    const riskAversion = parseInt(document.getElementById('riskAversion').value);
    
    // Calculate traditional Markowitz portfolio
    const markowitzWeights = markowitzOptimization(expectedReturns, covarianceMatrix, riskAversion);
    const markowitzReturn = calculatePortfolioReturn(markowitzWeights, expectedReturns);
    const markowitzRisk = calculatePortfolioRisk(markowitzWeights, covarianceMatrix);
    const markowitzSharpe = markowitzReturn / markowitzRisk;
    
    // Get Bayesian portfolio metrics
    const bayesianReturn = calculatePortfolioReturn(optimalWeights, expectedReturns);
    const bayesianRisk = calculatePortfolioRisk(optimalWeights, covarianceMatrix);
    const bayesianSharpe = bayesianReturn / bayesianRisk;
    
    // Create comparison chart
    createComparisonChart(
        bayesianReturn, bayesianRisk, bayesianSharpe,
        markowitzReturn, markowitzRisk, markowitzSharpe
    );
    
    // Create stability chart
    createStabilityChart(expectedReturns, covarianceMatrix);
    
    // Populate comparison table
    const comparisonTable = document.getElementById('comparisonTable').getElementsByTagName('tbody')[0];
    comparisonTable.innerHTML = '';
    
    // Expected Return row
    let row = comparisonTable.insertRow();
    row.insertCell(0).textContent = 'Expected Return';
    row.insertCell(1).textContent = (bayesianReturn * 100).toFixed(2) + '%';
    row.insertCell(2).textContent = (markowitzReturn * 100).toFixed(2) + '%';
    row.insertCell(3).textContent = ((bayesianReturn - markowitzReturn) * 100).toFixed(2) + ' pp';
    
    // Risk row
    row = comparisonTable.insertRow();
    row.insertCell(0).textContent = 'Risk (Std Dev)';
    row.insertCell(1).textContent = (bayesianRisk * 100).toFixed(2) + '%';
    row.insertCell(2).textContent = (markowitzRisk * 100).toFixed(2) + '%';
    row.insertCell(3).textContent = ((bayesianRisk - markowitzRisk) * 100).toFixed(2) + ' pp';
    
    // Sharpe Ratio row
    row = comparisonTable.insertRow();
    row.insertCell(0).textContent = 'Sharpe Ratio';
    row.insertCell(1).textContent = bayesianSharpe.toFixed(2);
    row.insertCell(2).textContent = markowitzSharpe.toFixed(2);
    row.insertCell(3).textContent = (bayesianSharpe - markowitzSharpe).toFixed(2);
    
    // Show comparison section
    document.getElementById('portfolioComparison').classList.remove('d-none');
}

// Create comparison chart
function createComparisonChart(bayesianReturn, bayesianRisk, bayesianSharpe,
                             markowitzReturn, markowitzRisk, markowitzSharpe) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Expected Return (%)', 'Risk (%)', 'Sharpe Ratio'],
            datasets: [
                {
                    label: 'Bayesian',
                    data: [
                        bayesianReturn * 100,
                        bayesianRisk * 100,
                        bayesianSharpe
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                },
                {
                    label: 'Markowitz',
                    data: [
                        markowitzReturn * 100,
                        markowitzRisk * 100,
                        markowitzSharpe
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Bayesian vs. Markowitz Optimization',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    stacked: false
                }
            }
        }
    });
}

// Create stability chart
function createStabilityChart(returns, covariance) {
    const ctx = document.getElementById('stabilityChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (stabilityChart) {
        stabilityChart.destroy();
    }
    
    // Generate stability data by perturbing inputs
    const numSimulations = 10;
    const bayesianWeights = [];
    const markowitzWeights = [];
    
    for (let i = 0; i < numSimulations; i++) {
        // Perturb returns and covariance
        const perturbedReturns = returns.map(r => r * (1 + (Math.random() - 0.5) * 0.2));
        const perturbedCovariance = covariance.map(row => 
            row.map(val => val * (1 + (Math.random() - 0.5) * 0.2)
        ));
        
        // Get prior strength and risk aversion
        const priorStrength = parseInt(document.getElementById('priorStrength').value) / 100;
        const riskAversion = parseInt(document.getElementById('riskAversion').value);
        
        // Calculate weights
        const bayesianResult = bayesianOptimization(perturbedReturns, perturbedCovariance, priorStrength, riskAversion);
        bayesianWeights.push(bayesianResult.weights);
        
        const markowitzResult = markowitzOptimization(perturbedReturns, perturbedCovariance, riskAversion);
        markowitzWeights.push(markowitzResult);
    }
    
    // Calculate weight stability (standard deviation across simulations)
    const bayesianStability = calculateWeightStability(bayesianWeights);
    const markowitzStability = calculateWeightStability(markowitzWeights);
    
    stabilityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: assetNames,
            datasets: [
                {
                    label: 'Bayesian Weight Stability',
                    data: bayesianStability,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                },
                {
                    label: 'Markowitz Weight Stability',
                    data: markowitzStability,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Weight Stability Across Simulations',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Standard Deviation of Weights'
                    }
                }
            }
        }
    });
}

// Calculate weight stability (standard deviation across simulations)
function calculateWeightStability(weightsArray) {
    const numAssets = weightsArray[0].length;
    const stability = Array(numAssets).fill(0);
    
    // Calculate mean for each asset
    const means = Array(numAssets).fill(0);
    for (let i = 0; i < weightsArray.length; i++) {
        for (let j = 0; j < numAssets; j++) {
            means[j] += weightsArray[i][j];
        }
    }
    means.forEach((m, i) => means[i] = m / weightsArray.length);
    
    // Calculate variance
    const variances = Array(numAssets).fill(0);
    for (let i = 0; i < weightsArray.length; i++) {
        for (let j = 0; j < numAssets; j++) {
            variances[j] += Math.pow(weightsArray[i][j] - means[j], 2);
        }
    }
    variances.forEach((v, i) => variances[i] = v / weightsArray.length);
    
    // Standard deviation is square root of variance
    return variances.map(v => Math.sqrt(v));
}

// Display correlation matrix
function displayCorrelationMatrix() {
    const container = document.getElementById('correlationMatrixContainer');
    container.innerHTML = '';
    
    // Calculate correlation matrix from covariance matrix
    const corrMatrix = calculateCorrelationMatrix(covarianceMatrix);
    
    // Create table
    const table = document.createElement('table');
    table.className = 'table table-bordered correlation-matrix';
    
    // Create header row
    const headerRow = table.insertRow();
    headerRow.insertCell().textContent = ''; // Empty top-left cell
    
    // Add asset names to header
    assetNames.forEach(name => {
        const th = document.createElement('th');
        th.textContent = name;
        headerRow.appendChild(th);
    });
    
    // Add data rows
    for (let i = 0; i < assetNames.length; i++) {
        const row = table.insertRow();
        
        // Add asset name to first column
        const assetCell = row.insertCell();
        assetCell.textContent = assetNames[i];
        assetCell.style.fontWeight = 'bold';
        
        // Add correlation values
        for (let j = 0; j < assetNames.length; j++) {
            const cell = row.insertCell();
            cell.className = 'correlation-cell';
            
            if (i === j) {
                cell.textContent = '1.00';
                cell.classList.add('heatmap-4');
            } else {
                const corr = corrMatrix[i][j];
                cell.textContent = corr.toFixed(2);
                
                // Add heatmap class based on correlation value
                if (corr >= 0.8) cell.classList.add('heatmap-4');
                else if (corr >= 0.6) cell.classList.add('heatmap-3');
                else if (corr >= 0.4) cell.classList.add('heatmap-2');
                else if (corr >= 0.2) cell.classList.add('heatmap-1');
                else if (corr >= 0) cell.classList.add('heatmap-0');
                else if (corr >= -0.2) cell.classList.add('heatmap--1');
                else if (corr >= -0.4) cell.classList.add('heatmap--2');
                else if (corr >= -0.6) cell.classList.add('heatmap--3');
                else cell.classList.add('heatmap--4');
            }
        }
    }
    
    container.appendChild(table);
    
    // Create correlation heatmap chart
    createCorrelationHeatmap(assetNames, corrMatrix);
}

// Calculate correlation matrix from covariance matrix
function calculateCorrelationMatrix(covMatrix) {
    const numAssets = covMatrix.length;
    const corrMatrix = Array(numAssets).fill().map(() => Array(numAssets).fill(0));
    
    for (let i = 0; i < numAssets; i++) {
        for (let j = 0; j < numAssets; j++) {
            corrMatrix[i][j] = covMatrix[i][j] / (Math.sqrt(covMatrix[i][i]) * Math.sqrt(covMatrix[j][j]));
        }
    }
    
    return corrMatrix;
}

// Create correlation heatmap chart
function createCorrelationHeatmap(labels, corrMatrix) {
    const ctx = document.getElementById('correlationHeatmap').getContext('2d');
    
    // Destroy previous chart if it exists
    if (correlationHeatmap) {
        correlationHeatmap.destroy();
    }
    
    // Prepare data for Chart.js
    const data = {
        labels: labels,
        datasets: labels.map((label, i) => ({
            label: label,
            data: corrMatrix[i],
            backgroundColor: corrMatrix[i].map(corr => {
                // Map correlation to color
                const alpha = Math.abs(corr) * 0.7 + 0.3; // Adjust alpha for visibility
                if (corr >= 0) {
                    return `rgba(0, 128, 0, ${alpha})`; // Green for positive
                } else {
                    return `rgba(255, 0, 0, ${alpha})`; // Red for negative
                }
            })
        }))
    };
    
    correlationHeatmap = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Asset Correlation Heatmap',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${labels[context.datasetIndex]} & ${labels[context.dataIndex]}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Asset'
                    }
                },
                y: {
                    min: -1,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Correlation'
                    }
                }
            },
            indexAxis: 'y'
        }
    });
}

// Reset tool to initial state
function resetTool() {
    document.getElementById('numAssets').value = 3;
    generateAssetInputs();
    document.getElementById('priorStrength').value = 50;
    document.getElementById('riskAversion').value = 4;
    document.getElementById('resultsSection').classList.add('d-none');
    document.getElementById('alertBox').classList.add('d-none');
    
    // Reset to first tab
    const tab = new bootstrap.Tab(document.getElementById('manual-tab'));
    tab.show();
}

// Show alert message
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
    
    if (type === 'error') {
        alertBox.classList.remove('alert-success');
        alertBox.classList.add('alert-danger');
    } else {
        alertBox.classList.remove('alert-danger');
        alertBox.classList.add('alert-success');
    }
    
    // Hide alert after 5 seconds
    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 5000);
}

// User Profile Functions

// Load saved profiles from cookies
function loadSavedProfiles() {
    const profilesCookie = Cookies.get('portfolioProfiles');
    if (profilesCookie) {
        userProfiles = JSON.parse(profilesCookie);
        updateProfileSelect();
    }
}

// Save current configuration as a user profile
function saveUserProfile() {
    const profileName = document.getElementById('profileName').value.trim();
    if (!profileName) {
        showAlert('Please enter a profile name.', 'error');
        return;
    }
    
    // Get current configuration
    const config = {
        numAssets: parseInt(document.getElementById('numAssets').value),
        assetNames: [],
        assetReturns: [],
        assetVolatilities: [],
        returnsMatrix: document.getElementById('returnsMatrix').value,
        covarianceMatrix: document.getElementById('covarianceMatrix').value,
        priorStrength: parseInt(document.getElementById('priorStrength').value),
        riskAversion: parseInt(document.getElementById('riskAversion').value)
    };
    
    // Get asset-specific values
    for (let i = 0; i < config.numAssets; i++) {
        config.assetNames.push(document.getElementById(`assetName${i}`).value);
        config.assetReturns.push(document.getElementById(`assetReturn${i}`).value);
        config.assetVolatilities.push(document.getElementById(`assetVolatility${i}`).value);
    }
    
    // Save to profiles
    userProfiles[profileName] = config;
    
    // Save to cookie
    Cookies.set('portfolioProfiles', JSON.stringify(userProfiles), { expires: 365 });
    
    // Update profile select and show success message
    updateProfileSelect();
    showAlert(`Profile "${profileName}" saved successfully!`, 'success');
    document.getElementById('profileName').value = '';
}

// Load a saved profile
function loadUserProfile() {
    const profileName = document.getElementById('profileSelect').value;
    if (!profileName || !userProfiles[profileName]) {
        showAlert('Please select a valid profile to load.', 'error');
        return;
    }
    
    const config = userProfiles[profileName];
    
    // Set basic configuration
    document.getElementById('numAssets').value = config.numAssets;
    document.getElementById('priorStrength').value = config.priorStrength;
    document.getElementById('riskAversion').value = config.riskAversion;
    
    // Generate inputs
    generateAssetInputs();
    
    // Set asset-specific values
    for (let i = 0; i < config.numAssets; i++) {
        if (document.getElementById(`assetName${i}`)) {
            document.getElementById(`assetName${i}`).value = config.assetNames[i];
            document.getElementById(`assetReturn${i}`).value = config.assetReturns[i];
            document.getElementById(`assetVolatility${i}`).value = config.assetVolatilities[i];
        }
    }
    
    // Set matrices
    document.getElementById('returnsMatrix').value = config.returnsMatrix;
    document.getElementById('covarianceMatrix').value = config.covarianceMatrix;
    
    showAlert(`Profile "${profileName}" loaded successfully!`, 'success');
}

// Update profile select dropdown
function updateProfileSelect() {
    const select = document.getElementById('profileSelect');
    select.innerHTML = '<option value="">Select a saved profile</option>';
    
    for (const profileName in userProfiles) {
        const option = document.createElement('option');
        option.value = profileName;
        option.textContent = profileName;
        select.appendChild(option);
    }
}