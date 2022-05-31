import express, {json, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8080;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get('/filteredimage', async ( req: Request, res: Response ) => {
      // Get the url from the query
      const { image_url } : { image_url: string } = req.query;

      // error output schema
      let err  : {code: Number, message: string }= {
          code : -1,
          message: "",
      }

      // Validate the url
      const url_re: RegExp = /^(http|ftp)s?:\/\/(www\.)?[-a-zA-Z\d@:%._+~#=]{1,256}\.[a-zA-Z\d()]{1,6}\b([-a-zA-Z\d()@:%_+.~#?&/=]*)$/;

      if (!url_re.test(image_url)) {
          err.code = 422;
          err.message = "the url provided is invalid";
          res.status(422)
          return res.send(err);
      }

      // Filter the image
      const filtered_image: Promise<string> = filterImageFromURL(image_url);

      // Read from the promise
      filtered_image.then(filteredPath => {
          res.sendFile(filteredPath, (e: Error)=> {
              // Delete the file
              if (!e) {
                  if (filteredPath)
                      deleteLocalFiles([filteredPath]);
              } else {

                  // Return an error
                  err.code = 500;
                  err.message = e.message;
                  res.status(500);
                  res.send(err);
              }
          })
      }).catch((e: Error)=>{
          err.code = 500;
          err.message = e.message;
          res.status(500);
          res.send(err);
      })
  });

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();