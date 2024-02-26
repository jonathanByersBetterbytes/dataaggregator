const cloudinary = require("../middleware/cloudinary");
const pdf2excel = require("pdf-to-excel");
const XLSX = require('xlsx')
let fs = require('fs'), PDFParser = require("pdf2json");
let pdfParser = new PDFParser(this, 1);

const Post = require("../models/Post");

module.exports = {
  getProfile: async (req, res) => { 
    console.log(req.user)
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the posts of the logged-in user
      const posts = await Post.find({ user: req.user.id });
      //Sending post data from mongodb and user data to ejs template
      res.render("profile.ejs", { posts: posts, user: req.user }); 
    } catch (err) {
      console.log(err);
    }
  },
  getDataAggregator: async (req, res) => {
    res.render("dataaggregator.ejs", { parsedTextOutput: 'parsedTextOutput' })
  },
  getParsePDF: async (req, res) => {
    let activity = '['
    pdfParser.on("pdfParser_dataError", (errData) =>
      console.error(errData.parserError)
    );
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      console.log('received pdf')
      try{
        let parsedText = JSON.stringify(pdfData)        
        for(let i=0;i<20 && parsedText.indexOf('"T":"balance"') != -1;i++){
          parsedText = parsedText.substring(parsedText.indexOf('"T":"balance"')) // chop header
          parsedText = parsedText.substring(parsedText.indexOf('}]}')+4) // chop header
          activity += parsedText.substring(0, parsedText.indexOf('],"Fields":[]'))+',' // add page and add ',' to connect the JSON pages
        }
        activity = activity.substring(0, activity.indexOf('Ending%20balance')) // chop footer
        activity = activity.substring(0, activity.lastIndexOf(',{"x":'))+']' // chop footer
        activity = activity.replaceAll(',"S":-1,"TS":[0,10.2,0,0]', '') // remove useless data
        activity = activity.replaceAll('"clr":0,"sw":0.32553125,"A":"left",', '') // remove useless data
        
        //console.log(activity) 
        //console.log(JSON.parse(activity))
        fs.writeFile(
          "statements/parsed.json",
          activity,
          function (err, result) {
            console.log(err);
          }
        );
        //req.session.parsedData = { resparsedData: 'test session' };
        //console.log('generated json file')

        }catch (err) {
          console.log(err)
        }
        res.render("dataaggregator.ejs", { parsedTextOutput: activity })
      });  
      if(req.file) await pdfParser.loadPDF(req.file.path)

    //const execelFileFromJSON = XLSX.utils.json_to_sheet(activity)
		// generate worksheet and workbook 
		// const ws = XLSX.utils.json_to_sheet(activity);
		// const wb = XLSX.utils.book_new();
		// XLSX.utils.book_append_sheet(wb, ws, "Filtered");
		// for(let i=2;ws['C'+i];i++){
		// 	ws['A'+i].t = 'd';
		// 	//ws['C'+i].v = ws['C'+i].v.replaceAll('$','').replaceAll(',','');
		// 	ws['C'+i].t = 'n';
		// 	ws['C'+i].z = '"$"#,##0.00_);\\("$"#,##0.00\\)'
		// 	//console.log(ws['C'+i])
		// }
		//XLSX.writeFile(wb, "statements/arsedTransactions.xlsx", { compression: true });
    //console.log(ws) 

  },
  getPost: async (req, res) => {
    try {
      //id parameter comes from the post routes
      //router.get("/:id", ensureAuth, postsController.getPost);
      //http://localhost:3000/post/631a7f59a3e56acfc7da286f
      //id === 631a7f59a3e56acfc7da286f
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      //get all posts in desc order by createdAt
      const posts = await Post.find().sort({ createdAt: "desc" }).lean()
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      //media is stored on cloudainary - the above request responds with url to media and the media id that you will need when deleting content 
      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
