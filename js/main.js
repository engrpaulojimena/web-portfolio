document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (!target) return;

        e.preventDefault();

        const nav = document.querySelector('.navbar');
        const navHeight = nav.offsetHeight;
        const targetPosition = target.offsetTop - navHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});
