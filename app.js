// imports
const express = require('express')
const fs = require('fs')
const app = express()
const bodyParser = require('body-parser')

const dbPath = require('./settings').dbPath

//app settings
app.use(express.json())

app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs');

app.use(express.static("public"))


const saveBooks = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('books.json', stringifyData)
}

const getBooks = () => {
    const jsonData = fs.readFileSync('books.json')
    return JSON.parse(jsonData)
}


app.get('/', (req, res) => {
    const books = getBooks();


    res.render('pages/index', {
        books: books,
    });
})


app.post('/book/add/',

    (req, res) => {

        fs.readFile(dbPath('books'), (err, data) => {
            if (err) res.render('books', { success: false })

            const books = JSON.parse(data)
            books.push({
                id: Math.floor(Math.random() * 100),
                name: req.body.name,
                author: req.body.author,
                review: req.body.review,
            })

            fs.writeFile(dbPath('books'), JSON.stringify(books), (err) => {
                if (err)
                    res.render('books', { success: false })

                else {
                    res.redirect('/')
                }
            })
        })

    })



app.get('/book/list', function (req, res) {
    const books = getBooks()
    console.log(books)
    res.send(books);
});

app.get('/book/:id', function (req, res) {
    const books = getBooks()
    const { id } = req.params

    const foundbook = books.find(book => book.id === Number(id))
    res.render('pages/edit', {
        id: id,
        book: foundbook
    });
});


/* Update - Patch method */
app.post('/book/update/:id', (req, res) => {
    const { id } = req.params

    const isBook = getBooks()

    const findExist = isBook.find(book => book.id === Number(id))
    if (!findExist) {
        return res.status(409).send({ error: true, msg: 'book does not exist' })
    }

    const updateBook = isBook.filter(book => book.id !== Number(id))

    updateBook.push({
        id: Number(id),
        name: req.body.name,
        author: req.body.author,
        review: req.body.review,

    })
    saveBooks(updateBook)
    res.redirect('/')

})

app.get('/book/delete/:id', (req, res) => {
    const { id } = req.params

    const isBook = getBooks()

    const filterBook = isBook.filter(book => book.id !== Number(id));



    if (isBook.length === filterBook.length) {

        return res.status(409).send({ error: true, msg: 'book does not exist' })
    }

    //save the filtered data
    saveBooks(filterBook)
    res.redirect('/')

})



//configure the server port
app.listen(4000, () => {
    console.log(`Server runs on port  ${4000}`)
})