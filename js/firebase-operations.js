import { ref, push, set, get, update, remove, query, orderByChild, equalTo, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from './firebase-config.js';

// Blog posts operations
export const blogOperations = {
    // नया ब्लॉग पोस्ट जोड़ें
    addPost: async function(postData) {
        try {
            const postsRef = ref(database, 'posts');
            const newPostRef = push(postsRef);
            await set(newPostRef, {
                title: postData.title,
                content: postData.content,
                category: postData.category,
                imageUrl: postData.imageUrl,
                author: postData.author,
                timestamp: Date.now()
            });
            return { success: true, postId: newPostRef.key };
        } catch (error) {
            console.error('Error adding post:', error);
            return { success: false, error: error.message };
        }
    },

    // सभी ब्लॉग पोस्ट्स प्राप्त करें
    getAllPosts: function(callback) {
        const postsRef = ref(database, 'posts');
        onValue(postsRef, (snapshot) => {
            const posts = [];
            snapshot.forEach((childSnapshot) => {
                posts.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            callback(posts);
        });
    },

    // श्रेणी के अनुसार पोस्ट्स प्राप्त करें
    getPostsByCategory: function(category, callback) {
        const postsRef = ref(database, 'posts');
        const categoryQuery = query(postsRef, orderByChild('category'), equalTo(category));
        onValue(categoryQuery, (snapshot) => {
            const posts = [];
            snapshot.forEach((childSnapshot) => {
                posts.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            callback(posts);
        });
    },

    // एक पोस्ट अपडेट करें
    updatePost: async function(postId, updateData) {
        try {
            const postRef = ref(database, `posts/${postId}`);
            await update(postRef, updateData);
            return { success: true };
        } catch (error) {
            console.error('Error updating post:', error);
            return { success: false, error: error.message };
        }
    },

    // एक पोस्ट डिलीट करें
    deletePost: async function(postId) {
        try {
            const postRef = ref(database, `posts/${postId}`);
            await remove(postRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting post:', error);
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
