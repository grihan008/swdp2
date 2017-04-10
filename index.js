var express = require("express"),
	pg = require("pg"),
	cors = require("cors"),
	bodyParser = require("body-parser");

var app = express();

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.json());
app.use(cors());

app.get('/categories', function(req, res) {
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("SELECT * FROM categories", function(err, result){
			done();
			if (err){
				res.send("Error");
			}
			else{
				res.send(result.rows[0]);
			}
		});
	});
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});