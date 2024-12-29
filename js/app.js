// UI Elements
const userDropdown = document.getElementById('userDropdown');
const loginButton = document.getElementById('loginButton');
const createPostBtn = document.getElementById('createPostBtn');
const userProfileName = document.getElementById('userProfileName');
const userAvatar = document.getElementById('userAvatar');
const createPostModal = document.getElementById('createPostModal');
const postsContainer = document.getElementById('postsContainer');
const alert = document.getElementById('alert');
const alertContent = document.getElementById('alertContent');
const alertMessage = document.getElementById('alertMessage');
const heroCreatePostBtn = document.getElementById('heroCreatePostBtn');

let currentUser = null;

// Auth state observer
auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        // User is signed in
        userDropdown.classList.remove('hidden');
        loginButton.classList.add('hidden');
        userProfileName.textContent = user.displayName || user.email;
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
        } else {
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}`;
        }
        createPostBtn.classList.remove('hidden');
    } else {
        // User is signed out
        userDropdown.classList.add('hidden');
        loginButton.classList.remove('hidden');
        createPostBtn.classList.add('hidden');
    }
    
    // Load posts
    loadPosts();
});

// Logout function
window.logout = async function() {
    try {
        await auth.signOut();
        showAlert('Logged out successfully', 'success');
        window.location.href = 'login.html';
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Show/Hide Create Post Modal
window.showCreatePostModal = () => {
    if (!auth.currentUser) {
        showAlert('Please login to create a post', 'warning');
        window.location.href = 'login.html';
        return;
    }
    if (createPostModal) {
        createPostModal.showModal();
    } else {
        console.error('Modal element not found');
        showAlert('Error opening post form', 'error');
    }
};

window.closeCreatePostModal = () => {
    if (createPostModal) {
        createPostModal.close();
    }
};

// Quick Fill Post (for testing)
window.quickFillPost = () => {
    document.getElementById('postTitle').value = 'My First Blog Post';
    document.getElementById('postCategory').value = 'Technology';
    document.getElementById('postContent').value = 'This is a sample blog post content. I am testing the blogging platform!';
    document.getElementById('postImage').value = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80';
};

// Create Post Function
window.createPost = async () => {
    if (!auth.currentUser) {
        showAlert('Please login to create a post', 'warning');
        window.location.href = 'login.html';
        return;
    }

    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value;
    const imageUrl = document.getElementById('postImage').value;

    if (!title || !category || !content) {
        showAlert('Please fill all required fields', 'error');
        return;
    }

    try {
        await window.blogOperations.createPost({
            title,
            category,
            content,
            imageUrl,
            authorId: auth.currentUser.uid,
            authorName: auth.currentUser.displayName || 'Anonymous',
            createdAt: new Date().toISOString()
        });

        showAlert('Post created successfully!', 'success');
        closeCreatePostModal();
        // Clear form
        document.getElementById('postTitle').value = '';
        document.getElementById('postCategory').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('postImage').value = '';
        loadPosts(); // Refresh posts
    } catch (error) {
        console.error('Error creating post:', error);
        showAlert('Error creating post. Please try again.', 'error');
    }
};

// Redirect to Admin Page
window.redirectToAdmin = () => {
    if (!auth.currentUser) {
        showAlert('Please login to create a post', 'warning');
        window.location.href = 'login.html';
        return;
    }
    window.location.href = 'admin.html#create';
};

// Show Alert
window.showAlert = (message, type = 'info') => {
    const alert = document.getElementById('alert');
    const alertContent = document.getElementById('alertContent');
    const alertMessage = document.getElementById('alertMessage');

    alertContent.className = 'alert';
    if (type === 'error') alertContent.classList.add('alert-error');
    if (type === 'success') alertContent.classList.add('alert-success');
    if (type === 'warning') alertContent.classList.add('alert-warning');

    alertMessage.textContent = message;
    alert.classList.remove('hidden');

    setTimeout(() => {
        alert.classList.add('hidden');
    }, 3000);
};

// Load Posts
async function loadPosts() {
    postsContainer.innerHTML = '<div class="text-center p-8"><span class="loading loading-spinner loading-lg"></span></div>';
    
    window.blogOperations.getAllPosts((posts) => {
        if (posts.length === 0) {
            postsContainer.innerHTML = '<div class="text-center p-8">No posts yet. Be the first to create one!</div>';
            return;
        }

        // Sort posts by timestamp (newest first)
        posts.sort((a, b) => b.timestamp - a.timestamp);

        postsContainer.innerHTML = posts.map(post => `
            <div class="card bg-base-100 shadow-xl mb-6">
                <figure><img src="${post.imageUrl}" alt="${post.title}" onerror="this.src='https://picsum.photos/800/400'" /></figure>
                <div class="card-body">
                    <h2 class="card-title">${post.title}</h2>
                    <div class="badge badge-secondary">${post.category}</div>
                    <p>${post.content}</p>
                    <div class="card-actions justify-between items-center">
                        <div class="text-sm opacity-70">
                            Posted by ${post.author} • ${new Date(post.timestamp).toLocaleDateString()}
                        </div>
                        ${currentUser && currentUser.uid === post.authorId ? `
                            <div>
                                <button class="btn btn-sm btn-error" onclick="deletePost('${post.id}')">Delete</button>
                                <button class="btn btn-sm btn-primary" onclick="editPost('${post.id}')">Edit</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// Filter posts by category
window.filterByCategory = function(category) {
    postsContainer.innerHTML = '<div class="text-center p-8"><span class="loading loading-spinner loading-lg"></span></div>';
    
    window.blogOperations.getPostsByCategory(category, (posts) => {
        if (posts.length === 0) {
            postsContainer.innerHTML = `<div class="text-center p-8">No posts found in category: ${category}</div>`;
            return;
        }

        // Sort posts by timestamp (newest first)
        posts.sort((a, b) => b.timestamp - a.timestamp);

        postsContainer.innerHTML = posts.map(post => `
            <div class="card bg-base-100 shadow-xl mb-6">
                <figure><img src="${post.imageUrl}" alt="${post.title}" onerror="this.src='https://picsum.photos/800/400'" /></figure>
                <div class="card-body">
                    <h2 class="card-title">${post.title}</h2>
                    <div class="badge badge-secondary">${post.category}</div>
                    <p>${post.content}</p>
                    <div class="card-actions justify-between items-center">
                        <div class="text-sm opacity-70">
                            Posted by ${post.author} • ${new Date(post.timestamp).toLocaleDateString()}
                        </div>
                        ${currentUser && currentUser.uid === post.authorId ? `
                            <div>
                                <button class="btn btn-sm btn-error" onclick="deletePost('${post.id}')">Delete</button>
                                <button class="btn btn-sm btn-primary" onclick="editPost('${post.id}')">Edit</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// Delete post
window.deletePost = async function(postId) {
    if (!currentUser) {
        showAlert('Please login to delete posts', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this post?')) {
        try {
            const result = await window.blogOperations.deletePost(postId);
            if (result.success) {
                showAlert('Post deleted successfully!', 'success');
                loadPosts();
            } else {
                showAlert(result.error, 'error');
            }
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
}

// Initial load
loadPosts();
