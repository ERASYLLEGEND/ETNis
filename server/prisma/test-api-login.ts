import http from 'http';

async function main() {
  console.log('Testing login API...\n');

  const postData = JSON.stringify({
    email: 'abdikarimova_n@ptr.nis.edu.kz',
    password: 'Kazak2026'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response: ${data}\n`);

        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Login successful!');
          console.log(`User: ${response.user.fullName}`);
          console.log(`Role: ${response.user.role}`);
          console.log(`Email: ${response.user.email}`);
          console.log(`Token: ${response.token.substring(0, 50)}...`);
        } else {
          console.error('❌ Login failed');
        }

        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

main().catch(console.error);
