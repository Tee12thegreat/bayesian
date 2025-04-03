// Constants and sample data
const sampleData = {
    stocks: {
        assets: ["Tech Stocks", "Financial Stocks", "Healthcare Stocks"],
        returns: [12.5, 9.2, 7.8],
        covariance: [
            [256, 64, 40],
            [64, 144, 36],
            [40, 36, 100]
        ]
    },
    global: {
        assets: ["US Equities", "European Equities", "Asian Equities", "Bonds"],
        returns: [10.2, 8.5, 11.3, 4.2],
        covariance: [
            [196, 84, 90, 12],
            [84, 169, 78, 14],
            [90, 78, 225, 8],
            [12, 14, 8, 36]
        ]
    },
    sectors: {
        assets: ["Technology", "Financial", "Energy", "Consumer", "Healthcare"],
        returns: [14.3, 9.6, 7.2, 8.4, 10.8],
        covariance: [
            [225, 72, 45, 54, 63],
            [72, 144, 36, 32, 40],
            [45, 36, 169, 27, 36],
            [54, 32, 27, 100, 45],
            [63, 40, 36, 45, 121]
        ]
    }
};

// DOM Elements
const numAssetsInput = document.getElementById('numAssets');
const generateInputsBtn = document.getElementById('generateInputs');
const assetInputsDiv = document.getElementById('assetInputs');
const returnsMatrixContainer = document.getElementById('returnsMatrixContainer');
const returnsMatrixInput = document.getElementById('returnsMatrix');
const covarianceMatrixContainer = document.getElementById('covarianceMatrixContainer');
const covarianceMatrixInput = document.getElementById('covarianceMatrix');
const optimizeBtn = document.getElementById('optimizeBtn');
const compareBtn = document.getElementById('compareBtn');
const resetBtn = document.getElementById('resetBtn');
const resultsSection = document.getElementById('resultsSection');
const loadSampleDataBtn = document.getElementById('loadSampleData');
const processFileBtn = document.getElementById('processFile');
const sampleDatasetSelect = document.getElementById('sampleDataset');
const csvFileInput = document.getElementById('csvFile');
const loader = document.getElementById('loader');
const alertBox = document.getElementById('alertBox');
const portfolioComparison = document.getElementById('portfolioComparison');

// Chart objects
let allocationChart = null;
let efficientFrontierChart = null;
let comparisonChart = null;
let stabilityChart = null;

// Initialize tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Generate asset inputs based on number of assets
generateInputsBtn.addEventListener('click', () => {
    const numAssets = parseInt(numAssetsInput.value);
    
    if (numAssets < 2 || numAssets > 10) {
        showAlert('Please enter a number between 2 and 10');
        return;
    }
    
    assetInputsDiv.innerHTML = '';
    let assetInputsHTML = '<div class="asset-inputs">';
    
    for (let i = 0; i < numAssets; i++) {
        assetInputsHTML += `
        <div class="asset-input">
            <div class="form-group">
                <label for="asset${i}">Asset ${i + 1} Name:</label>
                <input type="text" id="asset${i}" value="Asset ${i + 1}">
            </div>
        </div>`;
    }
    
    assetInputsHTML += '</div>';
    assetInputsDiv.innerHTML = assetInputsHTML;
    
    // Generate default returns vector
    let returnsStr = '';
    for (let i = 0; i < numAssets; i++) {
        returnsStr += (Math.random() * 10 + 5).toFixed(2);
        if (i < numAssets - 1) returnsStr += ', ';
    }
    returnsMatrixInput.value = returnsStr;
    
    // Generate default covariance matrix
    let covarianceStr = '';
    const defaultCov = Array(numAssets).fill(0).map(() => Array(numAssets).fill(0));
    
    for (let i = 0; i < numAssets; i++) {
        defaultCov[i][i] = Math.floor(Math.random() * 150) + 50; // Diagonal elements (variance)
        
        for (let j = 0; j < i; j++) {
            const correlation = Math.random() * 0.6 + 0.2;
            defaultCov[i][j] = Math.floor(correlation * Math.sqrt(defaultCov[i][i] * defaultCov[j][j]));
            defaultCov[j][i] = defaultCov[i][j]; // Symmetric matrix
        }
    }
    
    for (let i = 0; i < numAssets; i++) {
        for (let j = 0; j < numAssets; j++) {
            covarianceStr += defaultCov[i][j];
            if (j < numAssets - 1) covarianceStr += ', ';
        }
        if (i < numAssets - 1) covarianceStr += '\n';
    }
    
    covarianceMatrixInput.value = covarianceStr;
    
    returnsMatrixContainer.style.display = 'block';
    covarianceMatrixContainer.style.display = 'block';
});

// Load sample data
loadSampleDataBtn.addEventListener('click', () => {
    const selectedDataset = sampleDatasetSelect.value;
    const data = sampleData[selectedDataset];
    
    // Update UI to reflect sample data
    numAssetsInput.value = data.assets.length;
    
    // Generate asset input fields
    assetInputsDiv.innerHTML = '';
    let assetInputsHTML = '<div class="asset-inputs">';
    
    for (let i = 0; i < data.assets.length; i++) {
        assetInputsHTML += `
        <div class="asset-input">
            <div class="form-group">
                <label for="asset${i}">Asset ${i + 1} Name:</label>
                <input type="text" id="asset${i}" value="${data.assets[i]}">
            </div>
        </div>`;
    }
    
    assetInputsHTML += '</div>';
    assetInputsDiv.innerHTML = assetInputsHTML;
    
    // Set returns vector
    returnsMatrixInput.value = data.returns.join(', ');
    
    // Set covariance matrix
    let covarianceStr = '';
    for (let i = 0; i < data.covariance.length; i++) {
        covarianceStr += data.covariance[i].join(', ');
        if (i < data.covariance.length - 1) covarianceStr += '\n';
    }
    covarianceMatrixInput.value = covarianceStr;
    
    returnsMatrixContainer.style.display = 'block';
    covarianceMatrixContainer.style.display = 'block';
    
    // Switch to manual input tab to show the data
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelector('.tab[data-tab="manual-input"]').classList.add('active');
    document.getElementById('manual-input').classList.add('active');
});

// Process CSV file
processFileBtn.addEventListener('click', () => {
    const file = csvFileInput.files[0];
    if (!file) {
        showAlert('Please select a file to upload');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const contents = e.target.result;
            const rows = contents.split('\n');
            const header = rows[0].split(',');
            
            const assetNames = header.slice(1).map(name => name.trim());
            const numAssets = assetNames.length;
            
            if (numAssets < 2) {
                showAlert('CSV must contain at least 2 assets (columns)');
                return;
            }
            
            const priceData = [];
            for (let i = 1; i < rows.length; i++) {
                if (rows[i].trim() === '') continue;
                
                const rowData = rows[i].split(',');
                const prices = rowData.slice(1).map(price => parseFloat(price.trim()));
                
                if (prices.some(isNaN)) continue;
                priceData.push(prices);
            }
            
            if (priceData.length < 30) {
                showAlert('Not enough data rows. At least 30 price points needed.');
                return;
            }
            
            // Calculate returns
            const returns = [];
            for (let i = 1; i < priceData.length; i++) {
                const dailyReturns = [];
                for (let j = 0; j < numAssets; j++) {
                    const dailyReturn = (priceData[i][j] / priceData[i - 1][j]) - 1;
                    dailyReturns.push(dailyReturn);
                }
                returns.push(dailyReturns);
            }
            
            // Calculate average returns (annualized)
            const avgReturns = [];
            for (let j = 0; j < numAssets; j++) {
                let sum = 0;
                for (let i = 0; i < returns.length; i++) {
                    sum += returns[i][j];
                }
                avgReturns.push(((sum / returns.length) * 252 * 100).toFixed(2));
            }
            
            // Calculate covariance matrix (annualized)
            const covMatrix = Array(numAssets).fill(0).map(() => Array(numAssets).fill(0));
            
            for (let i = 0; i < numAssets; i++) {
                for (let j = 0; j < numAssets; j++) {
                    let covariance = 0;
                    
                    for (let k = 0; k < returns.length; k++) {
                        const returnI = returns[k][i];
                        const returnJ = returns[k][j];
                        const avgReturnI = avgReturns[i] / (252 * 100);
                        const avgReturnJ = avgReturns[j] / (252 * 100);
                        
                        covariance += (returnI - avgReturnI) * (returnJ - avgReturnJ);
                    }
                    
                    covariance = covariance / (returns.length - 1);
                    covMatrix[i][j] = Math.round(covariance * 252 * 10000);  // Scaled for better display
                }
            }
            
            // Update UI
            numAssetsInput.value = numAssets;
            
            // Generate asset input fields
            assetInputsDiv.innerHTML = '';
            let assetInputsHTML = '<div class="asset-inputs">';
            
            for (let i = 0; i < numAssets; i++) {
                assetInputsHTML += `
                <div class="asset-input">
                    <div class="form-group">
                        <label for="asset${i}">Asset ${i + 1} Name:</label>
                        <input type="text" id="asset${i}" value="${assetNames[i]}">
                    </div>
                </div>`;
            }
            
            assetInputsHTML += '</div>';
            assetInputsDiv.innerHTML = assetInputsHTML;
            
            // Set returns vector
            returnsMatrixInput.value = avgReturns.join(', ');
            
            // Set covariance matrix
            let covarianceStr = '';
            for (let i = 0; i < covMatrix.length; i++) {
                covarianceStr += covMatrix[i].join(', ');
                if (i < covMatrix.length - 1) covarianceStr += '\n';
            }
            covarianceMatrixInput.value = covarianceStr;
            
            returnsMatrixContainer.style.display = 'block';
            covarianceMatrixContainer.style.display = 'block';
            
            // Switch to manual input tab to show the data
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            document.querySelector('.tab[data-tab="manual-input"]').classList.add('active');
            document.getElementById('manual-input').classList.add('active');
            
            showAlert('Data successfully processed from CSV file', 'success');
            
        } catch (error) {
            console.error(error);
            showAlert('Error processing CSV file. Please check the format.');
        }
    };
    reader.readAsText(file);
});

// Optimize portfolio
optimizeBtn.addEventListener('click', () => {
    try {
        // Show loader
        loader.style.display = 'block';
        
        // Get input data
        const assets = [];
        const numAssets = parseInt(numAssetsInput.value);
        
        for (let i = 0; i < numAssets; i++) {
            const assetInput = document.getElementById(`asset${i}`);
            if (assetInput) {
                assets.push(assetInput.value);
            } else {
                assets.push(`Asset ${i + 1}`);
            }
        }
        
        // Parse returns
        const returnsStr = returnsMatrixInput.value;
        const returns = returnsStr.split(',').map(r => parseFloat(r.trim()));
        
        if (returns.length !== numAssets || returns.some(isNaN)) {
            showAlert('Invalid returns vector format');
            loader.style.display = 'none';
            return;
        }
        
        // Parse covariance matrix
        const covarianceStr = covarianceMatrixInput.value;
        const covRows = covarianceStr.split('\n');
        const covariance = [];
        
        for (let i = 0; i < covRows.length; i++) {
            const row = covRows[i].split(',').map(c => parseFloat(c.trim()));
            if (row.length !== numAssets || row.some(isNaN)) {
                showAlert('Invalid covariance matrix format');
                loader.style.display = 'none';
                return;
            }
            covariance.push(row);
        }
        
        if (covariance.length !== numAssets) {
            showAlert('Covariance matrix dimensions do not match number of assets');
            loader.style.display = 'none';
            return;
        }
        
        // Get prior strength and risk aversion parameters
        const priorStrength = document.getElementById('priorStrength').value / 100;
        const riskAversion = document.getElementById('riskAversion').value;
        
        // Simulate delay for calculation (in real app, this would be actual calculation time)
        setTimeout(() => {
            // Run Bayesian optimization
            const bayesianResult = runBayesianOptimization(assets, returns, covariance, priorStrength, riskAversion);
            
            // Update UI with results
            updateResults(bayesianResult);
            
            // Hide loader
            loader.style.display = 'none';
            
            // Show results section
            resultsSection.style.display = 'block';
            
            // Hide comparison section
            portfolioComparison.style.display = 'none';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
        
    } catch (error) {
        console.error(error);
        showAlert('Error in optimization: ' + error.message);
        loader.style.display = 'none';
    }
});

// Compare with traditional portfolio optimization
compareBtn.addEventListener('click', () => {
    try {
        // Show loader
        loader.style.display = 'block';
        
        // Get input data
        const assets = [];
        const numAssets = parseInt(numAssetsInput.value);
        
        for (let i = 0; i < numAssets; i++) {
            const assetInput = document.getElementById(`asset${i}`);
            if (assetInput) {
                assets.push(assetInput.value);
            } else {
                assets.push(`Asset ${i + 1}`);
            }
        }
        
        // Parse returns
        const returnsStr = returnsMatrixInput.value;
        const returns = returnsStr.split(',').map(r => parseFloat(r.trim()));
        
        if (returns.length !== numAssets || returns.some(isNaN)) {
            showAlert('Invalid returns vector format');
            loader.style.display = 'none';
            return;
        }
        
        // Parse covariance matrix
        const covarianceStr = covarianceMatrixInput.value;
        const covRows = covarianceStr.split('\n');
        const covariance = [];
        
        for (let i = 0; i < covRows.length; i++) {
            const row = covRows[i].split(',').map(c => parseFloat(c.trim()));
            if (row.length !== numAssets || row.some(isNaN)) {
                showAlert('Invalid covariance matrix format');
                loader.style.display = 'none';
                return;
            }
            covariance.push(row);
        }
        
        if (covariance.length !== numAssets) {
            showAlert('Covariance matrix dimensions do not match number of assets');
            loader.style.display = 'none';
            return;
        }
        
        // Get prior strength and risk aversion parameters
        const priorStrength = document.getElementById('priorStrength').value / 100;
        const riskAversion = document.getElementById('riskAversion').value;
        
        // Simulate delay for calculation (in real app, this would be actual calculation time)
        setTimeout(() => {
            // Run Bayesian optimization
            const bayesianResult = runBayesianOptimization(assets, returns, covariance, priorStrength, riskAversion);
            
            // Run traditional optimization
            const traditionalResult = runTraditionalOptimization(assets, returns, covariance, riskAversion);
            
            // Update UI with results
            updateResults(bayesianResult);
            updateComparisonResults(bayesianResult, traditionalResult);
            
            // Hide loader
            loader.style.display = 'none';
            
            // Show results section and comparison section
            resultsSection.style.display = 'block';
            portfolioComparison.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
        
    } catch (error) {
        console.error(error);
        showAlert('Error in comparison: ' + error.message);
        loader.style.display = 'none';
    }
});

// Reset form
resetBtn.addEventListener('click', () => {
    // Reset form inputs
    numAssetsInput.value = 3;
    assetInputsDiv.innerHTML = '';
    returnsMatrixInput.value = '';
    covarianceMatrixInput.value = '';
    document.getElementById('priorStrength').value = 50;
    document.getElementById('riskAversion').value = 4;
    
    // Reset file input
    csvFileInput.value = '';
    
    // Hide containers
    returnsMatrixContainer.style.display = 'none';
    covarianceMatrixContainer.style.display = 'none';
    
    // Hide results
    resultsSection.style.display = 'none';
    portfolioComparison.style.display = 'none';
    
    // Reset tab to manual input
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelector('.tab[data-tab="manual-input"]').classList.add('active');
    document.getElementById('manual-input').classList.add('active');
});

// Utility function to show alerts
function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    
    if (type === 'error') {
        alertBox.style.backgroundColor = '#f8d7da';
        alertBox.style.color = '#721c24';
    } else if (type === 'success') {
        alertBox.style.backgroundColor = '#d4edda';
        alertBox.style.color = '#155724';
    } else if (type === 'warning') {
        alertBox.style.backgroundColor = '#fff3cd';
        alertBox.style.color = '#856404';
    }
    
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

// Bayesian Portfolio Optimization Calculation
function runBayesianOptimization(assets, returns, covariance, priorStrength, riskAversion) {
    const numAssets = assets.length;
    
    // Define prior distributions
    const priorReturns = Array(numAssets).fill(0).map(() => 8 + Math.random() * 2); // Prior returns around 8-10%
    const priorWeights = Array(numAssets).fill(1 / numAssets); // Equal weights prior
    
    // Update priors with historical data (if applicable)
    const updatedReturns = updatePriorsWithData(returns, priorReturns, priorStrength);
    const updatedCovariance = updateCovarianceWithData(covariance, priorStrength);
    
    // Calculate posterior predictive distribution
    const posteriorPredictive = calculatePosteriorPredictive(updatedReturns, updatedCovariance);
    
    // Optimize using posterior predictive distribution
    const result = optimizeUsingPosteriorPredictive(posteriorPredictive, riskAversion);
    
    // Calculate metrics for the optimized portfolio
    const weights = result.weights;
    const expectedReturn = weights.reduce((sum, w, i) => sum + w * updatedReturns[i], 0);
    
    let portfolioRisk = 0;
    for (let i = 0; i < numAssets; i++) {
        for (let j = 0; j < numAssets; j++) {
            portfolioRisk += weights[i] * weights[j] * updatedCovariance[i][j];
        }
    }
    portfolioRisk = Math.sqrt(portfolioRisk);
    
    const riskFreeRate = 2.0; // Assumed risk-free rate (%)
    const sharpeRatio = (expectedReturn - riskFreeRate) / portfolioRisk;
    
    // Calculate contribution to risk and return for each asset
    const contributionToReturn = weights.map((w, i) => w * updatedReturns[i]);
    const contributionToRisk = [];
    
    for (let i = 0; i < numAssets; i++) {
        let contribution = 0;
        for (let j = 0; j < numAssets; j++) {
            contribution += weights[j] * updatedCovariance[i][j];
        }
        contributionToRisk.push(weights[i] * contribution / portfolioRisk);
    }
    
    // Generate efficient frontier points for visualization
    const frontierPoints = generateEfficientFrontier(updatedReturns, updatedCovariance);
    
    // Create stability analysis (sensitivity to input parameters)
    const stabilityAnalysis = analyzeStability(updatedReturns, updatedCovariance, weights, riskAversion);
    
    // Calculate posterior probability (simplified metric between 0-1)
    const posteriorProb = 0.75 + 0.25 * (1 - Math.exp(-stabilityAnalysis.averageStability));
    
    return {
        assets,
        weights,
        expectedReturn,
        portfolioRisk,
        sharpeRatio,
        posteriorProb,
        contributionToReturn,
        contributionToRisk,
        updatedReturns,
        updatedCovariance,
        frontierPoints,
        stabilityAnalysis
    };
}

// Helper functions to update priors and calculate posterior predictive distribution
function updatePriorsWithData(returns, priorReturns, priorStrength) {
    return returns.map((r, i) => r * (1 - priorStrength) + priorReturns[i] * priorStrength);
}

function updateCovarianceWithData(covariance, priorStrength) {
    const updatedCovariance = [];
    for (let i = 0; i < covariance.length; i++) {
        updatedCovariance[i] = [];
        for (let j = 0; j < covariance[i].length; j++) {
            if (i === j) {
                updatedCovariance[i][j] = covariance[i][j];
            } else {
                updatedCovariance[i][j] = covariance[i][j] * (1 - priorStrength * 0.5);
            }
        }
    }
    return updatedCovariance;
}

function calculatePosteriorPredictive(returns, covariance) {
    // Simplified version of posterior predictive distribution calculation
    return {
        mean: returns,
        covariance: covariance
    };
}

function optimizeUsingPosteriorPredictive(posteriorPredictive, riskAversion) {
    // Use the posterior predictive distribution for optimization
    return optimizePortfolio(posteriorPredictive.mean, posteriorPredictive.covariance, riskAversion);
}

// Traditional Portfolio Optimization Calculation
function runTraditionalOptimization(assets, returns, covariance, riskAversion) {
    const numAssets = assets.length;
    
    // Calculate mean-variance optimization
    const result = optimizePortfolio(returns, covariance, riskAversion);
    
    // Calculate metrics for the optimized portfolio
    const weights = result.weights;
    const expectedReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0);
    
    let portfolioRisk = 0;
    for (let i = 0; i < numAssets; i++) {
        for (let j = 0; j < numAssets; j++) {
            portfolioRisk += weights[i] * weights[j] * covariance[i][j];
        }
    }
    portfolioRisk = Math.sqrt(portfolioRisk);
    
    const riskFreeRate = 2.0; // Assumed risk-free rate (%)
    const sharpeRatio = (expectedReturn - riskFreeRate) / portfolioRisk;
    
    return {
        assets,
        weights,
        expectedReturn,
        portfolioRisk,
        sharpeRatio
    };
}

// Mean-Variance Optimization Algorithm
function optimizePortfolio(returns, covariance, riskAversion) {
    const numAssets = returns.length;
    
    // Initial guess: equal weights
    let weights = Array(numAssets).fill(1 / numAssets);
    
    // Define objective function: maximize utility (return - risk penalty)
    const objective = (w) => {
        let portReturn = 0;
        for (let i = 0; i < numAssets; i++) {
            portReturn += w[i] * returns[i] / 100; // Convert percentage to decimal
        }
        
        let portRisk = 0;
        for (let i = 0; i < numAssets; i++) {
            for (let j = 0; j < numAssets; j++) {
                portRisk += w[i] * w[j] * covariance[i][j] / 10000; // Convert to decimal (assuming input is in % squared)
            }
        }
        
        return -(portReturn - (riskAversion / 2) * portRisk);
    };
    
    // Simple gradient descent optimization
    const learningRate = 0.01;
    const iterations = 2000;
    
    for (let iter = 0; iter < iterations; iter++) {
        // Calculate gradient numerically
        const gradient = [];
        const h = 0.0001; // Small perturbation
        
        for (let i = 0; i < numAssets; i++) {
            const perturbed = [...weights];
            perturbed[i] += h;
            
            // Normalize perturbed weights
            const sum = perturbed.reduce((a, b) => a + b, 0);
            for (let j = 0; j < numAssets; j++) {
                perturbed[j] /= sum;
            }
            
            // Calculate finite difference
            const f1 = objective(weights);
            const f2 = objective(perturbed);
            gradient[i] = (f2 - f1) / h;
        }
        
        // Update weights
        for (let i = 0; i < numAssets; i++) {
            weights[i] -= learningRate * gradient[i];
            // Ensure non-negative weights
            weights[i] = Math.max(0, weights[i]);
        }
        
        // Normalize weights to sum to 1
        const sum = weights.reduce((a, b) => a + b, 0);
        for (let i = 0; i < numAssets; i++) {
            weights[i] /= sum;
        }
    }
    
    return { weights };
}

// Generate points on the efficient frontier
function generateEfficientFrontier(returns, covariance) {
    const points = [];
    const numPoints = 20;
    
    for (let i = 0; i < numPoints; i++) {
        const riskAversion = 1 + i * 1.5; // Range from 1 to 30
        
        const result = optimizePortfolio(returns, covariance, riskAversion);
        const weights = result.weights;
        
        const expectedReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0);
        
        let portfolioRisk = 0;
        for (let i = 0; i < returns.length; i++) {
            for (let j = 0; j < returns.length; j++) {
                portfolioRisk += weights[i] * weights[j] * covariance[i][j];
            }
        }
        portfolioRisk = Math.sqrt(portfolioRisk);
        
        points.push({ risk: portfolioRisk, return: expectedReturn });
    }
    
    // Sort points by risk
    points.sort((a, b) => a.risk - b.risk);
    
    return points;
}

// Analyze portfolio stability
function analyzeStability(returns, covariance, weights, riskAversion) {
    const numAssets = returns.length;
    const perturbationSize = 0.1; // 10% perturbation
    const numIterations = 10;
    
    const weightStabilities = Array(numAssets).fill(0);
    const returnPerturbations = [];
    const riskPerturbations = [];
    
    for (let iter = 0; iter < numIterations; iter++) {
        const perturbedReturns = returns.map(r => r * (1 + (Math.random() * 2 - 1) * perturbationSize));
        
        const perturbedCovariance = [];
        for (let i = 0; i < numAssets; i++) {
            perturbedCovariance[i] = [];
            for (let j = 0; j < numAssets; j++) {
                if (i === j) {
                    perturbedCovariance[i][j] = covariance[i][j] * (1 + Math.random() * perturbationSize);
                } else {
                    const stdDev_i = Math.sqrt(covariance[i][i]);
                    const stdDev_j = Math.sqrt(covariance[j][j]);
                    const corr = covariance[i][j] / (stdDev_i * stdDev_j);
                    
                    const newCorr = Math.max(-0.99, Math.min(0.99, corr * (1 + (Math.random() * 2 - 1) * perturbationSize * 0.5)));
                    perturbedCovariance[i][j] = newCorr * Math.sqrt(perturbedCovariance[i][i] * perturbedCovariance[j][j]);
                }
            }
        }
        
        const result = optimizePortfolio(perturbedReturns, perturbedCovariance, riskAversion);
        const newWeights = result.weights;
        
        for (let i = 0; i < numAssets; i++) {
            weightStabilities[i] += Math.abs(weights[i] - newWeights[i]);
        }
        
        const expectedReturn = newWeights.reduce((sum, w, i) => sum + w * perturbedReturns[i], 0);
        
        let portfolioRisk = 0;
        for (let i = 0; i < numAssets; i++) {
            for (let j = 0; j < numAssets; j++) {
                portfolioRisk += newWeights[i] * newWeights[j] * perturbedCovariance[i][j];
            }
        }
        portfolioRisk = Math.sqrt(portfolioRisk);
        
        returnPerturbations.push(expectedReturn);
        riskPerturbations.push(portfolioRisk);
    }
    
    for (let i = 0; i < numAssets; i++) {
        weightStabilities[i] = 1 - (weightStabilities[i] / numIterations);
    }
    
    const averageStability = weightStabilities.reduce((a, b) => a + b, 0) / numAssets;
    
    return {
        weightStabilities,
        averageStability,
        returnPerturbations,
        riskPerturbations
    };
}

// Update UI with optimization results
function updateResults(result) {
    // Format percentages
    const expectedReturn = result.expectedReturn.toFixed(2) + '%';
    const portfolioRisk = result.portfolioRisk.toFixed(2) + '%';
    const sharpeRatio = result.sharpeRatio.toFixed(2);
    const posteriorProb = (result.posteriorProb * 100).toFixed(1) + '%';
    
    // Update metrics
    document.getElementById('expectedReturn').textContent = expectedReturn;
    document.getElementById('portfolioRisk').textContent = portfolioRisk;
    document.getElementById('sharpeRatio').textContent = sharpeRatio;
    document.getElementById('posteriorProb').textContent = posteriorProb;
    
    // Update weights table
    const tableBody = document.getElementById('weightsTable').querySelector('tbody');
    tableBody.innerHTML = '';
    
    for (let i = 0; i < result.assets.length; i++) {
        const row = document.createElement('tr');
        
        // Format with 2 decimal places and percentage
        const weightPct = (result.weights[i] * 100).toFixed(2) + '%';
        const returnContribPct = result.contributionToReturn[i].toFixed(2) + '%';
        const riskContribPct = result.contributionToRisk[i].toFixed(2) + '%';
        
        row.innerHTML = `
            <td>${result.assets[i]}</td>
            <td>${weightPct}</td>
            <td>${returnContribPct}</td>
            <td>${riskContribPct}</td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Update allocation chart
    const ctx1 = document.getElementById('allocationChart').getContext('2d');
    
    if (allocationChart) {
        allocationChart.destroy();
    }
    
    allocationChart = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: result.assets,
            datasets: [{
                data: result.weights.map(w => w * 100),
                backgroundColor: [
                    '#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6',
                    '#1abc9c', '#e67e22', '#34495e', '#d35400', '#c0392b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Portfolio Allocation',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw.toFixed(2) + '%';
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        }
    });
    
    // Update efficient frontier chart
    const ctx2 = document.getElementById('efficientFrontierChart').getContext('2d');
    
    if (efficientFrontierChart) {
        efficientFrontierChart.destroy();
    }
    
    // Prepare data for efficient frontier
    efficientFrontierChart = new Chart(ctx2, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Efficient Frontier',
                    data: result.frontierPoints.map(p => ({ x: p.risk, y: p.return })),
                    showLine: true,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    fill: false,
                    pointRadius: 3,
                    pointBackgroundColor: '#3498db'
                },
                {
                    label: 'Optimal Portfolio',
                    data: [{ x: result.portfolioRisk, y: result.expectedReturn }],
                    pointRadius: 8,
                    pointBackgroundColor: '#e74c3c'
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
                            const dataset = context.dataset.label;
                            const risk = context.parsed.x.toFixed(2) + '%';
                            const ret = context.parsed.y.toFixed(2) + '%';
                            return `${dataset}: Risk ${risk}, Return ${ret}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Portfolio Risk (Volatility)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '%';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Expected Return'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}