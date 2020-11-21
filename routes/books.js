var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = require('../settings');

/* GET books listing. */
router.get('/', function(req, res, next) {
  var order = (req.query.order === 'id' || 'name' || 'release_date' ? req.query.order : 'id') || 'id';
  var orderType = (req.query.orderType === 'ASC' || 'DESC' ? req.query.orderType : 'ASC') || 'ASC';
  var pageSize = parseInt(req.query.pageSize) || 20;
  var pageNumber = parseInt(req.query.pageNumber) || 1;
  function offset() {
      return pageNumber === 1 ? 0 : ( pageSize  * (pageNumber -1) );
  }
  
  var queryParams = [ pageSize, offset() ];
  var sql = `SELECT id, name, release_date FROM books ORDER BY ${order} ${orderType} LIMIT ? OFFSET ?`;
  sql = mysql.format(sql, queryParams);

  function getBooks(callback) {
    pool.query(sql, function (error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }

  getBooks(function(response) {
    res.send(response);
  });
  
});

/* POST book  */
router.post('/', function(req, res, next) {
  var book = req.body;
  var queryParams1 = [ book.name, book.description, book.cover, book.release_date, book.languages ];
  var sql1 = "INSERT INTO books (name, description, cover, release_date, languages) VALUES (?)";
  sql1 = mysql.format(sql1, [queryParams1]);

  pool.getConnection(function(err, connection) {

    function postBook(callback) {
      connection.query(sql1, function (error, results, fields) {
        if (error) throw error;
        callback(results);
      });
    }

    function postBookAuthors(bookId, callback) {
      var queryParams2 = [];
      var sql2 = "INSERT INTO bookauthors (book_id, author_id) VALUES ?";
      var authors = book.authors;
      authors.forEach(author => {
        queryParams2.push([parseInt(bookId), parseInt(author.id)]);
      });
      sql2 = mysql.format(sql2, [queryParams2]);

      connection.query(sql2, function (error, results, fields) {
        if (error) throw error;
        callback(results);
      });
    }

    postBook(function(response1) {
      postBookAuthors(response1.insertId, function(response2) {
        res.send(response1 + response2);
        connection.release();
      });
    });

  });
  
    
});

/* GET book details */
router.get('/:id', function(req, res, next) {
  var id = req.params.id;
  var sql1 = "SELECT * FROM books WHERE id = ?";
  var sql2 = "SELECT authors.id AS id, authors.name AS name, authors.birth_date AS birthdate, authors.country AS country FROM authors INNER JOIN bookauthors ON authors.id = bookauthors.author_id AND bookauthors.book_id = ?";
  sql1 = mysql.format(sql1, id);
  sql2 = mysql.format(sql2, id);

  if (Math.sign(id) === 1 || 0) {
    pool.getConnection(function(err, connection) {
      if (err) throw err;
  
      function getBook(callback) {
        connection.query(sql1, function (error, results, fields) {
          if (error) throw error;
          callback(results);
        });
      }
      
      function getBookAuthors(callback) {
        connection.query(sql2, function (error, results, fields) {
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
  } else {
    res.status(400).send('Invalid ID');
  }
});

/* UPDATE book  */
router.put('/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  var book = req.body;
  var queryParams1 = [ book.name, book.description, book.cover, book.release_date, book.languages, id ];
  var sql1 = "UPDATE books SET name = ?, description = ?, cover = ?, release_date = ?, languages = ? WHERE id = ? ";
  sql1 = mysql.format(sql1, queryParams1);

  var queryParams2 = [];
    var sql2 = "INSERT INTO bookauthors (book_id, author_id) VALUES (?)";
    var authors = book.authors;
    authors.forEach(author => {
      queryParams2.push([id, parseInt(author.id)]);
    });
    sql2 = mysql.format(sql2, queryParams2);

  pool.getConnection(function(err, connection) {

    function updateBook(callback) {
      connection.query(sql1, function (error, results, fields) {
        if (error) throw error;
        callback(results);
      });
    }

    function updateBookAuthors(callback) {
      connection.query(sql2, function (error, results, fields) {
        if (error) throw error;
        callback(results);
      });
    }

    updateBook(function(response1) {
      updateBookAuthors(function(response2) {
        res.send(response1 + response2);
        connection.release();
      });
    });

  });
});

/* DELETE book  */
router.delete('/:id', function(req, res, next) {
  var id = req.params.id;
  var sql = "DELETE FROM books WHERE id = ?";
  sql = mysql.format(sql, parseInt(id));

  function deleteBook(callback) {
    pool.query(sql, function (error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }
  
  deleteBook(function(response) {
      res.send(response);
  });
});

/* DELETE book author  */
router.delete('/:id/authors/:authorid', function(req, res, next) {
  var queryParams = [parseInt(req.params.id), parseInt(req.params.authorid)];
  var sql = "DELETE FROM bookauthors WHERE book_id = ? AND author_id = ? "
  sql = mysql.format(sql, queryParams);


  function deleteBook(callback) {
    pool.query(sql, function (error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }
  
  deleteBook(function(response) {
      res.send(response);
  });
});

module.exports = router;
