var pool = require('./settings');

exports.getData = function(queryParams, callback) {
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query('SELECT * FROM '+ queryParams, function (error, results, fields) {
            callback(results);
            connection.release();
            if (error) throw error;
        });
    });
};

exports.postData = function(queryParams, callback) {
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query('INSTERT INTO '+ queryParams, function (error, results, fields) {
            callback(results);
            connection.release();
            if (error) throw error;
        });
    });
};