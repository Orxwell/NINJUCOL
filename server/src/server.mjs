// Import the Application
import app from '#src/app.mjs'

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


// Turning on the server, at PORT
app.listen(env.PORT, () => {
  if (env.MODE === 'dev') {
    console.log(
      `  ~Server listen at port: ${env.PORT}~\n` +
      `  ~[ ${env.SERVER_URL} ]~\n`
    );
  }
});
