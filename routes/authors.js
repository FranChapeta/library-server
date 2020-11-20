var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = require('../settings');

/* GET authors listing. */
router.get('/', function(req, res, next) {
  var order = req.query.order || 'id';
  var orderType = req.query.ordertype || 'DESC';
  var pageSize = parseInt(req.query.pagesize) || 20;
  var pageNumber = parseInt(req.query.pagenumber) || 0;
  function offset() {
      return pageNumber === 0 ? 0 : ( pageSize * pageNumber );
  }
  var queryParams = [order, orderType, pageSize, offset() ];
  var sql = "SELECT id, name FROM authors ORDER BY ? ? LIMIT ? OFFSET ?";
  sql = mysql.format(sql, queryParams);

    function getAuthors(callback) {
        pool.query(sql, function (error, results, fields) {
        if (error) throw error;
        callback(results);
        });
    }

    getAuthors(function(response) {
        res.send(response);
    });
  
});

/* POST author  */
router.post('/', function(req, res, next) {
  var author = req.body;
  var queryParams = [ author.name, author.birth_date, author.country ];
  var sql = "INSERT INTO authors (name, birth_date, country) VALUES (?)";
  sql = mysql.format(sql, [queryParams]);
  console.log(sql);
  
    function postAuthor(callback) {
        pool.query(sql, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        callback(results);
        });
    }

    postAuthor(function(response) {
        res.status(200).send(response);
    });

});

/* GET author details */
router.get('/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  var sql = "SELECT * FROM authors WHERE id = ?";
  sql = mysql.format(sql, id);

  if (Math.sign(id) === 1 || 0) {

    function getAuthor(callback) {
        pool.query(sql, function (error, results, fields) {
        if (error) throw error;
        callback(results);
        });
    }

    getAuthor(function(response) {
        var author =  response[0];
        res.send(author);
    });

  } else {
    res.status(400).send('Invalid ID');
  }
});

/* UPDATE author  */
router.put('/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  var author = req.body;
  var queryParams = [ author.name, author.birth_date, author.country, id ];
  var sql = "UPDATE authors SET name = ?, birth_date = ?, country = ? WHERE id = ? ";
  sql = mysql.format(sql, queryParams);

    function updateAuthor(callback) {
      pool.query(sql, function (error, results, fields) {
        if (error) throw error;
        callback(results);
      });
    }

    updateAuthor(function(response) {
        console.log(response);
        if (response.affectedRows > 0) {
          res.status(200).send(response);
        }
    });

});

/* DELETE author  */
router.delete('/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  var sql = "DELETE FROM authors WHERE id = ?";
  sql = mysql.format(sql, id);

  function deleteAuthor(callback) {
    pool.query(sql, function (error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }
  
  deleteAuthor(function(response) {
      res.status(200).send(response);
  });
});

module.exports = router;
