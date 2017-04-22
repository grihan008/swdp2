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

var sess;

app.get('/login', function(){

});
//Admin login + admin pages
app.get('/loginadmin', function(req,res){
	res.render('loginadmin');
});

app.post('/loginadmin', function(req,res){
	sess=req.session;
	if (sess.adminLoggedIn){
		res.redirect("/admin");
	}
	else{
		pg.connect(process.env.DATABASE_URL, function(err, client, done){
			client.query("SELECT * FROM admins", function(err, result){
				done();
				var loggedin;
				if (err){
					res.send("Error");
				}
				else{
					result.rows.forEach(function(item, i){
						if ((req.body.login==item.login)&&(req.body.password==item.password)){
							loggedin=true;
						}
					});
				}
				if (loggedin){
					sess.adminLoggedIn=true;
					res.redirect('/admin');
				}
				else{
					req.session.destroy(function(err) {
						
					})
				}
			});
		});
	}	
});

app.get('/admin', function(req,res){
	sess=req.session;
	if (!sess.adminLoggedIn){
		res.redirect("/loginadmin");
	}
	else{
		res.render("admin");
	}
});

app.get('/adminskills/:cat_id', function(req,res){
	sess=req.session;
	if (!sess.adminLoggedIn){
		res.redirect("/loginadmin");
	}
	else{
		res.render("adminskills",{cat_id: req.params.cat_id});
	}	
});

app.get('/adminskill/:id', function(req,res){
	sess=req.session;
	if (!sess.adminLoggedIn){
		res.redirect("/loginadmin");
	}
	else{
		res.render("adminskill",{id: req.params.id});
	}	
});
//End admin pages
//Get|Add data functionality
app.get('/test', function(req,res){
	res.send('<form method="post">'
    + '<p>Public ID: <input type="text" name="title"/></p>'
    + '<p><input type="submit" value="Upload"/></p>'
    + '</form>')
});

app.post('/test',function(req,res){
	res.render('test', {'title':req.body.title});
});
//image upload
app.get('/upload', function(req, res) {
  res.send('<form method="post" enctype="multipart/form-data">'
    + '<p>Public ID: <input type="text" name="title"/></p>'
    + '<p>Image: <input type="file" name="image"/></p>'
    + '<p><input type="submit" value="Upload"/></p>'
    + '</form>');
});

app.post('/upload', parser.single('image'), function(req, res) {
	res.json(req.file);
});
app.post('/upload_step', parser.single('image'), function(req, res) {
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("update steps set photo_url='"+req.file.url+"' where id="+req.body.id, function(err, result){
			done();
			if (err){
				res.send("Error");
			}
			else{
				res.redirect("/test");
			}
		});
	});	
});
//Get categories
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
//Get skills in category
app.get('/skills/:cat_id', function(req,res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("SELECT * FROM skills where cat_id="+req.params.cat_id, function(err, result){
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
//get skill by id
app.get('/skill/:id', function(req,res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("SELECT * FROM skills where id="+req.params.id+"", function(err, result){
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
//get skills' steps
app.get('/skill_steps/:id', function(req,res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("SELECT * FROM steps where skill_id="+req.params.id+" Order by step", function(err, result){
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
//delete skill
app.post('/del_skill',function(req,res){

});
//delete step
app.post('/del_step', function(req,res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("Delete FROM steps where id="+req.body.id, function(err, result){
			done();
		});
	});		
});
//move step
app.post('/move_step', function(req,res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("update steps set step="+req.body.step+" where id="+req.body.id, function(err, result){
			done();
		});
	});		
});
//add step
app.post('/add_step', function(req,res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("insert into steps(skill_id, heading, description, step) values("+req.body.id+",'"+req.body.heading+"','"+req.body.description+"',"+req.body.step+")", function(err, result){
			done();
		});
	});		
});

app.all('*', function(req, res) {
  res.send("404");
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});