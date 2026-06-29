document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.nav-btn');
  const iframe = document.getElementById('project-iframe');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      buttons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Update iframe source url to selected project
      const url = button.getAttribute('data-url');
      if (url) {
        iframe.src = url;
      }
    });
  });
});
