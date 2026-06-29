const newsContainer = document.getElementById('news-container');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessageText = document.getElementById('error-message-text');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');


// userr used catrgory buttons
document.querySelector("#category-filters").addEventListener('click', function(e) {
    // Basic event delegation safety guard
    if (e.target.getAttribute('data-category')) {
        e.preventDefault(); // Stop anchor link from jumping the page view
        let category = e.target.getAttribute('data-category');
        Fetchnews(category).then(function(data) {
            showingnews(data);
        });
    }
});

// useed categoryfilters
document.querySelector("#dropdown-category-filter").addEventListener('change', function(e) {
    if (e.target.value != "") {
        let activeOptionChild = this.querySelector("option:checked");
        let category = activeOptionChild.getAttribute('ctgtype');
        Fetchnews(category).then(function(data) {
            showingnews(data);
        });
    }
});


// 1. UNIFIED FORM SUBMISSION HANDLER
searchForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    let userinput = searchInput.value.trim();
    
    if (userinput !== "") {
        // Clear out any previous validation errors if the user finally typed something right
        searchInput.classList.remove('is-invalid');
        
        console.log("Fetching live data from URL string parameter matching:", userinput);
        
        Fetchnews(userinput).then(function(data) {
            showingnews(data);
        });
    } else {
        // 🌟 FEATURE: Empty Search Guard. Highlights the input box red using Bootstrap's validation style
        searchInput.classList.add('is-invalid');
        searchInput.placeholder = "Please enter a search topic...";
    }
});

// Clear the red error indicator instantly when the user starts typing again
searchInput.addEventListener('input', function() {
    searchInput.classList.remove('is-invalid');
});

// 2. DOM INITIAL CONTENT ENGINE
document.addEventListener('DOMContentLoaded', function(e) {
    showingonloadnews();
});

// 3. DYNAMIC FETCH LOGIC ENGINE (All-In-One General Search Engine)
async function Fetchnews(category) {
    
    // Reset our application UI variables before launching a fresh internet fetch call
    loadingState.classList.remove('d-none');
    errorState.classList.add('d-none'); 
    newsContainer.innerHTML = ""; 

    try {
        let url = 'https://saurav.tech/NewsAPI/top-headlines/category/general/in.json';
        
        // DYNAMIC SWITCH: If user typed a search word, route to a live keyword search engine.
        // If it's empty or "general" on load, use the stable general headline pool.
        if (category && category !== "" && category !== "general") {
            let safeCategory = encodeURIComponent(category);
            // High-volume open search pipeline that processes raw text parameter matching natively
            url = `https://api.spaceflightnewsapi.net/v4/articles/?search=${safeCategory}`;
        }
        
        let response = await fetch(url);
        
        if (!response.ok) {
            throw new Error("HTTP Server Error!");
        }

        let data = await response.json();
        
        // This handles returning arrays from either API layout seamlessly
        return data.articles || data.results;

    } catch (error) {
        // 🌟 FEATURE: Securely turn off the loading wheel if a network failure cuts off our pipeline
        loadingState.classList.add('d-none');
        errorState.classList.remove('d-none'); 

        if (error.message.includes("HTTP Server Error!")) {
            errorMessageText.innerText = "The news server is currently down or responding slowly. Please try again later.";
            console.log("Server error caught successfully.");
        } else if (error instanceof SyntaxError) {
            errorMessageText.innerText = "There was a parsing problem handling the news data structure layout.";
            console.log("parsing response has not converted due to invalid syntax");
        } else {
            errorMessageText.innerText = "Unable to connect. Please check your network dropped status or internet connection.";
            console.log("the sites has has crashed or network dropped");
        }
        
        return []; // Safe return fallback array ensures showingnews doesn't crash on undefined values
    }
}

// 4. SHIFT LOADING CONTROLLER 
function showingonloadnews(){
    // Loads absolute general trending news instantly on startup
    Fetchnews("general").then(function(data) {
        showingnews(data);
    });
}

// 5. CARDS RENDERING LOGIC (Paints layout grids flawlessly from index 0)
function showingnews(data) {
    // If we've made it here, our asynchronous data loop has completed, so turn off the loader wheel
    loadingState.classList.add('d-none');

    if (!data || data.length === 0) {
        newsContainer.innerHTML = `<h4 class="text-center text-muted my-5">No search results found. Try another topic!</h4>`;
        return;
    }

    newsContainer.innerHTML = "";
    
    // FIXED: Always slice from 0 to 6 so you never miss items or get a blank screen
    data.slice(0, 6).forEach(element => {
        
        // HYBRID KEY PROTECTION: Fallback checks ensure images load perfectly across both end points
        const sampleImage = element.urlToImage || element.image_url;
        const sourceName = (element.source && element.source.name) || element.news_site || "Verified News Hub";
        const textSummary = element.description || element.summary || 'No description available for this story.';

        newsContainer.innerHTML += `
            <div class="col-12 col-md-6 col-lg-4 mx-auto mb-4">
                <div class="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                    
                    <img src="${sampleImage}" class="card-img-top" alt="Thumbnail" style="height: 200px; object-fit: cover;" onerror="this.src='https://placehold.co/600x400?text=News+Image'">
                    
                    <div class="card-body d-flex flex-column p-4">
                        
                        <h5 class="card-title fw-bold text-dark text-capitalize lh-sm mb-2">
                            ${element.title}
                        </h5>
                        
                        <p class="card-text text-muted small flex-grow-1">
                           ${textSummary}
                        </p>
                        
                        <div class="pt-3 border-top border-light-subtle mt-2">
                            <span class="fw-bold text-secondary small">Source: ${sourceName}</span>
                        </div>
                        <a href="${element.url}" target="_blank" class="btn btn-sm btn-dark mt-3 w-100">Read Breaking Story</a>
                    </div>
                </div>
            </div>
        `;
        console.log("sjsj");
    });
}