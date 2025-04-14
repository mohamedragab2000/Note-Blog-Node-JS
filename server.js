const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`${req.method} ${pathname}`);

  if (pathname === '/' && req.method === 'GET') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    
    try {
      const layout = fs.readFileSync(filePath, { encoding: 'utf8' });
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(layout);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
      console.error('Server Error', err);
    }
  } else if (pathname === '/public/style.css' ) {
    const filePath = path.join(__dirname, 'public', 'style.css');
    
    try {
      const style = fs.readFileSync(filePath, { encoding: 'utf8' });
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(style);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
      console.error('Server Error', err);
    }
  } 
  else if (pathname === '/public/script.js' ) {
    const filePath = path.join(__dirname, 'public', 'script.js');
    
    try {
      const logic = fs.readFileSync(filePath, { encoding: 'utf8' });
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(logic);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
      console.error('Server Error', err);
    }
  } else if (pathname === '/notes'  && req.method === 'POST'){

    let collector = '' ; 
    
    req.on('data' , (chunk)=>{ collector += chunk});

    req.on('end' , ()=>{
        
           const {userName , userEmail , title , subject  }= JSON.parse(collector) ; 

            if (!userEmail || !userName || !title || !subject){
                res.writeHead(400,{'Content-Type' : "text/html"})
                return res.end(`<p>All Feilds are required</p>`) ; 
            }
            const oldFilePath = path.join(__dirname, 'notes.json');
           
            const  oldData = fs.readFileSync(oldFilePath ,'utf-8' ) ; 
           
            oldDataJson = JSON.parse(oldData) ; 
             
           console.log(oldDataJson) ;
            if(oldDataJson.length > 0 ){
                id = oldDataJson[oldDataJson.length-1].id+1 ; 
            }else {
                id = 1 ;    
            }
            const emailExists = oldDataJson.some(element => 
                element.userEmail === userEmail
            );

            if (emailExists) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Email already exists' }));
            }


            oldDataJson.push({id , userName , userEmail , title , subject  });
           
            fs.writeFileSync(oldFilePath, JSON.stringify(oldDataJson, null, 2), 'utf-8');
           
            res.writeHead(200, { 'Content-Type': 'application/json' });
           
            res.end(JSON.stringify({ message: 'Note saved successfully' }));
        }
    )

  }
  

  else if (pathname === '/notes'  && req.method === 'GET'){
        
         
            const oldFilePath = path.join(__dirname, 'notes.json');
           
            const  oldData = fs.readFileSync(oldFilePath ,'utf-8' ) ; 
           
            oldDataJson = JSON.parse(oldData) ; 
           
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify( oldDataJson ));

            
        }
        else if (pathname.match(/\/notes\/(\d+)/) && req.method === 'GET'){
        
           const noteId =  pathname.split('/')[2];
            const oldFilePath = path.join(__dirname, 'notes.json');
           
            const  oldData = fs.readFileSync(oldFilePath ,'utf-8' ) ; 
           
            oldDataJson = JSON.parse(oldData) ; 

            const note = oldDataJson.find(n => n.id == noteId);

            if (note) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify( note));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Note not found' }));
            }

        }
        else if (pathname.match(/\/notes\/(\d+)/) && req.method === 'PUT'){
            const noteId =  pathname.split('/')[2];
            let body = '';

            req.on('data', chunk => {
              body += chunk;
            });
          
            req.on('end', () => {
              try {
                const updatedNote = JSON.parse(body);
                const filePath = path.join(__dirname, 'notes.json');
                const notes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          
                const noteIndex = notes.findIndex(note => note.id == noteId);
                if (noteIndex === -1) {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  return res.end(JSON.stringify({ error: 'Note not found.' }));
                }
          

                notes[noteIndex] = { id: noteId, ...updatedNote };
                fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf-8');
          
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Note updated successfully.' }));
              } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request data.' }));
              }
            });
        }


        else if (pathname.match(/\/notes\/(\d+)/) && req.method === 'DELETE'){
            const noteId =  pathname.split('/')[2];

          
              try {

                const filePath = path.join(__dirname, 'notes.json');
                const notes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          
                const noteIndex = notes.findIndex(note => note.id == noteId);
                if (noteIndex===-1 ) {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  return res.end(JSON.stringify({ error: 'Note not found.' }));
                }
          

                notes.splice(noteIndex, 1);
                fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf-8');
          
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Note deleted successfully.' }));
              } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request data.' }));
              }
            
        }

  
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found style');
  }


});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});