// Import the Application
import app from '#src/app.mjs';

// External & Internal Libraries
import importer from '#importers/handler.importer.mjs';


// Turning on the server, at PORT
app.listen(importer.env.PORT, () => {
  if (importer.env.MODE === 'dev') {
    console.log(
      `  ~Server listen at port: ${importer.env.PORT}~\n` +
      `  ~[ ${importer.env.SERVER_URL} ]~\n`
    );
  }
});
