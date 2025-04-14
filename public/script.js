document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const noteForm = document.getElementById('noteForm');
  const notesList = document.getElementById('notesList');
  const updateModal = document.getElementById('updateModal');
  const closeModal = document.getElementById('closeModal');
  const updateForm = document.getElementById('updateForm');


  const fetchNotes = async () => {
     
      const pathSegments = window.location.pathname.split('/');
      const noteId = pathSegments[2]; 
      
      try {
          const url = noteId ? `/notes/${noteId}` : '/notes';
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          if (response.ok) {
              const result = await response.json();
              renderNotes(result); 
          } else {
              console.log(response);
              alert('Failed to fetch notes');
          }
      } catch (error) {
          console.error('Error occurred while fetching notes:', error);
          alert('Error occurred while fetching notes');
      }
  };
  

  const renderNotes = (notes) => {
      notesList.innerHTML = '';
      
      if (Array.isArray(notes)) {
          notes.forEach((note) => {
              const noteElement = document.createElement('div');
              // Add clickable link to view individual note
              noteElement.innerHTML = `
              <p class="title">${note.title}</p>
              <span>Subject : </span><span class="subject"> ${note.subject}</span> <br>
              <span>User Name</span><span class="userName">${note.userName}</span> <br>
              <span>User Email</span><span class="userEmail">${note.userEmail}</span> <br>
              <input type="button" value="delete" class="delete-button" data-id="${note.id}" />
              <input type="button" value="update" class="update-button" data-id="${note.id}" />
              <hr>
          `;
              notesList.appendChild(noteElement);
          });
      } else {
          // Single note view
          const noteElement = document.createElement('div');
          // Add back button to return to all notes
          noteElement.innerHTML = `
              <h3><a href="/notes/${note.id}" style="text-decoration: none; color: inherit;" class="title">${note.title}</a></h3>
              <span>Subject : </span><span class="subject"> ${note.subject}</span> <br>
              <span>User Name</span><span class="userName">${note.userName}</span> <br>
              <span>User Email</span><span class="userEmail">${note.userEmail}</span> <br>
              <input type="button" value="delete" class="delete-button" data-id="${note.id}" />
              <input type="button" value="update" class="update-button" data-id="${note.id}" />
              <hr>
              `;
          notesList.appendChild(noteElement);
      }
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
      event.preventDefault();
      
      const formData = new FormData(noteForm);
      const name = formData.get("userName");
      const email = formData.get("userEmail");
      const title = formData.get("title");
      const subject = formData.get("subject");

      try {
          const response = await fetch('/notes', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({id: 0, userName: name, userEmail: email, title: title, subject: subject}), 
          });

          const result = await response.json();
          if (response.ok) {
              alert('Your Note is saved');
              noteForm.reset();
              // Refresh the notes list after adding a new note
              fetchNotes();
          } else {
              console.log(response);
              alert('Your Note is Not Added');
          }
      } catch (error) {
          console.error(error);
          alert('Error occurred while submitting the form');
      }
  };
  
  // Add event listeners
  noteForm.addEventListener('submit', handleSubmit);

  // Initial fetch
  fetchNotes();

  const showModal = (noteId, userName, userEmail, title, subject) => {
    document.getElementById('noteId').value = noteId;
    document.getElementById('userName').value = userName;
    document.getElementById('userEmail').value = userEmail;
    document.getElementById('title').value = title;
    document.getElementById('subject').value = subject;
    updateModal.style.display = 'block';
  };
  const hideModal = () => {
    updateModal.style.display = 'none';
  };
  closeModal.addEventListener('click', hideModal);

  notesList.addEventListener('click', async (event) => {
    const target = event.target;
  
    if (target.classList.contains('update-button')) {
      const noteId = target.getAttribute('data-id');
    

      const noteElement = target.closest('div');
      
      const userName = noteElement.querySelector('.userName').innerText;
      const userEmail = noteElement.querySelector('.userEmail').innerText;
      const title = noteElement.querySelector('.title').innerText;
      const subject = noteElement.querySelector('.subject').innerText;
      

      showModal(noteId, userName, userEmail, title, subject);
  }
});
updateForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const noteId = document.getElementById('noteId').value;
  const formData = new FormData(updateForm);
  
  const updatedNote = {
    userName: formData.get('userName'),
    userEmail: formData.get('userEmail'),
    title: formData.get('title'),
    subject: formData.get('subject'),
  };
    try {
      const response = await fetch(`/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedNote)
      });
  
      if (response.ok) {
        alert('Note updated successfully.');
        hideModal();
        fetchNotes();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to update note.'}`);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert('An error occurred while updating the note.');
    }
})
  })

  notesList.addEventListener('click', async (event) => {
    const target = event.target;
  
    if (target.classList.contains('delete-button')) {
      const noteId = target.getAttribute('data-id');
      const noteElement = target.closest('div');
    try {
      const response = await fetch(`/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      if (response.ok) {
        alert('Note deleted successfully.');
        noteElement.remove();
        fetchNotes();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete note.'}`);
      }
    }catch{
      console.error('Error delete note:', error);
      alert('An error occurred while deleteing the note.');
    }
  }
})
