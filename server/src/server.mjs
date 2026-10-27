// Import the Application
import app from '#src/app.mjs';

// Importers for the server
import importer from '#importers/handler.importer.mjs';


// Turning on the server, at PORT
app.listen(importer.env.SERVER_PORT, () => {
  if (importer.env.SERVER_MODE === 'dev') {
    console.log(
      `  ~Server listen at port: ${importer.env.SERVER_PORT}~\n` +
      `  ~[ ${importer.env.SERVER_URL} ]~\n`
    );
  }
});
