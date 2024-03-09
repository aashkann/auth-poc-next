// This could be an API route in Next.js, e.g., /api/speckle-callback

export default async function speckleCallback(req, res) {
    const { query } = req;
    const { code } = query; // Assuming Speckle returns an authorization code in the query parameters
  
    if (!code) {
      return res.status(400).send("Authorization code is required.");
    }
  
    try {
      // Exchange the code for tokens
      const tokens = await exchangeAccessCode(code); // Implement this function to exchange the code for tokens
      
      // Redirect back to the main page, or handle the tokens as needed
      res.writeHead(302, { Location: '/' });
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
  