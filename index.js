var express = require("express"),
	pg = require("pg"),
	cors = require("cors");

var app = express();

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.json());
app.use(cors());

app.get('/', function(req, res) {
    res.send("Hello world");
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});