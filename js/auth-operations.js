import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { auth, database } from './firebase-config.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Login function
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            }
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Signup function
export async function signupUser(email, password, name, phone) {
    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, {
            displayName: name
        });

        // Save additional user data to Realtime Database
        await set(ref(database, 'users/' + user.uid), {
            name: name,
            email: email,
            phone: phone,
            createdAt: Date.now()
        });

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: name
            }
        };
    } catch (error) {
        console.error("Signup error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
