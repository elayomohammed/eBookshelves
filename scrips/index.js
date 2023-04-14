// indexedDb instance
const request = window.indexedDB.open('eBookshelves', 1);
request.onerror = (event)=>{
    console.error(`error initializing eBookshelves DB instance: ${event.target.error}`);
}

request.onupgradeneeded = (event) =>{
    const db = event.target.result;
    db.onerror = (event) =>{
        console.error(`eBookshelves database error: ${event.target.errorCode}`)
    }
    // initializing eBookshelves Booklist objectstore
    const bookListObjectStore = db.createObjectStore('booklist', {keyPath: 'name'});
    bookListObjectStore.createIndex('name', 'name', {unique: false});
    bookListObjectStore.transaction.oncomplete = () =>{
        console.log(`booklist objectstore have been created succesfully...`);
    }
}

request.onsuccess = (event) =>{
    const db = event.target.result;
    // function to add books to the booklist objectstore
    const addToBooklist = () =>{
        const bookUploadBtn = document.getElementById('add-ebooklist-btn');
        bookUploadBtn.addEventListener('click', ()=>{
            const booksToUpload = document.getElementById('book-upload').files;
            for(i = 0; i < booksToUpload.length; i++){
                const transaction = db.transaction('booklist', 'readwrite').objectStore('booklist');
                const addToBooklistTx = transaction.add(booksToUpload[i]);
                addToBooklistTx.onerror = (event) =>{
                    console.error(`error adding to booklist: ${event.target.error}`);
                    alert(`error adding to booklist: ${event.target.error}`);
                }
                addToBooklistTx.onsuccess = (event) =>{
                    console.log(`book added to the list succesfully with the name: ${event.target.result}`);
                    alert(`book added to the list succesfully with the name: ${event.target.result}`);
                }
            }
        });
    }
    addToBooklist();

    // getting all booklist from database and listing them
    const getBooklist = () =>{
        const transaction = db.transaction('booklist').objectStore('booklist');
        const getBookTx = transaction.getAll();
        getBookTx.onerror = (event) =>{
            alert(`error getting booklist: ${event.target.error}`);
        }
        getBookTx.onsuccess = (event) =>{
            console.log(`${event.target.result.length} booklist retrieved successfully...`);
            const booklist = event.target.result;
            for(let i = 0; i < booklist.length; i++){
                const list = document.createElement('li');
                list.setAttribute('class', 'injected-booklist')
                list.innerText = booklist[i].name;
                const booklistOutput = document.getElementById('listed-books');
                booklistOutput.appendChild(list);
            }
        }
    }
    getBooklist();

    // retrieving a single book from the database and rendering it
    const renderSingleBook = () =>{
        const booklists = document.getElementById('listed-books');
        booklists.addEventListener('click', (event) =>{
            if(event){
                document.getElementById('book-title').textContent = event.target.textContent;
                // use the textContent to search and retrive and render book from the db
            }else{
                console.log('error reading event data...');
            }
        })
    }
    renderSingleBook();
}

// handling new book uploads
const handleBookUpload = (event) =>{
    const bookToUploadDetailsOutput = document.getElementById('selected-book-info');
    const bookUploadBtn = document.getElementById('add-ebooklist-btn');
    if(event){
        bookToUploadDetailsOutput.style.display = 'block';
        bookToUploadDetailsOutput.textContent = event.target.files[0].name;
        bookUploadBtn.style.display = 'block';
    }else{
        bookToUploadDetailsOutput.style.display = 'none';
        bookUploadBtn.style.display = 'none';
    }
}
