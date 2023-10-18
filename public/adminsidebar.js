
  const submenuToggle = document.querySelectorAll('.submenu-toggle');

  submenuToggle.forEach(item => {
      item.addEventListener('click', () => {
          item.nextElementSibling.classList.toggle('active');
      });
  });

     