var express = require("express"),
	pg = require("pg"),
	cors = require("cors"),
	bodyParser = require("body-parser"),
	cloudinary = require("cloudinary"),
	cloudinaryStorage = require("multer-storage-cloudinary");

var app = express();

var storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: '',
  allowedFormats: ['jpg', 'png'],
});

var parser = multer({ storage: storage });

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.json());
app.use(cors());

app.get('/', function(req, res) {
  res.send('<form method="post" enctype="multipart/form-data">'
    + '<p>Public ID: <input type="text" name="title"/></p>'
    + '<p>Image: <input type="file" name="image"/></p>'
    + '<p><input type="submit" value="Upload"/></p>'
    + '</form>');
});

app.post('/', parser.single('image'), function(req, res) {
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

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});