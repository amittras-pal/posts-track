import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { CreateInstagramPost, InstagramPost } from "../types";

const COLLECTION_NAME = "InstaPosts";

export const firestoreService = {
  // Add a new Instagram post
  async addPost(postData: CreateInstagramPost): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...postData,
        createdAt: new Date(),
        postedAt: postData.isPosted ? new Date() : null,
        scheduledFor: postData.scheduledFor
          ? Timestamp.fromDate(postData.scheduledFor)
          : null,
      });
      console.log("Document written with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
    }
  },

  /**
   * Get all posts from Firestore
   * TODO: DEAD CODE - This method is not used anywhere in the codebase
   */
  async getAllPosts(): Promise<InstagramPost[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const posts: InstagramPost[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          postedAt: data.postedAt?.toDate() || null,
          scheduledFor: data.scheduledFor?.toDate() || null,
        } as InstagramPost);
      });

      return posts;
    } catch (error) {
      console.error("Error getting documents: ", error);
      throw error;
    }
  },

  // Subscribe to real-time updates for unposted Instagram posts
  subscribeToUnpostedPosts(
    callback: (posts: InstagramPost[]) => void
  ): () => void {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("isPosted", "==", false),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const posts: InstagramPost[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          posts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            postedAt: data.postedAt?.toDate() || null,
            scheduledFor: data.scheduledFor?.toDate() || null,
          } as InstagramPost);
        });

        callback(posts);
      },
      (error) => {
        console.error("Error in real-time subscription: ", error);
      }
    );

    return unsubscribe;
  },

  // Update an existing post
  async updatePost(
    id: string,
    updateData: Partial<CreateInstagramPost> & { postedAt?: Date | null }
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date(),
        scheduledFor: updateData.scheduledFor
          ? Timestamp.fromDate(updateData.scheduledFor)
          : null,
        postedAt: updateData.postedAt
          ? Timestamp.fromDate(updateData.postedAt)
          : null,
      });
      console.log("Document updated successfully");
    } catch (error) {
      console.error("Error updating document: ", error);
      throw error;
    }
  },
};
