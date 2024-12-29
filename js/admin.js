// DOM Elements
const postModal = document.getElementById('postModal');
const deleteModal = document.getElementById('deleteModal');
const userDropdown = document.getElementById('userDropdown');
const loginButton = document.getElementById('loginButton');
const userProfileName = document.getElementById('userProfileName');
const userAvatar = document.getElementById('userAvatar');
const modalTitle = document.getElementById('modalTitle');

// Show/Hide Post Modal
window.showCreatePostModal = () => {
    if (!auth.currentUser) {
        showAlert('Please login to create a post', 'warning');
        window.location.href = 'login.html';
        return;
    }
    modalTitle.textContent = 'Create New Post';
    document.getElementById('postId').value = '';
    document.getElementById('postTitle').value = '';
    document.getElementById('postCategory').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postImage').value = '';
    document.getElementById('postStatus').checked = true;
    postModal.showModal();
};

window.showEditPostModal = (post) => {
    modalTitle.textContent = 'Edit Post';
    document.getElementById('postId').value = post.id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postImage').value = post.imageUrl || '';
    document.getElementById('postStatus').checked = post.status !== 'draft';
    postModal.showModal();
};

window.closePostModal = () => {
    postModal.close();
};

// Show/Hide Delete Modal
window.showDeleteModal = (postId) => {
    document.getElementById('deletePostId').value = postId;
    deleteModal.showModal();
};

window.closeDeleteModal = () => {
    deleteModal.close();
};

// Quick Fill Post (for testing)
window.quickFillPost = () => {
    document.getElementById('postTitle').value = 'My First Blog Post';
    document.getElementById('postCategory').value = 'Technology';
    document.getElementById('postContent').value = 'This is a sample blog post content. I am testing the blogging platform!';
    document.getElementById('postImage').value = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80';
};

// Save Post (Create/Update)
window.savePost = async () => {
    if (!auth.currentUser) {
        showAlert('Please login to manage posts', 'warning');
        window.location.href = 'login.html';
        return;
    }

    const postId = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value;
    const imageUrl = document.getElementById('postImage').value;
    const status = document.getElementById('postStatus').checked ? 'published' : 'draft';

    if (!title || !category || !content) {
        showAlert('Please fill all required fields', 'error');
        return;
    }

    try {
        const postData = {
            title,
            category,
            content,
            imageUrl,
            status,
            authorId: auth.currentUser.uid,
            authorName: auth.currentUser.displayName || 'Anonymous',
            updatedAt: new Date().toISOString()
        };

        if (postId) {
            // Update existing post
            await window.blogOperations.updatePost(postId, postData);
            showAlert('Post updated successfully!', 'success');
        } else {
            // Create new post
            postData.createdAt = new Date().toISOString();
            await window.blogOperations.createPost(postData);
            showAlert('Post created successfully!', 'success');
        }

        closePostModal();
        loadPosts();
    } catch (error) {
        console.error('Error saving post:', error);
        showAlert('Error saving post. Please try again.', 'error');
    }
};

// Delete Post
window.confirmDelete = async () => {
    const postId = document.getElementById('deletePostId').value;
    
    try {
        await window.blogOperations.deletePost(postId);
        showAlert('Post deleted successfully!', 'success');
        closeDeleteModal();
        loadPosts();
    } catch (error) {
        console.error('Error deleting post:', error);
        showAlert('Error deleting post. Please try again.', 'error');
    }
};

// Upload Image
window.uploadImage = async () => {
    const fileInput = document.getElementById('postImageFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Please select an image to upload', 'warning');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showAlert('Please select a valid image file', 'error');
        return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showAlert('Image size should be less than 5MB', 'error');
        return;
    }

    try {
        showAlert('Uploading image...', 'info');
        const result = await window.storageOperations.uploadImage(file);
        
        if (result.success) {
            document.getElementById('postImage').value = result.url;
            showAlert('Image uploaded successfully!', 'success');
        } else {
            showAlert('Error uploading image: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        showAlert('Error uploading image. Please try again.', 'error');
    }
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

// Load Posts for Admin Table
async function loadPosts() {
    const postsTableBody = document.getElementById('postsTableBody');
    postsTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <span class="loading loading-spinner loading-lg text-primary"></span>
            </td>
        </tr>
    `;

    try {
        const posts = await window.blogOperations.getPosts();
        
        // Update stats
        document.getElementById('totalPosts').textContent = posts.length;
        
        if (posts.length === 0) {
            postsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <p class="text-gray-500">No posts found. Create your first post!</p>
                    </td>
                </tr>
            `;
            return;
        }

        postsTableBody.innerHTML = posts.map(post => `
            <tr>
                <td>
                    <div class="flex items-center gap-2">
                        ${post.imageUrl ? `
                            <div class="avatar">
                                <div class="w-12 h-12 rounded">
                                    <img src="${post.imageUrl}" alt="${post.title}" />
                                </div>
                            </div>
                        ` : ''}
                        <div class="font-bold">${post.title}</div>
                    </div>
                </td>
                <td>${post.category}</td>
                <td>${new Date(post.createdAt).toLocaleDateString()}</td>
                <td>${post.views || 0}</td>
                <td>
                    <div class="badge ${post.status === 'published' ? 'badge-success' : 'badge-warning'}">
                        ${post.status || 'published'}
                    </div>
                </td>
                <td>
                    <div class="flex gap-2">
                        <button class="btn btn-square btn-sm btn-ghost" onclick='showEditPostModal(${JSON.stringify(post)})'>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-square btn-sm btn-ghost text-error" onclick="showDeleteModal('${post.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        postsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <p class="text-error">Error loading posts. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

// Auth State Change Handler
auth.onAuthStateChanged((user) => {
    if (user) {
        userDropdown.classList.remove('hidden');
        loginButton.classList.add('hidden');
        userProfileName.textContent = user.displayName || user.email;
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
        }
        loadPosts();
    } else {
        userDropdown.classList.add('hidden');
        loginButton.classList.remove('hidden');
        window.location.href = 'login.html'; // Redirect to login if not authenticated
    }
});

// Logout Function
window.logout = async () => {
    try {
        await auth.signOut();
        showAlert('Logged out successfully!', 'success');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error logging out:', error);
        showAlert('Error logging out. Please try again.', 'error');
    }
};

// Initial Load
if (auth.currentUser) {
    loadPosts();
    // Auto-open create post modal if redirected from home page
    if (window.location.hash === '#create') {
        window.location.hash = '';
        setTimeout(() => {
            showCreatePostModal();
        }, 500);
    }
}
