var express = require('express');
var router = express.Router();
var pool = require('../settings');

/* GET books listing. */
router.get('/', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    if (err) throw err;
    connection.query('SELECT id, name, release_date FROM books', function (error, results, fields) {
        res.send(results);
        connection.release();
        if (error) throw error;
    });
  });
});

/* POST book  */
router.post('/', function(req, res, next) {
  var book = req.body;
  var queryParams = [ book.name, book.description, book.cover, book.release_date, book.languages, id ];
  var sql1 = "INSERT INTO books (name, description, cover, release_date, languages) VALUES = ? WHERE id = ? ";

  pool.getConnection(function(err, connection) {
    if (err) throw err;

    function postBook(callback) {
      connection.query(sql1, [queryParams], function (error, results, fields) {
        if (error) throw error;
        callback(results);
      });
    }

    postBook(function(response) {
        res.send(response);
        connection.release();
    });
    
  });
});

/* GET book details */
router.get('/:id', function(req, res, next) {
  var id = req.params.id;
  var sql1 = "SELECT * FROM books WHERE id = ? ";
  var sql2 = "SELECT authors.id AS id, authors.name AS name, authors.birth_date AS birthdate, authors.country AS country FROM authors INNER JOIN bookauthors ON authors.id = bookauthors.author_id AND bookauthors.book_id = ?";
  pool.getConnection(function(err, connection) {
    if (err) throw err;

    function getBook(callback) {
      connection.query(sql1, [id], function (error, results, fields) {
        if (error) throw error;
        callback(results);
      });
    }
    
    function getBookAuthors(callback) {
      connection.query(sql2, [id], function (error, results, fields) {
        if (error) throw error;
        callback(results);
      });
    }

    getBook(function(bookData) {
      getBookAuthors(function(authorData) {
        var book =  bookData[0];
        book.authors = authorData;
        res.send(book);
        connection.release();
      });
    });
    
  });
});

/* UPDATE book  */
router.put('/:id', function(req, res, next) {
  var id = req.params.id;
  var book = req.body;
  var queryParams = [ book.name, book.description, book.cover, book.release_date, book.languages, id ];
  var sql1 = "UPDATE books SET name = ?, description = ?, cover = ?, release_date = ?, languages = ? WHERE id = ? ";

  function updateBook(callback) {
    pool.query(sql1, [queryParams], function (error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }
  
  updateBook(function(response) {
      res.send(response);
  });
});

/* DELETE book  */
router.delete('/:id', function(req, res, next) {
  var id = req.params.id;

  function deleteBook(callback) {
    pool.query("DELETE books WHERE id = ?", [id], function (error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }
  
  deleteBook(function(response) {
      res.send(response);
  });
});

/* POST book authors  */
router.post('/:id/authors', function(req, res, next) {
  var bookId = req.params.id;
  var authors = req.body;
  var authorsArray = [];
  authors.forEach(element => {
    authorsArray.push([bookId, element.id]);
  });

  function postBookAuthor(callback) {
    pool.query("INSERT INTO bookauthors (book_id, author_id) VALUES ?", [authorsArray], function (error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }
  
  postBookAuthor(function(response) {
      res.send(response);
  });
});

/* DELETE book author  */
router.delete('/:id/authors/:authorid', function(req, res, next) {
  var queryParams = [req.params.id, req.params.authorid];
  function deleteBook(callback) {
    pool.query("DELETE bookauthors WHERE book_id = ? AND author_id = ? ", [queryParams], function (error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }
  
  deleteBook(function(response) {
      res.send(response);
  });
});

module.exports = router;
