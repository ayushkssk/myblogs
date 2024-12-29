import { ref, push, set, get, remove, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from './firebase-config.js';

// Blog operations
export const blogOperations = {
    // Add a new post
    async addPost(postData) {
        try {
            const postsRef = ref(database, 'posts');
            const newPostRef = push(postsRef);
            
            await set(newPostRef, {
                ...postData,
                id: newPostRef.key,
                timestamp: Date.now()
            });

            return { success: true };
        } catch (error) {
            console.error("Error adding post:", error);
            return { success: false, error: error.message };
        }
    },

    // Get all posts
    getAllPosts(callback) {
        const postsRef = ref(database, 'posts');
        get(postsRef).then((snapshot) => {
            const posts = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    posts.push(childSnapshot.val());
                });
            }
            callback(posts);
        }).catch((error) => {
            console.error("Error getting posts:", error);
            callback([]);
        });
    },

    // Get posts by category
    getPostsByCategory(category, callback) {
        const postsRef = ref(database, 'posts');
        const categoryQuery = query(postsRef, orderByChild('category'), equalTo(category));
        
        get(categoryQuery).then((snapshot) => {
            const posts = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    posts.push(childSnapshot.val());
                });
            }
            callback(posts);
        }).catch((error) => {
            console.error("Error getting posts by category:", error);
            callback([]);
        });
    },

    // Delete a post
    async deletePost(postId) {
        try {
            const postRef = ref(database, `posts/${postId}`);
            await remove(postRef);
            return { success: true };
        } catch (error) {
            console.error("Error deleting post:", error);
            return { success: false, error: error.message };
        }
    }
};

// Comments operations
export const commentOperations = {
    // टिप्पणी जोड़ें
    addComment: async function(postId, commentData) {
        try {
            const commentsRef = ref(database, `comments/${postId}`);
            const newCommentRef = push(commentsRef);
            await set(newCommentRef, {
                text: commentData.text,
                author: commentData.author,
                timestamp: Date.now()
            });
            return { success: true, commentId: newCommentRef.key };
        } catch (error) {
            console.error('Error adding comment:', error);
            return { success: false, error: error.message };
        }
    },

    // पोस्ट की सभी टिप्पणियां प्राप्त करें
    getComments: function(postId, callback) {
        const commentsRef = ref(database, `comments/${postId}`);
        onValue(commentsRef, (snapshot) => {
            const comments = [];
            snapshot.forEach((childSnapshot) => {
                comments.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            callback(comments);
        });
    }
};

// Usage Examples:
/*
// नया पोस्ट जोड़ें
blogOperations.addPost({
    title: "मेरा पहला ब्लॉग पोस्ट",
    content: "यह मेरा पहला ब्लॉग पोस्ट है...",
    category: "Technology",
    imageUrl: "image-url",
    author: "Ayush"
}).then(result => {
    if(result.success) {
        console.log('Post added successfully!');
    }
});

// सभी पोस्ट्स प्राप्त करें
blogOperations.getAllPosts((posts) => {
    posts.forEach(post => {
        console.log(post.title);
    });
});

// टिप्पणी जोड़ें
commentOperations.addComment('post-id', {
    text: "बहुत अच्छा लेख!",
    author: "Visitor"
});
*/
