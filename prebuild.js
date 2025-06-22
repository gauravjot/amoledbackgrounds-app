const fs = require("fs");

console.log("\nRunning prebuild script");

// Check if any environment was provided with node prebuild.js command. Application variables
// -> node prebuild.js --env=development
// -> node prebuild.js --env=production
// -> node prebuild.js --env=staging
// -> node prebuild.js --env=local

// Parse command line arguments
const args = process.argv.slice(2);
const env = args.find(arg => arg.startsWith("--env="))?.split("=")[1];

// Load environment variables based on the provided environment
if (env) {
  console.log(`- Loading environment variables for ${env} (.env.${env})`);
  require("dotenv").config({path: `.env.${env}`});
} else {
  // Otherwise,load env variables from .env files in the following priority order
  // .env.local > .env.development > .env.production > .env
  require("dotenv").config({path: ".env.local"});
  require("dotenv").config({path: ".env.development"});
  require("dotenv").config({path: ".env.production"});
  require("dotenv").config({path: ".env"});
}

// Read all variables that start with "EXPO_PUBLIC_"
const publicVars = Object.keys(process.env).filter(key => key.startsWith("EXPO_PUBLIC_"));
console.log(`- Loaded ${publicVars.length} public variables`);
for (const key of publicVars) {
  console.log(`   - ${key}: ${process.env[key]}`);
}

// Import the necessary modules from .env or use sample ad ids
const admobAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID || "ca-app-pub-3940256099942544~3347511713";

const destFile = "app.json";

fs.access(destFile, fs.constants.F_OK, err => {
  if (!err) {
    // If the file exists, delete it
    fs.unlinkSync(destFile);
    console.log(`- Deleted existing ${destFile}`);
  }

  // Write the content to the destination file
  /* Format -
  {
    "react-native-google-mobile-ads": {
      "android_app_id": "ca-app-pub-xxx",
      "ios_app_id": "ca-app-pub-xxx"
    }
  }
  */
  const data = JSON.stringify(
    {
      "react-native-google-mobile-ads": {
        android_app_id: admobAppId,
        ios_app_id: admobAppId,
      },
    },
    null,
    2,
  );
  fs.writeFile(destFile, data, "utf8", err => {
    if (err) {
      console.error(`- Error writing ${destFile}:`, err);
    } else {
      console.log(`- Created ${destFile}`);
    }
  });
});
