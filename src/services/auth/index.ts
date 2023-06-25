import * as http from 'http'
import open from 'open'
import { OAuth2Client, Credentials } from 'google-auth-library'
import { config as dotenv } from 'dotenv'

dotenv()

export const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getAuthdClient = () => {
  return new Promise<Credentials>((resolve, rej) => {
    const server = http
      .createServer(async (req, res) => {
        try {
          const query = new URL(
            req.url as string,
            process.env.GOOGLE_REDIRECT_URI
          ).searchParams
        
          const code = query.get('code')
    
          if(code === null) {
            res.end('something went wrong')
            return
          }
    
          res.end('Authentication successful! Please return to the console.')

          server.close()
    
          const { tokens } = await client.getToken(code)
    
          client.setCredentials(tokens)
    
          resolve(tokens)
        } catch(err) {
          rej(err)
        }
      })
      .listen(process.env.AUTH_SERVICE_PORT)

    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });
      
    open(authorizeUrl, { wait: false }).then(cp => cp.unref())
  })
}
