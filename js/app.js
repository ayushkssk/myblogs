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
window.showCreatePostModal = function() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    createPostModal.showModal();
}

window.closeCreatePostModal = function() {
    createPostModal.close();
}

// Create Post
window.createPost = async function() {
    if (!currentUser) {
        showAlert('Please login to create a post', 'error');
        return;
    }

    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const category = document.getElementById('postCategory').value;
    const imageUrl = document.getElementById('postImage').value || 'https://picsum.photos/800/400';

    if (!title || !content || !category) {
        showAlert('Please fill all required fields', 'error');
        return;
    }

    try {
        const result = await window.blogOperations.addPost({
            title,
            content,
            category,
            imageUrl,
            author: currentUser.displayName || currentUser.email,
            authorId: currentUser.uid
        });

        if (result.success) {
            showAlert('Post created successfully!', 'success');
            closeCreatePostModal();
            loadPosts();
            // Reset form
            document.getElementById('postTitle').value = '';
            document.getElementById('postContent').value = '';
            document.getElementById('postCategory').value = '';
            document.getElementById('postImage').value = '';
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

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

// Show alert message
function showAlert(message, type = 'error') {
    alert.classList.remove('hidden');
    alertContent.classList.remove('alert-error', 'alert-success');
    alertContent.classList.add(`alert-${type}`);
    alertMessage.textContent = message;
    
    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

// Initial load
loadPosts();
