var budgetontroller = (function(){

    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){

        if (totalIncome > 0 ){
            this.percentage = Math.round((this.value/totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = (type)=>{

        data.totals[type] = data.allItems[type].reduce((a,element) => a + element.value, 0)
        
    }


    let data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1

    }

    return{
        addItem: (type, des, val)=>{
            let newItem, ID;
            
            //Create New ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            

            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type ==='inc'){
                newItem = new Income(ID, des, val);
            }
            // push it into the new data structure
            data.allItems[type].push(newItem);
            // data['allItems'][type].push(newItem);

            //returrn the new element
            return newItem;
            
        },

        deleteItem: (type, id) =>{
            let ids, index
            // data.allItems[type] = data.allItems[type].filter((amount) => amount.id !== ID)
            // console.log(data.allItems[type])
            ids = data.allItems[type].map((current) => current.id);
            index = ids.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index,1);  //to remove item
            }
            



        },
        
        calculateBudget: () =>{
            //Calculate total income and expanses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget: income-expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            data.totals.inc > 0  ?
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            :
                data.percentage = -1;

        },

        getBudget: () =>{
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }

        },

        calculatePercentage: () =>{
          
            data.allItems.exp.forEach((element) => {
                element.calcPercentage(data.totals.inc)
            });

        },

        getPercentages: () =>{
           
            let allPercentage;
            allPercentage = data.allItems.exp.map((element) => element.getPercentage())
            return allPercentage
        },
        

        testing: ()=>{
            console.log(data);
            data.totals.exp =  data.allItems.exp.reduce((a,amount) =>a+amount.value,0);
            data.totals.inc = data.allItems.inc.reduce((a,amount) =>a+amount.value, 0);
            console.log(`The total is ${data.totals.inc-data.totals.exp}`);
        }

    
        

    }

})();



let UIController = (function(){
    
    let DOMstrings = {
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
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'


    }

    let formatNumber = (num, type) =>{
        // + or - befoere the number


        // exactly 2 decimal points


        // comma separating the thousands

        let numSplit, dec


        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        // int = numSplit[0];
        // if (int.length > 3){
        //     int = int.substr(0, int.length - 3) + ',' +int.substr(1, 3);
        // }




        dec = numSplit[1];

        

        let reversedNum = numSplit[0].split("").reverse()

        let commaLocation = [...Array(reversedNum.length).keys()].filter( (element) => element%3 === 0 && element !== 0);

        
        for(let i=0; i < commaLocation.length; i++){
            reversedNum.splice(commaLocation[i]+i, 0, ',');

        }

        let ans = reversedNum.reverse().join("");

        if (type === 'inc'){
            return '+ ' + ans +'.'+dec;
        }else if( type ==='exp'){
            return '- ' + ans +'.'+dec;
        }
    
    };

    let nodeListForEach = (list, callback) => {
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    
    return{
        getInput: () =>{
            return{
                type: document.querySelector(DOMstrings.inputType).value,//either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        getDOMStrings:()=>{
            return DOMstrings;
        },

        addListItem: (obj,type)=>{
            let html, newHtml, element;
            // Create html string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace the palceholder text the actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: (selectorID) =>{
            let element;
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);


        },

        clearfields: () => {
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(element => {
                element.value = "";
                
            });

            fieldsArr[0].focus();

        },
        displayBudget: (obj) => {
            let type
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            obj.percentage > 0?
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'
            :
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';


        },
        displayPercentages: (percentages)=>{
            
            let fields
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, (current, index)=>{

                if(percentages[index] > 0)
                {
                    current.textContent = percentages[index] + '%';
                }
                else
                {
                    current.textContent = '---' 
                }

                

            });

        },
        displayMonth: () =>{
            let now, year, month, months

            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },
        changeType: () =>{

            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields, (cur) =>{ cur.classList.toggle('red-focus');
                
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    }
})();



let controller = (function(budgetCtrl,UICtrl){

    let setupEventListeners = () =>{
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',(event)=>{
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    let updateBudget = ()=>{
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();
        
                
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget)
    };

    let updatePercentages = () => {

        //1. Calculate the percentages
        budgetCtrl.calculatePercentage();

        

        //2. read them from the budget controller
        let percentages = budgetCtrl.getPercentages();

        //3. Update the user interface with the new perrcentages
        UICtrl.displayPercentages(percentages);

    };

    let ctrlAddItem = function(){
        let input, newItem
        // 1. Get the filed input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
            // 2. Add the item to the biudget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearfields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();
        }

    };

    let ctrlDeleteItem = (event) =>{
        let itemID, spliteID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            spliteID = itemID.split('-');
            type = spliteID[0];
            ID = parseInt(spliteID[1]);

            //1. delete item from the data structure
            budgetCtrl.deleteItem(type, ID);


            // 2. delete item from the user interface
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();


        }

    }

    return{
        init: ()=>{
            console.log('App has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            UICtrl.displayMonth();
            setupEventListeners();
            

        }
    };
    



})(budgetontroller,UIController);

controller.init();

