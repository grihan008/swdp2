var express = require("express"),
	pg = require("pg"),
	cors = require("cors"),
	bodyParser = require("body-parser"),
	multer = require("multer"),
	cloudinary = require("cloudinary"),
	cloudinaryStorage = require("multer-storage-cloudinary"),
	session = require('express-session');

var app = express();

var storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: '',
  allowedFormats: ['jpg', 'png'],
});

var parser = multer({ storage: storage });

app.set('port', (process.env.PORT || 3000));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(session({secret: 'ihatethisproject'}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());

app.get('/login', function(){

});

app.get('/loginadmin', function(req,res){
	res.render('loginadmin');
});

app.post('/loginadmin', function(req,res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("SELECT * FROM admins", function(err, result){
			done();
			if (err){
				res.send("Error");
			}
			else{
				result.rows.forEach(function(item, i){
					if ((req.body.login==item.login)&&(req.body.password==item.password)){
						res.send("YEEEEAAAAAH");
						return;
					}
				});
				res.send("LOL");
			}
		});
	});	
});

app.get('/test', function(req,res){
	res.send('<form method="post">'
    + '<p>Public ID: <input type="text" name="title"/></p>'
    + '<p><input type="submit" value="Upload"/></p>'
    + '</form>')
});

app.post('/test',function(req,res){
	res.render('test', {'title':req.body.title});
});

app.get('/upload', function(req, res) {
  res.send('<form method="post" enctype="multipart/form-data">'
    + '<p>Public ID: <input type="text" name="title"/></p>'
    + '<p>Image: <input type="file" name="image"/></p>'
    + '<p><input type="submit" value="Upload"/></p>'
    + '</form>');
});

app.post('/upload', parser.single('image'), function(req, res) {
	res.json(req.file);
	res.send("Done");
});

app.get('/categories', function(req, res) {
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("SELECT * FROM categories", function(err, result){
			done();
			if (err){
				res.send("Error");
			}
			else{
				res.json(result.rows);
			}
		});
	});
});

app.all('*', function(req, res) {
  res.send("404");
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});