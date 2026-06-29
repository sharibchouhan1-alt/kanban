/* ==========================================
   1. GLOBAL APPLICATION STATE
   ========================================== */
let transactionStateArray = [];
let globalIndexCounter = 0;
let currentActiveEditId = null;

/* ==========================================
   2. UI FORM COMPONENT WORKFLOWS
   ========================================== */

/**
 * Evaluates the selected transaction type category and updates the DOM 
 * disabled properties on corresponding control triggers.
 */
const updateButtonDisableStates = function() {
    const selectedCategoryType = document.querySelector("#category").value; 

    if (selectedCategoryType === "income") {
        document.querySelector("#btn-expense").disabled = true;
        document.querySelector("#btn-income").disabled = false;
        console.log("Income category selected: Income validation button unlocked.");
    } else if (selectedCategoryType === "expense") {
        document.querySelector("#btn-expense").disabled = false;
        document.querySelector("#btn-income").disabled = true;
        console.log("Expense category selected: Expense validation button unlocked.");
    } else {
        document.querySelector("#btn-expense").disabled = true;
        document.querySelector("#btn-income").disabled = true;
    }
};

/**
 * Resets the value of all form field input elements in the DOM.
 */
function clearFormInputs() {
    document.querySelector("#desc").value = "";
    document.querySelector("#amount").value = "";
    document.querySelector('#category').value = "";
}

/* ==========================================
   3. EVENT LISTENERS & ROUTERS
   ========================================== */

// Watch for manual adjustments to the category selection dropdown list element
document.querySelector('#category').addEventListener('change', updateButtonDisableStates);

// Main click interaction transaction submission processor
document.querySelector("#prntbtn").addEventListener('click', function(event) {
    const enteredDescription = document.querySelector("#desc").value.trim();
    const enteredAmount = document.querySelector("#amount").value.trim();
    const selectedCategoryType = document.querySelector('#category').value;

    console.log("Processing input amount:", enteredAmount);
    console.log("Processing input category type:", selectedCategoryType);

    // Route processing to either update runtime states or push fresh instances
    let executionUpdateResultId = processRowUpdate(); 
    
    if (executionUpdateResultId != null) {
        currentActiveEditId = null; 
        renderCompleteTransactionTable();             
    } else {
        let newTransactionObject = {
            id: Date.now().toString(), 
            description: enteredDescription,
            amnt: enteredAmount,
            type: selectedCategoryType,
            indx: globalIndexCounter
        };
        
        console.log("Creating new tracking object:", newTransactionObject);
        transactionStateArray.push(newTransactionObject);
        
        // Target structural assignment index from newly added item location boundaries
        appendRowToTable(newTransactionObject.id, transactionStateArray.length - 1); 
        globalIndexCounter++;
    }

    // Refresh targeted metric readouts dynamically according to target source triggers
    if (event.target.id === "btn-income") {
       let targetIncomeElement = document.querySelector("#total-income");
       targetIncomeElement.textContent = `₹${calculateTotalIncome()}`;
    }
    
    if (event.target.id === "btn-expense") {
        let targetExpenseElement = document.querySelector("#total-expenses");
        targetExpenseElement.textContent = `₹${calculateTotalExpenses()}`;
    }

    // Sanitize user inputs and reset button layout states
    clearFormInputs();

    let runtimeCalculatedBalance = calculateCurrentBalance();
    let targetBalanceElement = document.querySelector("#current-balance");
    targetBalanceElement.textContent = `₹${runtimeCalculatedBalance}`;
    
    updateButtonDisableStates(); 
});

/* ==========================================
   4. CORE MATHEMATICAL BUSINESS LOGIC
   ========================================== */

/**
 * Reduces transaction arrays down to calculate aggregations for income models.
 */
function calculateTotalIncome() {
    return transactionStateArray.reduce(function(accumulator, evaluationElement) {
        if (evaluationElement.type === "income") {
             return parseFloat(evaluationElement.amnt) + accumulator;
        }
        return accumulator;
    }, 0);
}

/**
 * Reduces transaction arrays down to calculate aggregations for expense models.
 */
function calculateTotalExpenses() {
    return transactionStateArray.reduce(function(accumulator, evaluationElement) {
        if (evaluationElement.type === "expense") {
            return parseFloat(evaluationElement.amnt) + accumulator;
        }
        return accumulator;
    }, 0);
}

/**
 * Evaluates the net relational metric values between income pools and asset loss vectors.
 */
function calculateCurrentBalance() {
    return calculateTotalIncome() - calculateTotalExpenses();
}

/* ==========================================
   5. DATA MANIPULATION & STATE MODIFIERS
   ========================================== */

/**
 * Targets specific elements in state cache to load matching data fields directly back into DOM forms.
 */
function editTransactionRow(targetRowId) {
    let matchedTransactionObject = transactionStateArray.find(function(evaluationElement) {
       return evaluationElement.id == targetRowId;
    });

    if (matchedTransactionObject) {
        currentActiveEditId = matchedTransactionObject.id;

        document.querySelector("#desc").value = matchedTransactionObject.description;
        document.querySelector("#amount").value = matchedTransactionObject.amnt;
        document.querySelector('#category').value = matchedTransactionObject.type;
        
        updateButtonDisableStates(); 
    }
}

/**
 * Iterates through historical array indexes to apply user changes to historical properties.
 */
function processRowUpdate() {
    const contextualDescriptionValue = document.querySelector("#desc").value.trim();
    const contextualAmountValue = document.querySelector("#amount").value.trim();
    const contextualCategoryTypeValue = document.querySelector('#category').value;
    
    if (currentActiveEditId != null) {
       let targetedModifiableObject = transactionStateArray.find(function(evaluationElement) {
            return evaluationElement.id == currentActiveEditId;
       });
        
       if (targetedModifiableObject) {
            targetedModifiableObject.description = contextualDescriptionValue;
            targetedModifiableObject.amnt = contextualAmountValue;
            targetedModifiableObject.type = contextualCategoryTypeValue;
            return currentActiveEditId;
       }
    }
    return null;
}

/**
 * Filters out targeted unique key parameters from primary data caches.
 */
function deleteTransactionObject(targetDeletionId) {
    console.log("Removing transaction target mapping for ID:", targetDeletionId);
    transactionStateArray = transactionStateArray.filter(function(evaluationElement) {
        return evaluationElement.id != targetDeletionId;
    });
    
    console.log("Updated data array layout structure:", transactionStateArray);
    renderCompleteTransactionTable();
}

/* ==========================================
   6. DOM UI VIEW LAYOUT COMPONENT RENDERS
   ========================================== */

/**
 * Appends a singular individual HTML row projection straight into the visible UI table structure.
 */
function appendRowToTable(uniqueId, functionalArrayPositionIndex) {
    console.log(transactionStateArray[functionalArrayPositionIndex]);
    let targetAccessObject = transactionStateArray[functionalArrayPositionIndex];
    let presentationTableBodyContainer = document.querySelector("#transaction-list");
    
    presentationTableBodyContainer.innerHTML += `
    <tr>
        <td>${targetAccessObject.description}</td>
        <td>${targetAccessObject.type}</td>
        <td>₹${targetAccessObject.amnt}</td>
        <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary me-2 edit-btn" data-id="${targetAccessObject.id}" onclick="editTransactionRow('${targetAccessObject.id}')">
                <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${targetAccessObject.id}" onclick="deleteTransactionObject(this.dataset.id)">
                <i class="bi bi-trash"></i> Delete
            </button>
        </td>
    </tr>`;
}

/**
 * Completely clears visible interface layout nodes to perform full synchronization updates across all dataset rows.
 */
function renderCompleteTransactionTable() {
    let presentationTableBodyContainer = document.querySelector("#transaction-list");
    presentationTableBodyContainer.innerHTML = "";
    
    transactionStateArray.forEach(loopIterationElement => {
        presentationTableBodyContainer.innerHTML += `
        <tr>
            <td>${loopIterationElement.description}</td>
            <td>${loopIterationElement.type}</td>
            <td>₹${loopIterationElement.amnt}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary me-2 edit-btn" data-id="${loopIterationElement.id}" onclick="editTransactionRow('${loopIterationElement.id}')">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${loopIterationElement.id}" onclick="deleteTransactionObject(this.dataset.id)">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        </tr>`;
    });

    document.querySelector("#total-income").textContent = `₹${calculateTotalIncome()}`;
    document.querySelector("#total-expenses").textContent = `₹${calculateTotalExpenses()}`;
    document.querySelector("#current-balance").textContent = `₹${calculateCurrentBalance()}`;
    
    clearFormInputs();
    updateButtonDisableStates(); 
}