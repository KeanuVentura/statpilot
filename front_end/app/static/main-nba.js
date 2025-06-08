
document.addEventListener("DOMContentLoaded", event=>{
    const form = document.querySelector('form');
    
    // ADD THE CUSTOM DROPDOWN CODE HERE, RIGHT AFTER DOMCONTENTLOADED STARTS
    // Custom dropdown implementation for Mac compatibility
    const selects = document.querySelectorAll('.form-select');
    
    selects.forEach(select => {
        // Create a wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        
        // Create a custom select
        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';
        wrapper.appendChild(customSelect);
        
        // Create the selected display
        const selectedDisplay = document.createElement('div');
        selectedDisplay.className = 'custom-select-selected';
        selectedDisplay.textContent = select.options[select.selectedIndex]?.textContent || 'Select an option';
        customSelect.appendChild(selectedDisplay);
        
        // Create the options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-select-options';
        optionsContainer.style.display = 'none';
        customSelect.appendChild(optionsContainer);
        
        // Add options to the container
        Array.from(select.options).forEach((option, index) => {
            const customOption = document.createElement('div');
            customOption.className = 'custom-select-option';
            customOption.textContent = option.textContent;
            customOption.dataset.value = option.value;
            customOption.addEventListener('click', function() {
                select.selectedIndex = index;
                selectedDisplay.textContent = option.textContent;
                optionsContainer.style.display = 'none';
                
                // Trigger change event on the original select
                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
            });
            optionsContainer.appendChild(customOption);
        });
        
        // Toggle options display on click
        selectedDisplay.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = optionsContainer.style.display === 'block';
            
            // Close all other select dropdowns
            document.querySelectorAll('.custom-select-options').forEach(container => {
                container.style.display = 'none';
            });
            
            optionsContainer.style.display = isOpen ? 'none' : 'block';
        });
        
        // Hide the original select
        select.style.display = 'none';
    });
    
    // Close all dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.custom-select-options').forEach(container => {
            container.style.display = 'none';
        });
    });

     form.addEventListener("submit", (event)=>{
        event.preventDefault();// preventing reloading bc its annoying LOL
        const opponent = document.getElementById('opponent').value;
        const searchType = document.getElementById('type').value;
        const stat_line = document.getElementById('stat_line').value;
        const player = document.getElementById('player').value;   
      


        if (!searchType) {
            alert('Please select a search type.');
            return;
        }

       /* if (!searchQuery) {
            alert('Please select a search type.');
            return;
        }*/

    send_to_function(opponent, searchType, stat_line,player);
    });
    
   
    
});

function send_to_function(opponent, searchType, stat_line,player) {
    //event.preventDefault();

    let results = document.getElementById("results");
    results.innerHTML = "";

    let data = {
        opponent: opponent,
        type: searchType,
        stat_line: stat_line,
        player,player


    };

//---------------------------------------------//


//-----------------------------------------------//
    fetch("/input", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" // Send data as JSON
        },
        body: JSON.stringify(data) // Convert the data object to JSON string
    })
    .then(response => response.json())
    .then(result => {
        console.log("Response from backend:", result);
     
        const container = document.getElementById('chartContainer');
        container.innerHTML = '';
        show_chart(container, result.prob_under,result.prob_over);
        
        
            
        // Create the table element here instead
        let table = document.createElement("table");
        
        const stats = [
      
            ["Opponent Average", result.opponent_avg],
            ["Recent Average", result.recent_avg],
            ["Season Average", result.season_avg],
            ["Probability Over", result.prob_over],
            ["Probability Under", result.prob_under],
            ["Note", result.note]
        ];
    
        stats.forEach(([label, value]) => {
            let row = document.createElement("tr");
            row.classList.add("stat-result");
            row.innerHTML = `
               <td class="stat-label" style="color: white;">${label}:</td>
               <td class="stat-value" style="color: white;">${value}</td>
            `;
            table.appendChild(row);
        });
        
        // Now append the complete table to results
        results.appendChild(table);
        console.log("under append child");
        console.log(result.prob_over);
        console.log(  result.prob_under);
    })
    .catch(error => {
        console.error("Error:", error);
        results.innerHTML = `<p>Error fetching stats: ${error}</p>`;
    });
    

}

function show_chart(parent,prob_under, prob_over){
    const canvas=document.createElement('canvas');
   

    parent.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Probability Under', 'Probability Over'],
            datasets: [{
                label: 'Data',
                data: [prob_under, prob_over],
                backgroundColor: [
                    'rgba(255, 0, 0, 0.7)', // Red for "Probability Under"
                    'rgba(0, 0, 255, 0.7)'  // Blue for "Probability Over"
                ],
                borderColor: [
                    'rgba(255, 0, 0, 1)', // Border color for red
                    'rgba(0, 0, 255, 1)'  // Border color for blue
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white' // Make Y-axis ticks white
                    }
                },
                x: {
                    ticks: {
                        color: 'white' // Make X-axis ticks white
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white' // Make legend text white
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function() {
                            return ''; 
                        }
                    },
                    bodyColor: 'white' 
                }
            },
            elements: {
                bar: {
                    borderWidth: 2
                }
            }
        }
    });
    
    myChart.update();

}

