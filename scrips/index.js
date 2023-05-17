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
                    const bookToUploadDetailsOutput = document.getElementById('selected-book-info');
                    const bookUploadBtn = document.getElementById('add-ebooklist-btn');
                    bookToUploadDetailsOutput.style.display = 'none';
                    bookUploadBtn.style.display = 'none';
                }
                addToBooklistTx.onsuccess = (event) =>{
                    console.log(`${event.target.result} have been added to your booklists successfully :)...`);
                    alert(`${event.target.result} have been added to your booklists successfully :)...`);
                    const bookToUploadDetailsOutput = document.getElementById('selected-book-info');
                    const bookUploadBtn = document.getElementById('add-ebooklist-btn');
                    bookToUploadDetailsOutput.style.display = 'none';
                    bookUploadBtn.style.display = 'none';
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
                const transaction = db.transaction('booklist').objectStore('booklist');
                const getBookToRenderTx = transaction.get(event.target.textContent);
                getBookToRenderTx.onerror = (event) =>{
                    console.error(`error getting book: ${event.target.error}`);
                }
                getBookToRenderTx.onsuccess = (event) =>{
                    console.log('book retrieved successfully');
                    const reader = new FileReader();
                    reader.readAsDataURL(event.target.result);
                    reader.onloadend = async (event) =>{
                        //PDFObject.embed(event.target.result, '#book-output');
                        const pdfState = {
                            pdf: await pdfjsLib.getDocument(event.target.result),
                            currentPage: 1,
                            zoom: 1.5
                        };
                        const render = async () =>{
                            const page = await pdfState.pdf.getPage(pdfState.currentPage);
                            let canvas = document.getElementById('book-renderer');
                            let context = canvas.getContext('2d');
                            let viewport = page.getViewport(pdfState.zoom);
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            document.getElementById('current-page').value = pdfState.currentPage;
                            await page.render({
                                canvasContext: context,
                                viewport: viewport
                            });
                        }
                        render();

                        document.getElementById('next-page').addEventListener('click', async () =>{
                            if(pdfState.pdf != null && pdfState.currentPage <= pdfState.pdf._pdfInfo.numPages){
                                pdfState.currentPage++;
                                document.getElementById('current-page').value = pdfState.currentPage;
                                return await render();
                            }else{
                                //return window.alert('this is the last page');
                                return console.log('this is the last page');
                            }
                        })
                        document.getElementById('prev-page').addEventListener('click', async() =>{
                            if(pdfState.pdf != null && pdfState.currentPage > 1){
                                pdfState.currentPage--;
                                document.getElementById('current-page').value = pdfState.currentPage;
                                return await render();
                            }else{
                                //return window.alert('this is the first page');
                                return console.log('this is the first page');
                            }
                        })
                        document.getElementById('current-page').addEventListener('keypress', async (event) =>{
                            try{
                                if(event.target.value >= 1 && event.target.value <= pdfState.pdf._pdfInfo.numPages){
                                    pdfState.currentPage = Number(event.target.value);
                                    return await render();
                                }
                            }catch(error){
                                console.error(`error: ${error}`);
                            }
                        })
                    }
                }
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

// making menu button responsive
const menubtnClick = () =>{
    document.getElementById('menu-btn').addEventListener('click', () =>{
        let nav = document.querySelector('nav');
        if(nav.style.display === ''){
            nav.style.display = 'flex';
            nav.classList.add('open-close-menu');
        }else if(nav.style.display === 'flex'){
            nav.style.display = 'none';
            nav.classList.remove('open-close-menu')
        }else if(nav.style.display === 'none'){
            nav.style.display = 'flex';
            nav.classList.add('open-close-menu')
        }
    })
}
menubtnClick();

//checking and acting on online and offline events
const handleOfflineOnlineandLoadEvents = () =>{
    window.addEventListener('online', (event) =>{
        if(event){
            console.log('your device is online...');
            document.getElementById('offline-loader').style.display = 'none';
            document.getElementById('dmainman').style.display = 'block';
        }
    });
    window.addEventListener('offline', (event) =>{
        if(event){
            console.log('your device is offline...');
            document.getElementById('dmainman').style.display = 'none';
            document.getElementById('offline-loader').style.display = 'block';
        }
    })
}
handleOfflineOnlineandLoadEvents();

