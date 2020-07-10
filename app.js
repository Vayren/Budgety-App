
//BUDGET CONTROLLER
var budgetController = (function () {
    
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPersentages = function (totalIncome) {
        
        if(totalIncome > 0) this.percentage = ((this.value / totalIncome) * 100).toFixed(1);
        else this.percentage = -1;

    };

    Expense.prototype.getPersentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(item){
            sum += item.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }
            //Create new item based on 'inc' or 'exp' type
            newItem = type === 'exp' ? new Expense(ID, des, val) : new Income(ID, des, val);

            //Push it into out data structure
            data.allItems[type].push(newItem);

            //Return the new item
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (item) {
                return item.id;
            });

            index = ids.indexOf(id);
            if(index !== -1) data.allItems[type].splice(index, 1);
        },

        calculateBudget: function() {

            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //Calculate the budget: income - expenses

            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = ((data.totals.exp / data.totals.inc) * 100).toFixed(1);
            }else {
                data.percentage = -1;
            }
        },
        
        calculatePersentages: function () {
            
            data.allItems.exp.forEach(function(item) {
                item.calcPersentages(data.totals.inc);
            })
        },

        getPersentages: function () {
            
            return data.allItems.exp.map(function (item) {
                return item.getPersentage();
            });

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        }   
    }


})();

//UI CONTROLLER
var UIController = (function () {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPersLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function (num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = (parseInt(int) / 1000).toFixed(3).replace('.', ',');
        }

        dec = numSplit[1];

        return  (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for(var i = 0;i < list.length;i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        deleteListItem: function(selectorID) {
            document.getElementById(selectorID).remove();
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (item) {
                item.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            type = obj.budget > 0 ? 'inc' : 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPersentages: function (percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPersLabel);

            nodeListForEach(fields, function (item, index) {

                if(percentages[index] > 0){
                    item.textContent = percentages[index] + '%';
                } else {
                    item.textContent = '---';
                }

            });

        },

        displayMonth: function () {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ', ' + year;

        },

        changedType: function () {
            
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function (item) {
                item.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },

        getDOMStrings: function () {
            return DOMStrings;
        },
    }

})();


//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        //1. Calculate the budget

        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var ubdatePersentages = function () {
        var percentages;

        //1. Calculate persentages
        budgetCtrl.calculatePersentages();

        //2. Read persentages from the budget controller
        percentages = budgetCtrl.getPersentages();

        //3. Update the UI with the new persentages
        UICtrl.displayPersentages(percentages);
    }

    var ctrlAddItem = function () {
        var input, newItem;

         //1. Get the field input data
        input = UICtrl.getInput();
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {

            //2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
            //3. Add the item to the UI 
            UICtrl.addListItem(newItem, input.type);
            
            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update the persentages
            ubdatePersentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. Calculate and update the persentages
            ubdatePersentages();
        }
    };

    return {
        init: function () {
            console.log("App has started");
            UICtrl.displayMonth();
            UICtrl.displayBudget(budgetCtrl.getBudget());
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();
