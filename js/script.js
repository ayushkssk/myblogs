$(document).ready(function() {
    // Initialize EasyUI components
    $('.easyui-layout').layout();
    $('#category-tree').tree({
        onClick: function(node) {
            // Handle category click
            if (node.children) {
                $(this).tree(node.state === 'closed' ? 'expand' : 'collapse', node.target);
            } else {
                // Load posts for the selected category
                loadPosts(node.text);
            }
        }
    });

    // Function to load posts (simulate for now)
    function loadPosts(category) {
        $('.blog-post').hide();
        setTimeout(function() {
            $('.blog-post').fadeIn();
            $.messager.show({
                title: 'Category Selected',
                msg: 'Loading posts for category: ' + category,
                timeout: 2000,
                showType: 'slide'
            });
        }, 500);
    }

    // Add search functionality
    $('#search').searchbox({
        searcher: function(value) {
            $.messager.progress({
                title: 'Please wait',
                msg: 'Searching for: ' + value
            });
            
            setTimeout(function() {
                $.messager.progress('close');
                $.messager.alert('Search', 'Search results for: ' + value);
            }, 1000);
        },
        prompt: 'Search blog...'
    });
});

// Theme switching
document.querySelector('.theme-controller').addEventListener('change', function(e) {
    const html = document.querySelector('html');
    if (e.target.checked) {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Mobile menu functionality
const mobileMenuBtn = document.querySelector('.lg\\:hidden');
const mobileMenu = document.querySelector('.dropdown-content');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Add animation to cards on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
});