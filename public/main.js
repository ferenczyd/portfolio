window.addEventListener('scroll', function() {
    var scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    var newSize = Math.max(100, 200 - scrollPosition); // 100 is the minimum size, 200 is the initial size
    document.querySelector('.profile-pic').style.height = newSize + 'px';
  });